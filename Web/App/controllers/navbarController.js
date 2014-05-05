app.controller('navbarController', function ($scope, $location, $translate, $rootScope, $window) {

    // Get currentToken from localStorage
    $rootScope.currentToken = $window.localStorage.token || null;
    $rootScope.userName = $window.localStorage.userName || null;
    $rootScope.isAdmin = $window.localStorage.isAdmin || null;
    $rootScope.status = $window.localStorage.status || null;
    
    $scope.menu = [{
        'title': 'Home',
        'link': '/'
    }
        //, {
        //    'title': 'Admin',
        //    'link': '/Admin'
        //}
    ];

    $scope.logout = function () {
        //Auth.logout()
        //.then(function () {
        //    $location.path('/login');
        //});

        delete $window.localStorage.token;
        delete $window.localStorage.userName;
        delete $window.localStorage.isAdmin;
        delete $window.localStorage.status;

        $rootScope.currentToken = null;
        $rootScope.userName = null;
        $rootScope.isAdmin = null;
        $rootScope.status = null;

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
