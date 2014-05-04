app.controller('loginController', function ($scope, $rootScope, $http, $window, $location, authService) {
    //$scope.user = { userName: 'test2@outlook.com', password: 'Aa1111'};
    $scope.user = {};
    //$scope.errors = {};

    $scope.message = '';

    $scope.submit = function (userCredentials) {
        //authService.login($scope.user)
        authService.login(userCredentials)
            .then(function (data) {
                $window.localStorage.token = data.access_token;
                $window.localStorage.userName = data.userName;

                $rootScope.currentToken = $window.localStorage.token;
                $rootScope.userName = $window.localStorage.userName;

                //$scope.message = JSON.stringify(data, null, 4);
                $location.path('/');

                // get user details

            })
            .catch(function (err) {
                delete $window.localStorage.token;
                delete $window.localStorage.userName;

                $rootScope.currentToken = null;
                $rootScope.userName = null;

                $scope.message = JSON.stringify(err.data, null, 4);
            });

    };
   
});