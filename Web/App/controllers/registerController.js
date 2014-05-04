﻿app.controller('registerController', function ($scope, $rootScope, $http, $window, $location, authService, whiteListService) {
    //$scope.user = { email: 'test@outlook.com', password: 'aaaa', confirmPassword: 'aaaa' };
    $scope.user = {};
    //$scope.errors = {};

    function validateEmail(email) {
        // http://stackoverflow.com/a/46181
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    } 

    $scope.message = '';

    $scope.isApproved = false;
    $scope.notApproved = false;

    $scope.checkEmail = function () {
        //var email = $scope.user.email;
        if (!validateEmail($scope.user.email)) {
            alert('Enter a valid email!');
        } else {

            whiteListService.get("itcongress2014", $scope.user.email)
                .then(function (data) {
                    if (data == 0) { //not found
                        $scope.isApproved = false;
                        $scope.notApproved = true;
                    } else {
                        $scope.isApproved = true;
                        $scope.notApproved = false;
                    };
                })
                .catch(function (err) {
                    delete $window.localStorage.token;
                    $rootScope.currentToken = null;

                    alert(JSON.stringify(err.data, null, 4));
                });
        }
    }

    $scope.submit = function (userForm) {
        $scope.submitted = true;
        //alert(userForm.$valid);
        if (userForm.$valid) {
            authService.register($scope.user)
                .then(function (data) {

                    // auto login with new created credentials
                    var userCredentials = { userName: $scope.user.email, password: $scope.user.password };
                    authService.login(userCredentials)
                        .then(function (data) {
                            $window.localStorage.token = data.access_token;
                            $window.localStorage.userName = data.userName;

                            $rootScope.currentToken = $window.localStorage.token;
                            $rootScope.userName = $window.localStorage.userName;

                            $scope.message = JSON.stringify(data, null, 4);
                            $location.path('/');
                        })
                        .catch(function (err) {
                            delete $window.localStorage.token;
                            delete $window.localStorage.userName;

                            $rootScope.currentToken = null;
                            $rootScope.userName = null;

                            $scope.message = JSON.stringify(err.data, null, 4);
                        });

                    $scope.message = JSON.stringify(data, null, 4);
                    //$location.path('/');
                })
                .catch(function (err) {
                    //$scope.message = JSON.stringify(err.data, null, 4);
                    alert(JSON.stringify(err.data, null, 4));
                });

        }
        else{
            //alert('Invalid form');
        }
    };

});