function Welcome(db) {
	const ModelConfigBuy = db.collection('configBuy');
	const ModelConfig = db.collection('config');
	const ModelLog = db.collection('logs');
	const ModelHistory = db.collection('history_price');
	const async = require('async');

	this.index = function(req,res,next) {
		res.render('welcome');
	}

	this.bittrex = (req,res,next) => {
		const {getmarket} = require(__dirname + '/../cron/bittrex')
		getmarket({cermai : {db : db}})
		res.send("Bittrex");
	}

	this.clearLogs = (req, res, next) => {
		ModelLog.remove({}, (err, rows) => {
			return res.json({status : 200 });
		});
	}

	this.SaveBuy = (req, res, next) => {
		const b = req.body;
		ModelConfigBuy.findOne({_id : "1"}, (err, cek) => {
			if (cek == null) {
				b['_id'] = "1";
				ModelConfigBuy.insert(b, (err, rows) => {
					return res.json({status : 200});
				});
			} else {
				ModelConfigBuy.update({_id : "1"},{ $set : b}, (err, rows) => {
					return res.json({status : 200});
				});
			}
		});
	}

	this.getConfigData = (req, res, next) => {
		async.parallel([
			function (callback) {
				ModelConfigBuy.findOne({}, (err, rows) => {
					callback(err, rows);
				});
			},
			function (callback) {
				ModelConfig.findOne({}, (err, row) => {
					return callback(err, row);
				});
			},
			function (callback) {
				ModelLog.find({}).sort({created_at : -1 }).limit(5).toArray(function (err, rows) {
					return callback(err, rows);
				});
			},
			function (callback) {
				ModelHistory.find({}).sort({Created : -1}).limit(20).toArray(function (err, rows) {
					return callback(err, rows);
				});
			}
		], (err, results) => {
			if (err) return res.json({status : 404});
			let output = results[0];
			if (results[1].pause != undefined ) {
				output['pause'] = results[1].pause;
			}
			if (results[1].demo != undefined ) {
				output['demo'] = results[1].demo;
			}
			return res.json({status : 200, data : output, logs : results[2], dataHistory : results[3], runningCronEvery : results[1].runningCronEvery});
		});
	}

	this.SaveCron = (req, res, next) => {
		var b = req.body;
		ModelConfig.findOne({},(err, cek) => {
			if (cek == null) {
				b['_id'] = '1';
				ModelConfig.insert(b, (err, rows) => {
					return res.json({status : 200});
				});
			} else {
				ModelConfig.update({_id : '1'}, {$set : b} , (err, rows) => {
					return res.json({status : 200});
				});
			}
		});
	}

	this.SaveCronConfig = (req, res, next) => {
		let b = req.body;
		var target = __dirname + '/../config/cron.json';
		const jsonfile = require('jsonfile');
		ModelConfig.findOne({},(err, cek) => {
			let dataToWrite = {
				time : parseInt(b.runningCronEvery)
			}
			jsonfile.writeFile(target, dataToWrite, function (err) {
				if (cek == null) {
					b['_id'] = '1';
					ModelConfig.insert(b, (err, rows) => {
						return res.json({status : 200});
					});
				} else {
					ModelConfig.update({_id : '1'}, {$set : b} , (err, rows) => {
						return res.json({status : 200});
					});
				}
			})
		});
	}
}
module.exports = Welcome;