module.exports = exports = function(cermai , db) {
	var WelcomeHandler = require('./routes/welcome'), Welcome = new WelcomeHandler(db);

	// cermai.get('/', Welcome.index);
	// cermai.get('/tes', Welcome.index);
	cermai.post('/save/buy', Welcome.SaveBuy);
	cermai.post('/get/config/buy', Welcome.getConfigBuy);
	cermai.get('/bittrex', Welcome.bittrex);
}