app.controller('loginController', function ($scope, $rootScope, $http, $window, $location) {
    $scope.user = { userName: 'test2@outlook.com', password: 'Aa1111@'};
    //$scope.errors = {};

    $scope.message = '';

    $scope.submit = function () {
        $scope.user.grant_type = 'password';

        // the OWIN OAuth provider is expecting the post to the "/Token" service to be form encoded and not json encoded
        // so, the expected request should be: "userName=test2%40outlook.com&password=Aa1111%40&grant_type=password"
        // if you want to not depend on JQuery: http://stackoverflow.com/a/14868725
        var dataAsFormEncoded = $.param($scope.user);

        $http
          .post('/token', dataAsFormEncoded, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
          .success(function (data, status, headers, config) {

              $window.localStorage.token = data.access_token;
              $rootScope.currentToken = $window.localStorage.token;

              $scope.message = JSON.stringify(data, null, 4);
              //$location.path('/');
          })
          .error(function (data, status, headers, config) {
              // Erase the token if the user fails to log in
              delete $window.localStorage.token;

              // Handle login errors here
              //$scope.message = 'Error: Invalid user or password';
              $scope.message = JSON.stringify(data, null, 4);
          });
    };
    //$rootScope.localStorage = $window.localStorage.token;
    
});



//app.controller('loginController', ['$scope', 'authSession', '$location', function ($scope, Auth, $location) {
//    $scope.user = {};
//    $scope.errors = {};

//    //$scope.login = function (form) {
//    //    $scope.submitted = true;

//    //    if (form.$valid) {
//    //        Auth.login({
//    //            email: $scope.user.email,
//    //            password: $scope.user.password
//    //        })
//    //        .then(function () {
//    //            // Logged in, redirect to home
//    //            $location.path('/');
//    //        })
//    //        .catch(function (err) {
//    //            err = err.data;
//    //            $scope.errors.other = err.message;
//    //        });
//    //    }
//    //};
//}]);