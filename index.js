var server = require('./system/server'), cermai = new server();
const {getMarket} = require(__dirname + '/cron/bittrex.js');
var cron = require('cron').CronJob

cermai.connect(function(err, db) {
	if (err) console.log(err);

	///// INSTALL CERMAI HELPER ///////
	cermai.initHelper(cermai.app);
	///// INSTALL CERMAI SESSION //////
	cermai.initSession(cermai.app);
	//// INSTALATION CERMAI ////
	cermai.initCermai(cermai.app, db);
	//// RUN CERMAI APP /////
	cermai.run();

	// RUN CRONJOB
	new cron('* * 1 * * *', () => {
		getMarket()
	}, () => console.log("[" + new Date() + "] Complete Cron"), true, 'America/Los_Angeles')
})