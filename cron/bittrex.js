console.log(__dirname)
const config = require(__dirname + '/../config/api_key.json')[cermai.mode]
const bittrex = require('node-bittrex-api')
bittrex.options({
	apikey : config.api_key,
	apisecret : config.api_secret
})

let buyCoinIfPercentageUpBy = 0.03
let buyCoinIfPercentageUpOverXTimeUnits = 24
let buyIfPriceUpOverLastWTimeUnits = 3
let dontBuyIfPercentageDownBy = 0.1
let dontBuyIfPercentageDownOverYTimeUnits = 5
let dontBuyIfPriceDownOverLastZTimeUnits = 3

exports.getmarket = () => {
	bittrex.getmarketsummaries((data, error) => {
		if (error) return console.error(error)
		const history_price = cermai.db.collection('history_price')

		let dataMarket = data.result[0]
		dataMarket.changeSincePrevious = (dataMarket.Last - dataMarket.PrevDay) / dataMarket.PrevDay
		history_price.count((err, count) => {
			let skip = (count + 1) - dontBuyIfPercentageDownOverYTimeUnits
			skip = (skip <= 0 ? dontBuyIfPercentageDownOverYTimeUnits : skip) - 2

			dataMarket.indexCount = count+1
			history_price.find({}).skip(skip).limit(1).toArray((err, results) => {
				if (err) return console.error(err)
				console.log(results)
				if (results.length > 0) {
					let percentageChangeSinceYTimeUnitsAgo = results[0].Last
					dataMarket.percentageChangeSinceYTimeUnitsAgo = (dataMarket.Last - percentageChangeSinceYTimeUnitsAgo) / percentageChangeSinceYTimeUnitsAgo
				} else {
					dataMarket.percentageChangeSinceYTimeUnitsAgo = ''
				}

				// console.log(dataMarket)
				history_price.insert(dataMarket, (err, inserted) => {
					console.log("Data market inserted to database")
				})
			})
		})
		// console.log(dataMarket)
	})
}