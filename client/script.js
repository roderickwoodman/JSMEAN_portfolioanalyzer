my_app.factory('DataFactory', function($http) {

    var factory = {};
    positions = [];
    totalValue = 0;

    function updateQuote (positionIndex) {

    	var symbolToQuote = {symbol: positions[positionIndex].symbol};
    	var quote = 0;
        console.log("QUO [DataFactory.getQuote()] need to get a quote: ", symbolToQuote);
        $http.post('/getQuote', symbolToQuote).success(function(output) {
        	if (output.error != null) {
        		console.log("QUO [DataFactory.getQuote()] ERROR: ", output.error);
        		positions.splice(positionIndex,1);
        	}
        	else {
		        console.log("QUO [DataFactory.getQuote()] success, returning "+output.lastTradePriceOnly); //, "+symbol+" @ $"+output.lastTradePriceOnly);
		        positions[positionIndex].quote = output.lastTradePriceOnly;
		        positions[positionIndex].name = output.name;
		        positions[positionIndex].performance = output.percentChangeFrom200DayMovingAverage;
	    		updateValuesForAllPositions();
	    	}
        });
    }

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

    factory.getTotalValue = function() {
		return totalValue;
    }

    factory.getPositions = function() {
    	return positions;
    }

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
		// updateValuesForAllPositions();
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

    // add file upload event listener
    document.getElementById('csvFileUpload').addEventListener('change', upload, false);
 
    // check that the browser supports the HTML5 file API
    function browserSupportsFileUpload() {
        var isCompatible = false;
        if (window.File && window.FileReader && window.FileList && window.Blob) {
	        isCompatible = true;
        }
        return isCompatible;
    }
 
    // process the selected file
    function upload(evt) {
		$('#man_symbol').val("");
		$('#man_qty').val("");
	    if (!browserSupportsFileUpload()) {
	        alert('The File APIs are not fully supported in this browser!');
        } else {
            var data = null;
            var file = evt.target.files[0];
            var reader = new FileReader();
            reader.readAsText(file);
            reader.onload = function(event) {
                var csvData = event.target.result;
                data = $.csv.toArrays(csvData);
                if (data && data.length > 0) {
                    //console.log('Imported -' + data.length + '- rows successfully!');
                    var newSymbols = parseFileDataForPositionData(data);
                    updatePortfolioHoldings(newSymbols);
                    updatePortfolioValue();
                    updatePortfolioView();
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








