﻿app.controller('homeController', function ($scope, homeService) {
    $scope.customers = [];
    $scope.events = [];
    $scope.eventSessions = [];
    init();

    $scope.addCustomer = function () {
        $scope.customers.push(
        {
            name: $scope.newCustomer.name,
            city: $scope.newCustomer.city
        });
    };

    function init() {
        $scope.customers = homeService.getCustomers();

        //homeService.getEvents().then(function (data) {
        //    $scope.events = data;
        //    alert(JSON.stringify(data));
        //});

        homeService.getSessions().then(function (data) {
            $scope.sessions = data;
            //alert(JSON.stringify(data));
        });
    };

});