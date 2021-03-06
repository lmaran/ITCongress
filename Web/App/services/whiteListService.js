﻿app.factory('whiteListService', ['$http', function ($http) {

    var factory = {};

    factory.getWhiteList = function () {
        return $http.get('/api/itcongress2015/whiteList').then(function (result) {
            return result.data;
        });
    };

    factory.delete = function (eventId, email) {
        return $http.delete('/api/' + eventId + '/whiteList/' + encodeURIComponent(email) + '/');
    };

    factory.add = function (eventId, email) {
        return $http.post('/api/' + eventId + '/whiteList/' + encodeURIComponent(email) + '/');
    };

    factory.get = function (eventId, email) {
        return $http.get('/api/' + eventId + '/whiteList/' + encodeURIComponent(email) + '/').then(function (result) {
            return result.data;
        });
    };

    return factory;
}]);