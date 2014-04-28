app.controller('registerController', function ($scope, $rootScope, $http, $window, $location) {
    $scope.user = { email: 'test...@outlook.com', password: 'Aa1111@', confirmPassword: 'Aa1111@' };
    //$scope.errors = {};

    $scope.message = '';

    $scope.submit = function () {
        $http
            .post('/api/account/register', $scope.user)
            .success(function (data, status, headers, config) {
                $scope.message = JSON.stringify(data, null, 4);
                //$location.path('/');
          })
          .error(function (data, status, headers, config) {
              $scope.message = JSON.stringify(data, null, 4);
          });
    };

});