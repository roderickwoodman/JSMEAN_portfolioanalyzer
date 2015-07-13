var portfolios = require('./controllers/portfolios.js');


module.exports = function(app) {

	// FROM DASHBOARD VIEW
    app.post('/getQuote', function(request, response) {
        console.log("<<< GET QUOTE ROUTINE >>>");
        console.log("QUO [routes.js] need get a quote: ",request.body);
        portfolios.getQuote(request,response);
    });
    app.post('/getQuoteHistorical', function(request, response) {
        console.log("<<< GET QUOTE HISTORICAL ROUTINE >>>");
        console.log("QUO-H [routes.js] need get a historical quote: ",request.body);
        portfolios.getQuoteHistorical(request,response);
    });

};