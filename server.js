var express = require('express');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');

// require('./server/config/mongoose.js');
// require('./server/models/question.js');
// require('./server/models/test.js');

// app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname,'./client')));

require('./server/routes.js')(app);

// app.get('/', function (request, response){
// 	response.render('index');
// });

app.listen(8765,function() {
    console.log('JSMEAN_portfolioanalyzer on port 8765');
});