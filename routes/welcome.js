function Welcome() {
	this.index = function(req,res,next) {
		res.render('welcome');
	}

	this.bittrex = (req,res,next) => {
		const {getmarket} = require(__dirname + '/../cron/bittrex')
		getmarket()
		res.send("Bittrex")
	}
}
module.exports = Welcome;