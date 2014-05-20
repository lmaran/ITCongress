app.factory('authService', ['$http', function ($http) {

    var factory = {};

    // http://stackoverflow.com/a/14868725
    var formEncode = function (obj) {
        var str = [];
        for (var p in obj)
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        return str.join("&");
    }

    factory.login = function (userCredentials) {
        userCredentials.grant_type = 'password';

        // the OWIN OAuth provider is expecting the post to the "/Token" service to be form encoded and not json encoded
        // so, the expected request should be: "userName=test2%40outlook.com&password=Aa1111%40&grant_type=password"
        
        // depending on jQuery:
        //var dataAsFormEncoded = $.param(userCredentials);

        // if you want to not depend on JQuery: http://stackoverflow.com/a/14868725
        var dataAsFormEncoded = formEncode(userCredentials);

        return $http.post('/token', dataAsFormEncoded, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
            .then(function (response) {
                return response.data;
            });
    };

    factory.register = function (userRegistrationData) {
        return $http.post('/api/account/register', userRegistrationData)
            .then(function (response) {
                return response.data;
            });
    };

    return factory;
}]);