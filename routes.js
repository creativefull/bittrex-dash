module.exports = exports = function(cermai , db) {
	var WelcomeHandler = require('./routes/welcome'), Welcome = new WelcomeHandler(db);

	// cermai.get('/', Welcome.index);
	// cermai.get('/tes', Welcome.index);
	cermai.post('/save/config', Welcome.SaveBuy);
	cermai.post('/save/cron', Welcome.SaveCron);
	cermai.post('/clear/log', Welcome.clearLogs);
	cermai.post('/get/config', Welcome.getConfigData);
	cermai.get('/bittrex', Welcome.bittrex);
}