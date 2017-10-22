module.exports = exports = function(cermai , db) {
	var WelcomeHandler = require('./routes/welcome'), Welcome = new WelcomeHandler(cermai);

	// cermai.get('/', Welcome.index);
	// cermai.get('/tes', Welcome.index);
	cermai.post('/save/buy', Welcome.SaveBuy);
	cermai.get('/bittrex', Welcome.bittrex);
}