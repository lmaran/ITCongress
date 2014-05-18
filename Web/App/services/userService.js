app.factory('userService', function ($http) {

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

    return factory;
});