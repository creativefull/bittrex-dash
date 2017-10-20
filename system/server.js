var express = require('express'), app = express();
var mode = process.env.NODE_ENV || 'development';
mode = ['development','production'].indexOf(mode) < 0 ? 'development' : mode

var config = require('../config/config.json')[mode] || require('../config/config.json')['development'];
var mongoDB = require('mongodb').MongoClient;
var path = require('path');
var helper = require('./helper');
var userSession = require('./session');
var routes = require('../routes');
var ErrorHandler = require('./error');
var bodyParser = require('body-parser');
var logger = require('morgan');
const {setVariable, initVariable} = require('./global')
// SET GLOBAL VARIABLE
initVariable()

function CermaiJs() {
	this.app = app;
	// HANDLE ERROR
	new ErrorHandler().uncaughtException();
	this.run = function() {
		setVariable({key : 'mode', value : mode})

		config.app.host = process.env.NODE_HOST || config.app.host;
		config.app.port = process.env.NODE_PORT || process.env.PORT || config.app.port;

		if (config.app.host == undefined) {
			app.listen(config.app.port, function() {
				console.log("Application Running On *:" + config.app.port);
			});
		}
		else {
			app.listen(config.app.port, config.app.host, function() {
				console.log("Application Running On " + config.app.host + ":" + config.app.port);
			});
		}
	}

	this.connect = function(cb) {
		if (config.connection == undefined) {
			cb("connection null", null);
		}
		else if (config.connection.replica != null) {
			var sideList = config.connection.host + ':' + config.connection.port;
			config.connection.members.forEach(function(x) {
				sideList += "," + x.host + ':' + x.port;
			})
			if (config.connection.user == '' && config.connection.pwd == '') {
				mongoDB.connect('mongodb://' + sideList + '/' + config.connection.db, function(err, db) {
					cb(err, db);
				})
			}
			else {
				mongoDB.connect('mongodb://' + config.connection.user + ':' + config.connection.pwd + '@' + sideList + '/' + config.connection.db, function(err, db) {
					cb(err, db);
				})			
			}
		}
		else {
			if ((config.connection.user == '' || config.connection.user == undefined) && ( config.connection.pwd == '' || config.connection.pwd == undefined)) {
				var mongouri = process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://' + config.connection.host + ':' + config.connection.port + '/';
				mongoDB.connect(mongouri + config.connection.db, function(err, db) {
					cb(err, db);
				})
			}
			else {
				var mongouri = process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://' + config.connection.user + ':' + config.connection.pwd + '@' + config.connection.host + ':' + config.connection.port + '/';
				mongoDB.connect(mongouri + config.connection.db, function(err, db) {
					cb(err, db);
				})			
			}
		}
	}

	this.initCermai = function(cermai, db) {
		//// FOR POST REQUEST /////
		if (db == null) {
			console.log("CERMAI RUNNNIG WITHOUT CONNECTION");
		} else {
			setVariable({key : 'db', value : db})
		}

		if (mode == 'development') {
			cermai.use(logger("dev"));
		}
		app.use(bodyParser.json());
		app.use(bodyParser.urlencoded({ extended: false }));
		// ## SETTING VIEW ENGINE & CSS PRECOMPILER
		cermai.set('views', path.join(__dirname, '../views'));
		cermai.set('view engine', 'jade');
		cermai.use(require('stylus').middleware({
			src : __dirname + '/../src/style/',
			dest : __dirname + "/../public/style/",
			compress : true,
			debug : true
		}));
		cermai.use(express.static(path.join(__dirname, '../public')));
		// USING BOWER
		cermai.use("/bower", express.static(path.join(__dirname, '../bower_components')));
		
		// ## PANGGIL ROUTES
		////////// ERROR HANDLING ////////////////
		routes(cermai, db);
		cermai.use(new ErrorHandler().error404);
		cermai.use(new ErrorHandler().error500);
	}
	this.initHelper = function(cermai) {
		////////// AUTOLOAD HELPER ////////////////
		cermai.use(helper);
	}
	this.initSession = function(cermai) {
		var	session = require('express-session'),
			redisStore = require('connect-redis')(session),
			cookieParser = require('cookie-parser');
		var secretName = "cermaisession";
		if (config.session) {
			secretName = config.session.secret || "cermaisession";
		}
		cermai.use(cookieParser(secretName));
		if (config.redis != null) {
			var redis = require('redis').createClient();
			cermai.use(session(
				{
					secret : secretName,
					store : new redisStore({
						host : config.redis.host.toString(),
						port : config.redis.port,
						client : redis,
						db : config.redis.db,
						pass : config.redis.pwd.toString()
					}),
					resave : true
				}
			));			
		}
		else {
			cermai.use(session(
				{
					secret : secretName,
					store : '',
					saveUninitialized : false,
					resave : true
				}
			));			
		}
		cermai.use(userSession);
	}
	this.isAuth = function(req,res,next) {
		if (req.session.cermaiSession) {
			next();
		}
		else {
			res.redirect(config.page.login);
		}
	}
}

module.exports = CermaiJs;