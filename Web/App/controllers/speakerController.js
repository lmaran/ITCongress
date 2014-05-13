app.controller('speakerController', function ($scope, $location, $rootScope, speakerService, $routeParams) {

    $scope.speakers = [];
    init();

    $scope.search = $routeParams.speakerId;

    function init() {

        speakerService.getSpeakers("itcongress2014").then(function (data) {
            $scope.speakers = data;
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        });
    };
    

});