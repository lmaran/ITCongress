app.controller('userDetailsController', ['$scope', 'userService', 'dialogService', function ($scope, userService, dialogService) {
    $scope.userDetailsList = [];

    init();

    function init() {
        userService.getAllUserDetails("itcongress2015").then(function (data) {
            $scope.userDetailsList = data;
        });
    };
}]);