app.controller('registerController', function ($scope, $rootScope, $http, $window, $location, authService) {
    $scope.user = { email: 'test@outlook.com', password: 'aaaa', confirmPassword: 'aaaa' };
    //$scope.errors = {};

    $scope.message = '';

    $scope.submit = function () {
        authService.register($scope.user)
            .then(function (data) {

                // auto login with new created credentials
                var userCredentials = { userName: $scope.user.email, password: $scope.user.password };
                authService.login(userCredentials)
                    .then(function (data) {
                        $window.localStorage.token = data.access_token;
                        $rootScope.currentToken = $window.localStorage.token;

                        $scope.message = JSON.stringify(data, null, 4);
                        //$location.path('/');
                    })
                    .catch(function (err) {
                        delete $window.localStorage.token;
                        $rootScope.currentToken = null;

                        $scope.message = JSON.stringify(err.data, null, 4);
                    });

                $scope.message = JSON.stringify(data, null, 4);
                //$location.path('/');
            })
            .catch(function (err) {
                $scope.message = JSON.stringify(err.data, null, 4);
            });

    };

});