app.controller('userController', function ($scope, userService) {
    $scope.users = [];

    $scope.changeStatus = function (id, newStatus) {
        // get the index for selected item
        var i = 0;
        for (i in $scope.users) {
            if ($scope.users[i].id == id) break;
        };

        userService.updateStatus(id, newStatus).then(function () {
            $scope.users[i].status = newStatus;
        })
    };


    init();

    function init() {
        userService.getUsers().then(function (data) {
            $scope.users = data;
        });
    };

});