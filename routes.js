module.exports = exports = function(cermai , db) {
	var WelcomeHandler = require('./routes/welcome'), Welcome = new WelcomeHandler(db);
	var BittrexHandler = require('./routes/bittrex'), Bittrex = new BittrexHandler(db);

	cermai.post('/save/config', Welcome.SaveBuy);
	cermai.post('/save/cron', Welcome.SaveCron);
	cermai.post('/save/config/cron', Welcome.SaveCronConfig);
	cermai.post('/clear/log', Welcome.clearLogs);
	cermai.post('/proses/sell', Bittrex.sellNow);
	cermai.post('/get/config', Welcome.getConfigData);
	cermai.get('/bittrex', Welcome.bittrex);
}