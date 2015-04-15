app.factory('userService', ['$http', function ($http) {

    var factory = {};

    factory.getUsers = function () {
        return $http.get('/api/users').then(function (result) {
            return result.data;
        });
    };

    factory.updateStatus = function (userId, newStatus) {
        return $http.put('/api/users/' + userId + '/' + newStatus);
    };

    factory.resetPassword = function (data) {
        return $http.put('/api/account/resetPassword', data);
    };

    factory.getAllUserDetails = function (eventId) {
        return $http.get('/api/' + eventId + '/userdetails').then(function (result) {
            return result.data;
        });
    };

    factory.getUserDetails = function (eventId, email) {
        return $http.get('/api/' + eventId + '/userdetails/' + encodeURIComponent(email) + '/').then(function (result) {
            return result.data;
        });
    };

    return factory;
}]);