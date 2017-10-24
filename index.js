var server = require('./system/server'), cermai = new server();
// const {getMarket} = require(__dirname + '/cron/bittrex.js');
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
	// new cron('* * 1 * * *', () => {
	// getMarket({cermai : {db : db}})
	new cron('* * * * * *', () => {
		ModelConfig.findOne({} , (err, rows) => {
			if (rows.pause) {
				console.log('run cron');
			}
		})
	}, () => console.log("[" + new Date() + "] Complete Cron"), true, 'America/Los_Angeles');
})