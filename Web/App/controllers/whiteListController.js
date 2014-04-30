app.controller('whiteListController', function ($scope, whiteListService, confirmService) {
    $scope.whiteList = [];

    //$scope.delete = function (email) {
    //    // get the index for selected item
    //    var i = 0;
    //    for (i in $scope.whiteList) {
    //        if ($scope.whiteList[i] == email) break;
    //    };

    //    //whiteListService.delete(email).then(function () {
    //        //$scope.whiteList[i] = newStatus;
    //        $scope.whiteList.splice(i, 1);
    //    //})
    //};

    $scope.delete = function (email) {
        confirmService.confirmation('Click ok to delete ' + email + ', otherwise click cancel.', 'Delete Email')
            .then(function () {
                //alert('confirmed');

                // get the index for selected item
                var i = 0;
                for (i in $scope.whiteList) {
                    if ($scope.whiteList[i] == email) break;
                };

                //whiteListService.delete(email).then(function () {
                    //$scope.whiteList[i] = newStatus;
                    $scope.whiteList.splice(i, 1);
                //})

            }, function () {
                //alert('cancelled');
            });
    };


    init();

    function init() {
        whiteListService.getWhiteList().then(function (data) {
            $scope.whiteList = data;
        });
    };
});