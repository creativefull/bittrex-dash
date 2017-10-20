const mode = process.env.NODE_ENV || 'development'
const config = require(__dirname + '/../config/api_key.json')[mode]

const bittrex = require('node-bittrex-api')
bittrex.options({
	apikey : config.api_key,
	apisecret : config.api_secret
})

let buyCoinIfPercentageUpBy = 0.03
let buyCoinIfPercentageUpOverXTimeUnits = 6
let buyIfPriceUpOverLastWTimeUnits = 3
let dontBuyIfPercentageDownBy = 0.1
let dontBuyIfPercentageDownOverYTimeUnits = 5
let dontBuyIfPriceDownOverLastZTimeUnits = 3

exports.getmarket = (cermai) => {
	global.cermai = cermai
	getmarketCalculate((result) => {
		console.log(result)
	})
}

let getmarketCalculate = (callback) => {
	bittrex.getmarketsummaries((data, error) => {
		if (error) return console.error(error)
		data.result.forEach((dataMarket) => {
			const history_price = cermai.db.collection('history_price')

			dataMarket.changeSincePrevious = (dataMarket.Last - dataMarket.PrevDay) / dataMarket.PrevDay
			history_price.find({MarketName : dataMarket.MarketName}).count((err, count) => {
				// GET Y TIMES UNIT
				let skipY = (count + 1) - dontBuyIfPercentageDownOverYTimeUnits
				// console.log(skipY)
				skipY = skipY < 0 ? (dontBuyIfPercentageDownOverYTimeUnits - 1) : skipY == 0 ? skipY : skipY - 1

				// GET X TIMES UNIT
				let skipX = (count + 1) - buyCoinIfPercentageUpOverXTimeUnits
				skipX = skipX < 0 ? buyCoinIfPercentageUpOverXTimeUnits - 1 : skipX == 0 ? skipX : skipX - 1

				dataMarket.indexCount = count+1
				// console.log("SKIP Y", skipY)
				history_price.find({MarketName : dataMarket.MarketName}).skip(skipY).limit(1).toArray((err, results) => {
					if (err) return console.error(err)
					// console.log(results)
					if (results.length > 0) {
						let percentageChangeSinceYTimeUnitsAgo = results[0].Last
						dataMarket.percentageChangeSinceYTimeUnitsAgo = (dataMarket.Last - percentageChangeSinceYTimeUnitsAgo) / percentageChangeSinceYTimeUnitsAgo
					} else {
						dataMarket.percentageChangeSinceYTimeUnitsAgo = -0
					}

					// console.log("SKIP X", skipX)
					history_price.find({MarketName : dataMarket.MarketName}).skip(skipX).limit(1).toArray((err, resultsX) => {
						if (err) return console.error(err)
						if (resultsX.length > 0) {
							let percentageChangeSinceXTimeUnitsAgo = results[0].Last
							dataMarket.percentageChangeSinceXTimeUnitsAgo = (dataMarket.Last - percentageChangeSinceXTimeUnitsAgo) / percentageChangeSinceXTimeUnitsAgo
						} else {
							dataMarket.percentageChangeSinceXTimeUnitsAgo = -0
						}

						// console.log(dataMarket)
						history_price.insert(dataMarket, (err, inserted) => {
							console.log("Data market inserted to database")
							return callback(dataMarket)
						})
					})
				})
			})
		})
		// console.log(dataMarket)
	})
}

let buyCalculate = (callback) => {
	const history_price = cermai.db.collection('history_price')
	const history_buy = cermai.db.collection('history_buy')

	let limit = buyIfPriceUpOverLastWTimeUnits <= 0 ? 0 : buyIfPriceUpOverLastWTimeUnits-1
	let buy = false

	bittrex.getmarkets((markets) => {
		markets.result.forEach((dataMarket) => {
			history_price.find({MarketName : dataMarket.MarketName}).sort({_id : -1}).limit(limit).toArray((err, results) => {
				if (err) console.error(err)
				if (results.length > 0) {
					let countFalls = 0
					// 1ST CHECK
					if (results[0].percentageChangeSinceXTimeUnitsAgo >= buyCoinIfPercentageUpBy) {
						console.log("BUY IN 1ST CHECK")
						buy = true
					}

					// 2ND CHECK
					results.forEach((result) => {
						if (result.changeSincePrevious < 0) {
							console.log("NOT PASSED 2ND CHECK")
							buy = false
							countFalls += 1
						}
					})

					// 3RD CHECK
					if (results[0].percentageChangeSinceYTimeUnitsAgo < (-1*dontBuyIfPercentageDownBy)) {
						console.log("NOT PASSED 3RD CHECK")
						buy = false
					}

					// 4TH CHECK
					if (countFalls == dontBuyIfPriceDownOverLastZTimeUnits) {
						console.log("NOT PASSED 4TH CHECK")
						buy = false
					}

					if (buy) {
						history_buy.insert({MarketName : data.MarketName, created_at : new Date()})
					}
					console.log("BUY ? ", dataMarket.MarketName, buy)
				}
			})
		})

		callback()
	})
}