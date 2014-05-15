app.controller('loginController', function ($scope, $rootScope, $http, $window, $location, authService, dialogService) {
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
                $window.localStorage.role = data.role;
                $window.localStorage.status = data.status;

                $rootScope.currentToken = $window.localStorage.token;
                $rootScope.userName = $window.localStorage.userName;
                $rootScope.role = $window.localStorage.role;
                $rootScope.status = $window.localStorage.status;

                //$scope.message = JSON.stringify(data, null, 4);
                //alert(JSON.stringify(data, null, 4));
                $location.path('/');

            })
            .catch(function (err) {
                delete $window.localStorage.token;
                delete $window.localStorage.userName;
                delete $window.localStorage.isAdmin;
                delete $window.localStorage.status;

                $rootScope.currentToken = null;
                $rootScope.userName = null;
                $rootScope.role = null;
                $rootScope.status = null;

                //alert(JSON.stringify(err.data, null, 4));
                dialogService.alert(err.data.error_description, "Authentication Error");
            });

    };
   
});