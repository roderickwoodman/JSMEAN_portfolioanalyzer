my_app.factory('DataFactory', function($http) {

    var factory = {};
    // positions = [];
    totalValue = 0;

// ################################## SEED SOME INITIAL DATA ON PAGE LOAD ##################################

    // HARDCODE SOME HISTORICAL DATA

    var positions = [];
    var newPositions = [];
    // positions.push({symbol: "WRB", valuePct: 0.36, historicalQuotes: new Array (56.259998, 44.75884, 42.425345, 36.445827)});
    // positions.push({symbol: "DIS", valuePct: 0.15, historicalQuotes: new Array (116.440002, 84.576877, 63.936757, 45.711112)});
    // positions.push({symbol: "AWH", valuePct: 0.11, historicalQuotes: new Array (44.599998, 38.795824, 30.961047, 24.957332)});
    // positions.push({symbol: "DG", valuePct: 0.09, historicalQuotes: new Array (79.470001, 55.619421, 53.650768, 54.297044)});
    // positions.push({symbol: "BMY", valuePct: 0.14, historicalQuotes: new Array (69.269997, 47.526666, 42.80052, 32.369561)});
    // positions.push({symbol: "BX", valuePct: 0.12, historicalQuotes: new Array (39.610001, 31.064205, 19.683575, 10.798957)});

    // updateHistoricalGainsForAllPositions();

    var y0_1yr=[], y0_2yr=[], y0_3yr=[];

    for (var holding in positions) {
        y0_1yr.push(0);
        y0_2yr.push(0);
        y0_3yr.push(0);
    }
    for (holding in positions) {
        for (var otherHolding in positions) {
            if (holding != otherHolding) {
                if (positions[holding].historicalGain[1] > positions[otherHolding].historicalGain[1]) {
                    y0_1yr[holding] += positions[otherHolding].valuePct;
                }
                if (positions[holding].historicalGain[2] > positions[otherHolding].historicalGain[2]) {
                    y0_2yr[holding] += positions[otherHolding].valuePct;
                }
                if (positions[holding].historicalGain[3] > positions[otherHolding].historicalGain[3]) {
                    y0_3yr[holding] += positions[otherHolding].valuePct;
                }
            }
        }
    }

    var portfolio_tuples = [], holding_samples = [];

    for (holding in positions) {
        samples = [];
        samples.push({symbol:positions[holding].symbol, x:0, y:positions[holding].valuePct, y0:y0_1yr[holding], y0_gain:positions[holding].historicalGain[1]});
        samples.push({symbol:positions[holding].symbol, x:1, y:positions[holding].valuePct, y0:y0_2yr[holding], y0_gain:positions[holding].historicalGain[2]});
        samples.push({symbol:positions[holding].symbol, x:2, y:positions[holding].valuePct, y0:y0_3yr[holding], y0_gain:positions[holding].historicalGain[3]});
        portfolio_tuples.push(samples);
    }

// ################################## SEED SOME INITIAL DATA ON PAGE LOAD ##################################


    function updateQuote (positionIndex) {

        // var quote = 0;
    	var symbolToQuote = {symbol: positions[positionIndex].symbol};
        console.log("QUO [DataFactory.updateQuote()] need to get a quote: ", symbolToQuote);
        $http.post('/getQuote', symbolToQuote).success(function(output) {
        	if (output.error != null) {
        		console.log("QUO [DataFactory.updateQuote()] ERROR: ", output.error);
        		positions.splice(positionIndex,1);
        	}
        	else {
		        console.log("QUO [DataFactory.updateQuote()] success, returning "+output.lastTradePriceOnly);
		        positions[positionIndex].quote = output.lastTradePriceOnly;
		        positions[positionIndex].name = output.name;
		        positions[positionIndex].performance = output.percentChangeFrom200DayMovingAverage;
	    		updateValuesForAllPositions();
	    	}
        });

        console.log("QUO-H [DataFactory.getQuote()] need to get a historical quote: ", symbolToQuote);
        var historicalDates = ['2015-07-10','2014-07-10','2013-07-10','2012-07-10'];

        positions[positionIndex].historicalQuotes = [];
        positions[positionIndex].historicalGains = [];
        for (var dateNum=0; dateNum<historicalDates.length; dateNum++) {
            positions[positionIndex].historicalQuotes.push(0);
            positions[positionIndex].historicalGains.push(0);
            var dateToQuote = {date: historicalDates[dateNum]};
            var historicalQuoteReq = {symbol: positions[positionIndex].symbol, baseline: positions[positionIndex].quote, dateIdx: dateNum, date: historicalDates[dateNum]};
            $http.post('/getQuoteHistorical', historicalQuoteReq).success(function(output) {
                if (output.error != null) {
                    console.log("QUO-H [DataFactory.updateQuote()] ERROR: ", output.error);
                    positions.splice(positionIndex,1);
                }
                else {
                    console.log("QUO-H [DataFactory.updateQuote()] success, returning date"+output.dateIdx+"@"+output.adjClose);
                    positions[positionIndex].historicalQuotes[output.dateIdx] = output.adjClose.toFixed(2);
                    updateHistoricalGainsForAllPositions();
                    // FIXME: historical gains is broken because baseline isn't resolved at client before historical quote is sent
                    // positions[positionIndex].historicalGains[output.dateIdx] = (((output.adjClose - output.baseline) / output.baseline) * 100).toFixed(1);
                    // console.log("baseline = "+output.baseline+" historical gain "+output.dateIdx+" = "+positions[positionIndex].historicalGains[output.dateIdx]);
                }
            });
        }
    }

    // // FIXME: historical gains is broken because baseline isn't resolved at client before historical quote is sent
    // function updateQuoteGain (positionIndex) {
    //     console.log("QUO [DataFactory.updateQuote()] updating gains for: ", positions[positionIndex].symbol);
    //     positions[positionIndex].historicalGain = [];
    //     positions[positionIndex].historicalGain.push(0);
    //     for (var i=1; i<4; i++) {
    //         var gain = (positions[positionIndex].historicalQuotes[i] - positions[positionIndex].historicalQuotes[0]) / positions[positionIndex].historicalQuotes[0];
    //         positions[positionIndex].historicalGain.push(gain);
    //         console.log("QuoteGain for position["+positionIndex+"]["+i+"] = "+gain);
    //     }
    // }

    function updateTotalValue () {

		totalValue = 0;
		if (positions.length != 0) {
			for (var p=0; p<positions.length; p++) {
				totalValue += parseFloat(positions[p].value);
			}
		}
		totalValue = totalValue.toFixed(2);
    }

    function updateValuesForAllPositions () {

    	if (positions.length == 0) {
	    	updateTotalValue();
    	}
    	else {
	        for (var p=0; p<positions.length; p++) {
		    	positions[p].value = (parseFloat(positions[p].quote) * parseFloat(positions[p].qty)).toFixed(2);
		    }
	    	updateTotalValue();
	        for (p=0; p<positions.length; p++) {	    	
		    	positions[p].valuePct = parseInt(((parseFloat(positions[p].value) / totalValue) * 100).toFixed(1));
		    }
		}
    }

    function updateHistoricalGainsForAllPositions () {

        if (positions.length != 0) {
            for (holding in positions) {
                var historicalGain = [];
                historicalGain.push(0);
                for (var t=1; t<positions[holding].historicalQuotes.length; t++) {
                    if (positions[holding].historicalQuotes[0] == 0) {
                        historicalGain.push(0);
                    }
                    else {
                        historicalGain.push((positions[holding].historicalQuotes[0] - positions[holding].historicalQuotes[t]) / positions[holding].historicalQuotes[0]);
                    }
                }
                positions[holding].historicalGain = historicalGain;
            }
        }
    }

    // check that the browser supports the HTML5 file API
    function browserSupportsFileUpload() {
        var isCompatible = false;
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            isCompatible = true;
        }
        return isCompatible;
    }
 
    // process the selected file
    function upload(file) {
        if (!browserSupportsFileUpload()) {
            alert('The File APIs are not fully supported in this browser!');
        } else {
            var data = null;
            var reader = new FileReader();
            reader.readAsText(file);
            reader.onload = function(event) {
                var csvData = event.target.result;
                data = $.csv.toArrays(csvData);
                if (data && data.length > 0) {
                    //console.log('Imported -' + data.length + '- rows successfully!');
                    var newSymbols = parseFileDataForPositionData(data);
                    newPositions = [];
                    console.log("orig length: ",newPositions.length);
                    newPositions.push(newSymbols);
                    console.log("new length:  ",newPositions.length);
                    // console.log("upload() newSymbols: ",newSymbols);
                    console.log("upload() returning newSymbolsFromFile: ",newSymbols);
                    return newSymbols;
                } else {
                    alert('No data to import!');
                }
            };
            reader.onerror = function() {
                alert('Unable to read ' + file.fileName);
            };
        }
        return
    }

    // extract the position data from the file
    function parseFileDataForPositionData(fileData) {
        var matchResults = [];
        var matchResults2 = [];
        var foundFirstSymbol = false;
        var thisIsFirstSymbol = false;
        var anotherValidSymbol = false;
        var qtyColumn = 0;
        var match = false;
        for (var i=0; i<fileData.length; i++) 
        {
            match = fileData[i][0].trim().toUpperCase().match(/^[A-Z]/);
            if (match != null) 
            {
                if (fileData[i][0].trim() == "Symbol") {
                    thisIsFirstSymbol = true;
                    foundFirstSymbol = true;
                    for (var q=0; q<fileData[i].length-1; q++) {
                        if (fileData[i][q].trim().toUpperCase() == "QTY") {
                            qtyColumn = q;
                            break;
                        }
                    }
                }
                else if (foundFirstSymbol == true) 
                {   
                    symbolToAdd = [];
                    if (thisIsFirstSymbol == true) {
                        thisIsFirstSymbol = false;
                        matchResults.push(new Array(fileData[i][0], fileData[i][q]));
                        matchResults2.push({symbol: fileData[i][0], qty: fileData[i][q]});
                    }
                    else {
                        anotherValidSymbol = true;
                        for (var j=0; j<fileData[i].length-1; j++) {
                            if (fileData[i][j].length == 0) {
                                anotherValidSymbol = false;
                                break;
                            }
                        }
                        if (anotherValidSymbol == true) {
                            matchResults.push(new Array(fileData[i][0], fileData[i][q]));
                            matchResults2.push({symbol: fileData[i][0], qty: fileData[i][q]});
                        }
                    }
                }
            }
        }
        // console.log("matchResults: ",matchResults);
        // console.log("FIXME: parseFileDataForPositionData() returning [0] only: ",matchResults2[0]);
        return matchResults2[0];
    }

    factory.getTotalValue = function() {
		return totalValue;
    }

    factory.getPositions = function() {
    	return positions;
    }

    factory.addPositionsFromFile = function(info, callback) {

        console.log("ADD-M [DataFactory.addPositionsFromFile()] file to upload: ",info.uploadme.name);
        // var newPositions = upload(info.uploadme);
        var newSymbolsFromFile = upload(info.uploadme);
        console.log("received newSymbolsFromFile: ",newSymbolsFromFile);
        console.log("new length2: ",newPositions.length);

        console.log("===== NEW POSITIONS =====")
        for (var i=0; i<newPositions.length; i++) {
            console.log(newPositions[i]);
        }
        console.log("===== POSITIONS =====")
        for (var j=0; j<newPositions.length; j++) {
            console.log(positions[j]);
        }
        positions.push(newPositions);
        callback(positions);
        // console.log("ADD-M [DataFactory.addPositionsFromFile()] data extracted: ",newPositions);
        // this.addPosition(newPositions, callback(positions));

    };

    factory.addPosition = function(info, callback) {
    	var positionIndexModified;
        var symbolExists = false;
        info.symbol = info.symbol.toUpperCase();
        for (var p=0; p<positions.length; p++) {
        	if (positions[p].symbol == info.symbol) {
        		symbolExists = true;
        		positionIndexModified = p;
        		positions[p].qty = parseFloat(positions[p].qty) + parseFloat(info.qty);
		        console.log("ADD [DataFactory.addPosition()] updated position: "+positions[p].symbol);
        		break;
        	}
        }
        if (symbolExists == false) {
	        newPosition = {symbol: info.symbol, qty: info.qty};
	        positions.push(newPosition);
    		positionIndexModified = positions.length - 1;
	        console.log("ADD [DataFactory.addPosition()] added position: ", newPosition);
        }
        updateQuote(positionIndexModified);
        // updateQuoteGain(positionIndexModified); // FIXME: historical gains is broken

		callback(positions);
    };

   return factory;

});

