module.exports = (function() {
    return {

        getQuote: function(req,res) {

            console.log("QUO [portfolios.js] need to get a quote: ",req.body);

			var yahooFinance = require('yahoo-finance');

			// yahooFinance.historical({
			//   symbol: 'AAPL',
			//   from: '2012-01-01',
			//   to: '2012-12-31',
			//   // period: 'd'  // 'd' (daily), 'w' (weekly), 'm' (monthly), 'v' (dividends only)
			// }, function (err, quotes) {
			// 	if (err != null) {
			// 	  console.log("historical err: "+err);
			// 	} else {
			// 		for (key in quotes) {
			// 		  console.log("historical quotes["+key+"]: "+quotes[key]);
			// 		  for (key2 in key) {
			// 		    console.log(quotes[key]+"["+key2+"]: "+quotes[key][key2]);

			// 		  }
			// 		}
			// 	}
			// });

			yahooFinance.snapshot(
				{
				    symbol: req.body.symbol,
				    fields: ['s', 'n', 'd1', 'l1', 'y', 'r'],
				    // OUTPUT:
					// [symbol]: AAPL
					// [name]: Apple Inc.
					// [lastTradeDate]: null
					// [lastTradePriceOnly]: 120.07
					// [dividendYield]: 1.7
					// [peRatio]: 14.92
				}, 
				function (error, results) {
					if (error != null) {
	                    console.log("QUO [portfolios.js] error: ",error);
					} else {
						console.log("QUO [portfolios.js] success, grabbed: ",results);
	                    res.json(results);
					}
				}
			);

        }


    }
})();