app.controller('navbarController', function ($scope, $location, $translate, $rootScope) {

    $scope.menu = [{
            'title': 'Home',
            'link': '/'
        }, {
            'title': 'Admin',
            'link': '/Admin'
    }];

    $scope.isActive = function (route) {
        return route === $location.path();
    };

    $scope.changeLanguage = function (langKey) {
        $translate.use(langKey);
    };

});