my_app.controller('DashboardController', function($scope, DataFactory) {

    console.log("<<< DASHBOARD PAGE LOAD >>>");

	// ################################################
	// GLOBAL VARS AND HELPER FUNCTIONS

	// var database = [];
	// var totalValue = 0;

	$scope.positions = DataFactory.getPositions();

    function isFloat (n) {
    	return (n%1 !== 0);
    }


	// ################################################
	// PORTFOLIO INPUT FROM CSV FILE

    // // add file upload event listener
    // document.getElementById('csvFileUpload').addEventListener('change', upload, false);
 
    $scope.addPositionsViaFile = function() {

        console.log("<<< ADD POSITION(S) VIA FILE CLICK >>>");

        console.log("ADD [DashboardController.addPositionViaFile()] need to add positions ",$scope.newPositionsFile);
        DataFactory.addPositionsFromFile($scope.newPositionsFile, function(factoryPositions) {
            console.log("ADD-M [DashboardController.addPositionsViaFile()] success");
            $scope.positions = factoryPositions;
            $scope.newPositionsFile = {};
        });

    };


	// ################################################
	// PORTFOLIO INPUT MANUALLY

    $scope.addPositionManually = function() {

	    console.log("<<< ADD POSITION MANUALLY CLICK >>>");

	    console.log("ADD [DashboardController.addPositionManually()] need to add position ",$scope.newManualPosition);
        DataFactory.addPosition($scope.newManualPosition, function(factoryPositions) {
            console.log("ADD [DashboardController.addPositionManually()] success");
            $scope.positions = factoryPositions;
            $scope.newManualPosition = {};
	    });
	};

	$scope.getTotal = function() {
		return DataFactory.getTotalValue();
	}


// start D3 plot

    // HARDCODE SOME HISTORICAL DATA

    // var portfolio = [], holding;
    // portfolio.push({symbol: "WRB", valuePct: 0.36, historicalQuotes: new Array (56.259998, 44.75884, 42.425345, 36.445827)});
    // portfolio.push({symbol: "DIS", valuePct: 0.15, historicalQuotes: new Array (116.440002, 84.576877, 63.936757, 45.711112)});
    // portfolio.push({symbol: "AWH", valuePct: 0.11, historicalQuotes: new Array (44.599998, 38.795824, 30.961047, 24.957332)});
    // portfolio.push({symbol: "DG", valuePct: 0.09, historicalQuotes: new Array (79.470001, 55.619421, 53.650768, 54.297044)});
    // portfolio.push({symbol: "BMY", valuePct: 0.14, historicalQuotes: new Array (69.269997, 47.526666, 42.80052, 32.369561)});
    // portfolio.push({symbol: "BX", valuePct: 0.12, historicalQuotes: new Array (39.610001, 31.064205, 19.683575, 10.798957)});


    // FROM THESE, CALCULATE THE HISTORICAL GAINS

    // for (holding in portfolio) {
    //     var historicalGain = [];
    //     historicalGain.push(0);
    //     for (var t=1; t<portfolio[holding].historicalQuotes.length; t++) {
    //         historicalGain.push((portfolio[holding].historicalQuotes[0] - portfolio[holding].historicalQuotes[t]) / portfolio[holding].historicalQuotes[0]);
    //     }
    //     portfolio[holding].historicalGain = historicalGain;
    // }

    // CONVERT THE DATA INTO AN (x,y,y0) TUPLE

    var y0_1yr=[], y0_2yr=[], y0_3yr=[];

    for (var holding in $scope.positions) {
        y0_1yr.push(0);
        y0_2yr.push(0);
        y0_3yr.push(0);
    }
    for (holding in $scope.positions) {
        for (var otherHolding in $scope.positions) {
            if (holding != otherHolding) {
                if ($scope.positions[holding].historicalGain[1] > $scope.positions[otherHolding].historicalGain[1]) {
                    y0_1yr[holding] += $scope.positions[otherHolding].valuePct;
                }
                if ($scope.positions[holding].historicalGain[2] > $scope.positions[otherHolding].historicalGain[2]) {
                    y0_2yr[holding] += $scope.positions[otherHolding].valuePct;
                }
                if ($scope.positions[holding].historicalGain[3] > $scope.positions[otherHolding].historicalGain[3]) {
                    y0_3yr[holding] += $scope.positions[otherHolding].valuePct;
                }
            }
        }
    }

    var portfolio_tuples = [], holding_samples = [];

    for (holding in $scope.positions) {
        samples = [];
        samples.push({symbol:$scope.positions[holding].symbol, x:0, y:$scope.positions[holding].valuePct, y0:y0_1yr[holding], y0_gain:$scope.positions[holding].historicalGain[1]});
        samples.push({symbol:$scope.positions[holding].symbol, x:1, y:$scope.positions[holding].valuePct, y0:y0_2yr[holding], y0_gain:$scope.positions[holding].historicalGain[2]});
        samples.push({symbol:$scope.positions[holding].symbol, x:2, y:$scope.positions[holding].valuePct, y0:y0_3yr[holding], y0_gain:$scope.positions[holding].historicalGain[3]});
        portfolio_tuples.push(samples);
    }

    // for (holding in portfolio) {
    //     y0_1yr.push(0);
    //     y0_2yr.push(0);
    //     y0_3yr.push(0);
    // }
    // for (holding in portfolio) {
    //     for (var otherHolding in portfolio) {
    //         if (holding != otherHolding) {
    //             if (portfolio[holding].historicalGain[1] > portfolio[otherHolding].historicalGain[1]) {
    //                 y0_1yr[holding] += portfolio[otherHolding].valuePct;
    //             }
    //             if (portfolio[holding].historicalGain[2] > portfolio[otherHolding].historicalGain[2]) {
    //                 y0_2yr[holding] += portfolio[otherHolding].valuePct;
    //             }
    //             if (portfolio[holding].historicalGain[3] > portfolio[otherHolding].historicalGain[3]) {
    //                 y0_3yr[holding] += portfolio[otherHolding].valuePct;
    //             }
    //         }
    //     }
    // }

    // var portfolio_tuples = [], holding_samples = [];

    // for (holding in portfolio) {
    //     samples = [];
    //     samples.push({symbol:portfolio[holding].symbol, x:0, y:portfolio[holding].valuePct, y0:y0_1yr[holding], y0_gain:portfolio[holding].historicalGain[1]});
    //     samples.push({symbol:portfolio[holding].symbol, x:1, y:portfolio[holding].valuePct, y0:y0_2yr[holding], y0_gain:portfolio[holding].historicalGain[2]});
    //     samples.push({symbol:portfolio[holding].symbol, x:2, y:portfolio[holding].valuePct, y0:y0_3yr[holding], y0_gain:portfolio[holding].historicalGain[3]});
    //     portfolio_tuples.push(samples);
    // }


    // RUN THE VISUALIZATION d3.layout.stack()

    var n = $scope.positions.length, // number of symbols
    // var n = 6, // number of symbols
        m = 3, // number of samples per symbol
        m_string = ["1-year","2-year","3-year"],
        // stack = d3.layout.stack(),
        // symbols = stack(d3.range(n).map(function() { return bumpLayer(m, .1); })),
        stack = d3.layout.stack()
            .values(function(d) { return d.y; }),

        symbols = portfolio_tuples,
        yGroupMax = d3.max(symbols, function(layer) { return d3.max(layer, function(d) { return d.y; }); }),
        yStackMax = d3.max(symbols, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); });

    // console.log("symbols:");
    for(var symbolNum=0; symbolNum<symbols.length; symbolNum++) {
        var thisSymbol = symbols[symbolNum];
        var thisSymbolData = "[ ";
        for (var sampleNum=0; sampleNum<thisSymbol.length; sampleNum++) {
            var thisSampleNum = thisSymbol[sampleNum];
            thisSymbolData += "{";
            thisSymbolData += thisSampleNum.x+","+thisSampleNum.y+","+thisSampleNum.y0;
            thisSymbolData += "} ]";
        }
            // console.log("symbols["+symbolNum+"] has {x,y,y0} data: "+thisSymbolData);
    }
    // console.log("yGroupMax = "+yGroupMax);
    // console.log("yStackMax = "+yStackMax);

    var margin = {top: 40, right: 10, bottom: 60, left: 10},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var x = d3.scale.ordinal()
        .domain(d3.range(m))
        .rangeRoundBands([0, width], .08);

    var y = d3.scale.linear()
        .domain([0, yStackMax])
        .range([height, 0]);

    var color = d3.scale.linear()
        .domain([0, n - 1])
        .range(["#476A34", "#93DB70"]);

    var xAxis = d3.svg.axis()   // (1) create generic axis function
        .scale(x)               // (2) define the scale to operate on
        .tickSize(0)
        .tickPadding(6)
        .tickFormat(function(i) { return m_string[i]; })
        .orient("bottom");      // (3) where labels appear relative to axis

    var svg = d3.select("#d3plot").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("text")
        .attr("x", width/2)
        .attr("y", height+(margin.bottom)*0.75)
        .style("text-anchor", "middle")
        .text("PERFORMANCE");

    var layer = svg.selectAll(".layer")
        .data(symbols)
      .enter().append("g")
        .attr("class", "layer")
        .style("fill", function(d, i) { return color(i); });

    var rect = layer.selectAll("rect")
        .data(function(d) { return d; })
      .enter().append("rect")
        .attr("x", function(d) { return x(d.x); })
        .attr("y", height)
        .attr("width", x.rangeBand())
        .attr("height", 0);
        // .style("fill", function(d, i) { return color(i); });

    var text1 = layer.selectAll("text")
        .data(function(d) { return d; })
      .enter().append("text")
        .attr("x", function(d) { return x(d.x) + x.rangeBand()/2; })
        .attr("y", function(d) { return y(d.y0 + d.y/2); })
        .attr("text-anchor", "middle")
        .text(function(d) { return d.symbol+" (gain="+d.y0_gain.toFixed(3)+")"; })
        .style("fill", "#000");

    rect.transition()
        .delay(function(d, i) { return i * 10; })
        .attr("y", function(d) { return y(d.y0 + d.y); })
        .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); });

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);                                       // (4) generate the SVG of the axis itself

    svg.append("text")
        .attr("x", (width/2))
        .attr("y", 0-(margin.top/2))
        .attr("text-anchor", "middle")
        .style("font-family", "Arial")
        .style("font-size", "24px")
        .style("text-decoration", "underline")
        .text("Weighted Performance vs Time Intervals");

    d3.selectAll("input").on("change", change);

    function change() {
        // clearTimeout(timeout);
        console.log("CHANGE!!");
        transitionStacked();
    }

    function transitionStacked() {
        y.domain([0, yStackMax]);
        rect.transition()
            .duration(500)
            .delay(function(d, i) { return i * 10; })
            .attr("y", function(d) { return y(d.y0 + d.y); })
            .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); })
          .transition()
            .attr("x", function(d) { return x(d.x); })
            .attr("width", x.rangeBand());
    }


// end D3 plot






//});


}).directive("fileread", [function () {
    return {
        scope: {
            fileread: "="
        },
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                scope.$apply(function () {
                    scope.fileread = changeEvent.target.files[0];
                    // or all selected files:
                    // scope.fileread = changeEvent.target.files;
                });
            });
        }
    }
}]);




// }).directive("fileread", [function () {
//     return {
//         scope: {
//             fileread: "="
//         },
//         link: function (scope, element, attributes) {
//             element.bind("change", function (changeEvent) {
//                 var reader = new FileReader();
//                 reader.onload = function (loadEvent) {
//                     scope.$apply(function () {
//                         scope.fileread = loadEvent.target.result;
//                     });
//                 }
//                 reader.readAsDataURL(changeEvent.target.files[0]);
//             });
//         }
//     }
// }]);













