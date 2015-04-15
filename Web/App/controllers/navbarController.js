app.controller('navbarController', ['$scope', '$location', '$rootScope', '$window', function ($scope, $location, $rootScope, $window) {

    // Get currentToken from localStorage
    $rootScope.currentToken = $window.localStorage.token || null;
    $rootScope.userName = $window.localStorage.userName || null;
    $rootScope.role = $window.localStorage.role || null;
    $rootScope.status = $window.localStorage.status || null;
    
    $scope.menu = [{
        'title': 'Agenda',
        'link': '/'
    }
    ,{
        'title': 'Speakers',
        'link': '/Speakers'
    }
    ];

    $scope.logout = function () {
        //Auth.logout()
        //.then(function () {
        //    $location.path('/login');
        //});

        delete $window.localStorage.token;
        delete $window.localStorage.userName;
        delete $window.localStorage.role;
        delete $window.localStorage.status;

        $rootScope.currentToken = null;
        $rootScope.userName = null;
        $rootScope.role = null;
        $rootScope.status = null;

        $location.path('/Account/Login');
    };

    // http://stackoverflow.com/a/18562339
    $scope.isActive = function (route) {
        return route === $location.path();
    };

    $scope.isActiveAdmin = function () {
        if ($location.path() == '/Admin/Users' || $location.path() == '/Admin/WhiteList' || $location.path() == '/Admin/ResetPasswords' || $location.path() == '/Admin/UserDetails')
            return true;
    };

}]);
