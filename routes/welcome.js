function Welcome(db) {
	const ModelConfigBuy = db.collection('configBuy');

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
		ModelConfigBuy.findOne({_id : "1"}, (err, cek) => {
			if (cek == null) {
				b['_id'] = "1";
				console.log('insert config');
				ModelConfigBuy.insert(b, (err, rows) => {
					// return res.json(b);
					return res.json({status : 200});
				});
			} else {
				console.log('update config');
				ModelConfigBuy.update({_id : "1"},b, (err, rows) => {
					return res.json({status : 200});
				});
			}
		})
	}

	this.getConfigBuy = (req, res, next) => {
		ModelConfigBuy.findOne({}, (err, rows) => {
			console.log(rows);
			if (rows == null) {
				return res.json({status : 404});
			} else {
				return res.json({status : 200 , data : rows});
			}
		})
	}
}
module.exports = Welcome;