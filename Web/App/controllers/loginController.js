app.controller('loginController', function ($scope, $http, $window) {
    //$scope.user = { email: 'aaa@outlook.com', password: 'foobar' };
    $scope.user = { email: '', password: '' };
    $scope.message = '';
    $scope.submit = function () {
        $http
          .post('/authenticate', $scope.user)
          .success(function (data, status, headers, config) {
              $window.sessionStorage.token = data.token;
              $scope.message = 'Welcome';
          })
          .error(function (data, status, headers, config) {
              // Erase the token if the user fails to log in
              delete $window.sessionStorage.token;

              // Handle login errors here
              $scope.message = 'Error: Invalid user or password';
          });
    };
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