module.exports = (function() {
    return {

        getQuote: function(req,res) {

            console.log("QUO [portfolios.js] need to get a quote: ",req.body);

			var yahooFinance = require('yahoo-finance');

			yahooFinance.snapshot(
				{
				    symbol: req.body.symbol,
					fields: ['s', 'n', 'l1', 'm6'],

					// EXAMPLE
					// fields: ['s', 'n', 'd1', 'l1', 'y', 'r'],
					// symbol: 'NFLX',
					// name: 'Netflix, Inc.',
					// lastTradeDate: null,
					// lastTradePriceOnly: 680.6,
					// dividendYield: null,
					// peRatio: 177.38

					// PRICING
					// fields: ['a', 'b', 'b2', 'b3', 'p', 'o'],
					// ask: 680.2,
					// bid: 677.5,
					// askRealtime: null,
					// bidRealtime: null,
					// previousClose: 670.09,
					// open: 682.45 }	

					// DIVIDENDS
					// fields: ['y', 'd', 'r1', 'q'],
					// dividendYield: null,
					// dividendPerShare: null,
					// dividendPayDate: null,
					// exDividendDate: null

					// DATE
					// fields: ['c1', 'c', 'c6', 'k2', 'p2', 'd1', 'd2', 't1'],
					// change: 10.51,
					// changeAndPercentChange: 0.1051,
					// changeRealtime: null,
					// changePercentRealtime: null,
					// changeInPercent: 0.015700000000000002,
					// lastTradeDate: null,
					// tradeDate: null,
					// lastTradeTime: '4:00pm'

					// AVERAGES
					// fields: ['c8', 'c3', 'g', 'h', 'k1', 'l', 'l1', 't8', 'm5', 'm6', 'm7', 'm8', 'm3', 'm4'],
					// afterHoursChangeRealtime: null,
					// commission: null,
					// daysLow: 678.3,
					// daysHigh: 689.52,
					// lastTradeRealtimeWithTime: null,
					// lastTradeWithTime: '4:00pm - <b>680.60</b>',
					// lastTradePriceOnly: 680.6,
					// '1YrTargetPrice': 642.95,
					// changeFrom200DayMovingAverage: 173.37,
					// percentChangeFrom200DayMovingAverage: 0.3418,
					// changeFrom50DayMovingAverage: 30.29,
					// percentChangeFrom50DayMovingAverage: 0.0466,
					// '50DayMovingAverage': 650.31,
					// '200DayMovingAverage': 507.23

					// MISC
					// fields: ['w1', 'w4', 'p1', 'm', 'm2', 'g1', 'g3', 'g4', 'g5', 'g6'],
					// daysValueChange: null,
					// daysValueChangeRealtime: null,
					// pricePaid: null,
					// daysRange: '678.30 - 689.52',
					// daysRangeRealtime: null,
					// holdingsGainPercent: null,
					// annualizedGain: null,
					// holdingsGain: null,
					// holdingsGainPercentRealtime: null,
					// holdingsGainRealtime: null

					// 52WEEK PRICING
					// fields: ['k', 'j', 'j5', 'k4', 'j6', 'k5', 'w'],
					// '52WeekHigh': 706.24,
					// '52WeekLow': 315.54,
					// changeFrom52WeekLow: 365.06,
					// changeFrom52WeekHigh: -25.64,
					// percentChangeFrom52WeekLow: 1.1569,
					// percebtChangeFrom52WeekHigh: -0.0363,
					// '52WeekRange': '315.54 - 706.24' 

					// SYSTEM INFO
				    // fields: ['i', 'j1', 'j3', 'f6', 'n', 'n4', 's1', 'x', 'j2'],
					// moreInfo: null,
					// marketCapitalization: '41.26B',
					// marketCapRealtime: null,
					// name: 'Netflix, Inc.',
					// notes: null,
					// sharesOwned: null,
					// stockExchange: 'NMS'

					// VOLUME
				    // fields: ['v', 'a5', 'b6', 'k3', 'a2'],
					// volume: 3090942, 
					// averageDailyVolume: 2866540

					// RATIO
				    // fields: ['e', 'e7', 'e8', 'e9', 'b4', 'j4', 'p5', 'p6', 'r', 'r2', 'r5', 'r6', 'r7', 's7'],
					// earningsPerShare: 3.84,
					// epsEstimateCurrentYear: 1.31,
					// epsEstimateNextYear: 3.1,
					// epsEstimateNextQuarter: 0.33,
					// bookValue: 31.49,
					// ebitda: '459.32M',
					// pricePerSales: 6.99,
					// pricePerBook: 21.28,
					// peRatio: 177.38,
					// peRatioRealtime: null,
					// pegRatio: 21.98,
					// pricePerEpsEstimateCurrentYear: 519.54,
					// pricePerEpsEstimateNextYear: 217.44,
					// shortRatio: '1.50'

					// MISC
				    // fields: ['t7', 't6', 'i5', 'l2', 'l3', 'v1', 'v7', 's6', 'e1'],
					// tickerTrend: null,
					// orderBookRealtime: null,
					// highLimit: null,
					// lowLimit: null,
					// holdingsValue: null,
					// holdingsValueRealtime: null

				}, 
				function (apiError, apiResults) {
					if (apiError != null) {
	                    console.log("QUO [portfolios.js] API ERROR: ", apiError);
	                    res.json({error: apiError});
					} else if (apiResults.name == null) {
						// console.log(apiResults);
						var appError = "ticker symbol was not found";
	                    console.log("QUO [portfolios.js] APP ERROR: ", appError);
	                    res.json({error: appError})
					} else {
						console.log("QUO [portfolios.js] success, grabbed: "+apiResults.symbol+"@"+apiResults.lastTradePriceOnly);
						// console.log(apiResults);
	                    res.json(apiResults);
					}
				}
			);

        }, // closes getQuote()

        getQuoteHistorical: function(req,res) {

            console.log("QUO-H [portfolios.js] need to get a historical quote: ",req.body);

			var yahooFinance = require('yahoo-finance');

			yahooFinance.historical({
				  symbol: req.body.symbol,
				  from: req.body.date,
				  to: req.body.date,
				  period: 'd'
				}, function (apiError, apiResults) {

					if (apiError != null) {
	                    console.log("QUO-H [portfolios.js] API ERROR: ", apiError);
	                    res.json({error: apiError});
					} else if (apiResults[0].symbol == null) {
						// console.log(apiResults);
						var appError = "ticker symbol was not found";
	                    console.log("QUO-H [portfolios.js] APP ERROR: ", appError);
	                    res.json({error: appError})
					} else {
						console.log("QUO-H [portfolios.js] success, grabbed: "+apiResults[0].symbol+"@"+apiResults[0].adjClose+" (idx="+req.body.dateIdx+")");
						// console.log(apiResults);
						apiResults[0].dateIdx = req.body.dateIdx;
						apiResults[0].baseline = req.body.baseline;
	                    res.json(apiResults[0]);
					}
				}
			);


		} // closes getQuoteHistorical()
    } // closes return
})();