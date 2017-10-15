module.exports = exports = function(cermai) {
	var WelcomeHandler = require('./routes/welcome'), Welcome = new WelcomeHandler();

	cermai.get('/', Welcome.index);
	cermai.get('/bittrex', Welcome.bittrex);
}