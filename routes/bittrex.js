function Bittrex (db) {
	const {sellCalculate} = require('../cron/bittrex.js');

	this.sellNow = (req, res, next) => {
		sellCalculate();
		return res.json("sukses");
	}
}

module.exports = Bittrex;