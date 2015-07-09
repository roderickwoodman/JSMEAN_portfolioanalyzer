my_app.factory('DataFactory', function($http) {

    var factory = {};
    positions = [];
    totalValue = 0;

    function updateTotalValue () {

		totalValue = 0;
		if (positions.length != 0) {
			for (var i=0; i<positions.length; i++) {
				totalValue += parseFloat(positions[i].value);
				// console.log("[i="+i+"] totalValue="+totalValue);
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
		    	positions[p].quote = (1).toFixed(2);
		    	positions[p].value = (parseFloat(positions[p].quote) * parseFloat(positions[p].qty)).toFixed(2);
		    }
	    	updateTotalValue();
	        for (p=0; p<positions.length; p++) {	    	
		    	positions[p].valuePct = ((parseFloat(positions[p].value) / totalValue) * 100).toFixed(1);
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
        var symbolExists = false;
        for (var p=0; p<positions.length; p++) {
        	if (positions[p].symbol == info.symbol) {
        		symbolExists = true;
        		positions[p].qty = parseFloat(positions[p].qty) + parseFloat(info.qty);
		        console.log("ADD [DataFactory.addPosition()] updated position: ", positions[p].symbol);
        		break;
        	}
        }
        if (symbolExists == false) {
	        newPosition = {symbol: info.symbol, qty: info.qty};
	        positions.push(newPosition);
	        console.log("ADD [DataFactory.addPosition()] added position: ", newPosition);
        }
		updateValuesForAllPositions();
		callback(positions);
    };

   return factory;
   
});

my_app.controller('DashboardController', function($scope, DataFactory) {

    console.log("<<< DASHBOARD PAGE LOAD >>>");

	// ################################################
	// GLOBAL VARS AND HELPER FUNCTIONS

	var database = [];
	var totalValue = 0;

	$scope.positions = DataFactory.getPositions();

    function isFloat (n) {
    	return (n%1 !== 0);
    }

    function getQuote (symbol) {

    	// var quote = 
    	// http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes

		$.get(
			'http://finance.yahoo.com/webservice/v1/symbols/GOOG/quote?format=json', 
			function(data) {
				console.log(data);
			}, 
			'json');

		return 42;

    }

    // aggregate the new input portfolio data with the existing data (FIXME: currently the database is in the browser)
    function updatePortfolioHoldings (newSymbols) {
        for (var n=0; n<newSymbols.length; n++) {
        	// console.log("newSymbols["+n+"]: "+newSymbols[n]);
        	var newQty = (isFloat(newSymbols[n][1])) ? parseFloat(newSymbols[n][1]) : parseInt(newSymbols[n][1]);
    		if (database.length == 0) {
    			database.push(new Array(newSymbols[n][0], newQty, 0, 0));              	
    		}
    		else {
            	for (var d=0; d<database.length; d++) {
            		if (database[d][0] == newSymbols[n][0]) {
                    	var currQty = (isFloat(database[d][1])) ? parseFloat(database[d][1]) : parseInt(database[d][1]);
            			database[d][1] = currQty + newQty;
            			break;
            		}
            		else if (d == database.length - 1) {
            			database.push(new Array(newSymbols[n][0], newQty, 0, 0));       
                    	break;
            		}
            	}
    		}
        }
    }

    // update the value of the holdings based on current stock quotes
    function updatePortfolioValue () {
        $('#allData').html("");
        totalValue = 0;
        for (var n=0; n<database.length; n++) {
        	database[n][2] = getQuote(database[n][0]);
        	database[n][3] = parseFloat(database[n][1]) * parseFloat(database[n][2]);
        	totalValue += database[n][3];
        }
        for (n=0; n<database.length; n++) {
        	database[n][4] = (parseFloat(database[n][3]) / totalValue) * 100;
        }
    }

    // update the view
    function updatePortfolioView () {
        $('#allData').html("");
        for (var n=0; n<database.length; n++) {
            $('#allData').append("<tr><td>"+database[n][0]+"</td><td>"+database[n][1]+"</td><td>$"+database[n][2].toFixed(2)+"</td><td>$"+database[n][3].toFixed(2)+"</td><td>"+database[n][4].toFixed(1)+"%</td></tr>");
        }
        $('#allData').append("<tr><td></td><td></td><th>TOTAL:</th><th>$"+totalValue.toFixed(2)+"</th><th>100%</th></tr>");
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








