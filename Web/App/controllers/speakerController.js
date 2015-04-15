app.controller('speakerController', ['$scope', '$location', '$rootScope', 'speakerService', '$routeParams', function ($scope, $location, $rootScope, speakerService, $routeParams) {

    $scope.speakers = [];
    init();

    $scope.search = $routeParams.speakerId;

    function init() {

        speakerService.getSpeakers("itcongress2015").then(function (data) {
            $scope.speakers = data;
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        });
    };
    

}]);