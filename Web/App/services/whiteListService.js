app.factory('whiteListService', function ($http) {

    var factory = {};

    factory.getWhiteList = function () {
        return $http.get('/api/itcongress2014/whiteList').then(function (result) {
            return result.data;
        });
    };

    //factory.updateStatus = function (userId, newStatus) {
    //    return $http.put('/api/users/' + userId + '/' + newStatus);
    //};

    return factory;
});