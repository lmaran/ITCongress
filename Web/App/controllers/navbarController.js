app.controller('navbarController', function ($scope, $location, $translate, $rootScope, $window) {

    // Get currentUser from cookie
    //$rootScope.currentUser = $cookieStore.get('user') || null;
    $rootScope.currentToken = $window.localStorage.token || null;

    $scope.menu = [{
            'title': 'Home',
            'link': '/'
        }, {
            'title': 'Admin',
            'link': '/Admin'
        }];

    $scope.logout = function () {
        //Auth.logout()
        //.then(function () {
        //    $location.path('/login');
        //});

        delete $window.localStorage.token;
        $rootScope.currentToken = null;
        $location.path('/Account/Login');
    };

    // http://stackoverflow.com/a/18562339
    $scope.isActive = function (route) {
        return route === $location.path();
    };

    $scope.changeLanguage = function (langKey) {
        $translate.use(langKey);
    };

});
