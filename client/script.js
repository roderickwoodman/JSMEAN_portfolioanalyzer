my_app.factory('DataFactory', function($http) {

    var factory = {};
    positions = [];
    totalValue = 0;

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

    // check that the browser supports the HTML5 file API
    function browserSupportsFileUpload() {
        var isCompatible = false;
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            isCompatible = true;
        }
        return isCompatible;
    }
 
    // process the selected file
    // function upload(evt) {
    function upload(file) {
        // $('#man_symbol').val("");
        // $('#man_qty').val("");
        if (!browserSupportsFileUpload()) {
            alert('The File APIs are not fully supported in this browser!');
        } else {
            var data = null;
            // var file = evt.target.files[0];
            var reader = new FileReader();
            reader.readAsText(file);
            reader.onload = function(event) {
                var csvData = event.target.result;
                data = $.csv.toArrays(csvData);
                if (data && data.length > 0) {
                    //console.log('Imported -' + data.length + '- rows successfully!');
                    var newSymbols = parseFileDataForPositionData(data);
                    console.log(newSymbols);
                    // updatePortfolioHoldings(newSymbols);
                    // updatePortfolioValue();
                    // updatePortfolioView();
                } else {
                    alert('No data to import!');
                }
            };
            reader.onerror = function() {
                alert('Unable to read ' + file.fileName);
            };
        }
    }

    // extract the position data from the file
    function parseFileDataForPositionData(fileData) {
        var matchResults = [];
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
                        }
                    }
                }
            }
        }
        return matchResults;
    }

    factory.getTotalValue = function() {
		return totalValue;
    }

    factory.getPositions = function() {
    	return positions;
    }

    factory.addPositionsFromFile = function(info, callback) {

        console.log("ADD-M [DataFactory.addPositionsFromFile()] added position(s)");

        // info.file
        console.log(info);
        // upload(info.file);




        // info.symbol = info.symbol.toUpperCase();


        console.log("ADD-M [DataFactory.addPositionsFromFile()] added position(s)");
        callback(positions);
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
 
    $scope.addPositionViaFile = function() {

        console.log("<<< ADD POSITION(S) VIA FILE CLICK >>>");

        console.log("ADD-M [DashboardController.addPositionViaFile()] need to add position(s): "+$scope.newFilePositions);
        // DataFactory.addPositionsFromFile($scope.newFilePositions, function(factoryPositions) {
        //     console.log("ADD-M [DashboardController.addPositionViaFile()] success");
        //     $scope.positions = factoryPositions;
        //     $scope.newFilePositions = {};
        // });
    };


	// ################################################
	// PORTFOLIO INPUT MANUALLY

    $scope.addPositionManually = function() {

	    console.log("<<< ADD POSITION MANUALLY CLICK >>>");

	    console.log("ADD [DashboardController.addPositionManually()] need to add position",$scope.newManualPosition);
        DataFactory.addPosition($scope.newManualPosition, function(factoryPositions) {
            console.log("ADD [DashboardController.addPositionManually()] success");
            $scope.positions = factoryPositions;
            $scope.newManualPosition = {};
	    });
	};

	$scope.getTotal = function() {
		return DataFactory.getTotalValue();
	}

});








