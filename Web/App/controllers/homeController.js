app.controller('homeController', function ($scope, homeService) {
    $scope.customers = [];
    init();

    $scope.addCustomer = function () {
        $scope.customers.push(
        {
            name: $scope.newCustomer.name,
            city: $scope.newCustomer.city
        });
    };

    function init() {
        $scope.customers = homeService.getCustomers();
    };

});