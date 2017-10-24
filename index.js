var server = require('./system/server'), cermai = new server();
const {getMarket, sellCalculate} = require(__dirname + '/cron/bittrex.js');
const cron = require('cron').CronJob

cermai.connect(function(err, db) {
	if (err) console.log(err);
	const ModelConfig = db.collection('config');

	///// INSTALL CERMAI HELPER ///////
	cermai.initHelper(cermai.app);
	///// INSTALL CERMAI SESSION //////
	cermai.initSession(cermai.app);
	//// INSTALATION CERMAI ////
	cermai.initCermai(cermai.app, db);
	//// RUN CERMAI APP /////
	cermai.run();

	// RUN CRONJOB

	// run cron jon  1 jam
	new cron('* 59 * * * *', () => {
		ModelConfig.findOne({} , (err, rows) => {
			if (rows.pause) {
				console.log('run cron');
				// getMarket({cermai : {db : db}})
			}
		})
	}, () => console.log("[" + new Date() + "] Complete Cron"), true, 'America/Los_Angeles');

	// run cron jon 24 jam
	new cron('* * 23 * * *', () => {
		ModelConfig.findOne({} , (err, rows) => {
			if (rows.pause) {
				console.log('run cron');
				sellCalculate();
			}
		})
	}, () => console.log("[" + new Date() + "] Complete Cron"), true, 'America/Los_Angeles');
})