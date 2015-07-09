var portfolios = require('./controllers/portfolios.js');


module.exports = function(app) {

	// FROM DASHBOARD VIEW
    app.post('/getQuote', function(request, response) {
        console.log("<<< GET QUOTE ROUTINE >>>");
        console.log("QUO [routes.js] need get a quote: ",request.body);
        portfolios.getQuote(request,response);
    });

};