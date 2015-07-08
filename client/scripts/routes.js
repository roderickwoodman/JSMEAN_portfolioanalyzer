// MODULE
var my_app = angular.module('my_app', ['ngRoute']);

// ROUTES
my_app.config(function($routeProvider){
    $routeProvider
    .when('/',{templateUrl:'./../partials/dashboard.html'})
    .otherwise({redirectTo:'/'});
});
