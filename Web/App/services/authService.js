app.factory('authService', function ($http) {

    var factory = {};

    factory.login = function (userCredentials) {
        userCredentials.grant_type = 'password';

        // the OWIN OAuth provider is expecting the post to the "/Token" service to be form encoded and not json encoded
        // so, the expected request should be: "userName=test2%40outlook.com&password=Aa1111%40&grant_type=password"
        // if you want to not depend on JQuery: http://stackoverflow.com/a/14868725
        var dataAsFormEncoded = $.param(userCredentials);

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
});