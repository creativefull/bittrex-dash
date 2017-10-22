function Welcome(db) {
	this.index = function(req,res,next) {
		res.render('welcome');
	}

	this.bittrex = (req,res,next) => {
		const {getmarket} = require(__dirname + '/../cron/bittrex')
		getmarket({cermai : {db : db}})
		res.send("Bittrex");
	}

	this.SaveBuy = (req, res, next) => {
		const b = req.body;
		console.log(b);
		return res.json(b);
	}
}
module.exports = Welcome;