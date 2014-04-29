var app = angular.module('itcongressApp', ['ngRoute', 'pascalprecht.translate', 'ngCookies']);

app.config(function ($routeProvider, $locationProvider, $translateProvider) {
    $routeProvider
        .when('/',
            {
                controller: 'homeController',
                templateUrl: 'App/views/home.html'
            })
        .when('/Admin',
            {
                controller: 'homeController',
                templateUrl: 'App/views/admin.html'
            })
        .when('/Account/Login', {
            controller: 'loginController',
            templateUrl: 'App/views/login.html',
            title: 'Login'
        })
        .when('/Account/Register', {
            controller: 'registerController',
            templateUrl: 'App/views/register.html',
            title: 'Register'
        })
        .when('/Admin/Users', {
            controller: 'userController',
            templateUrl: 'App/views/users.html',
            title: 'Users'
        })
        .when('/Admin/WhiteList', {
            controller: 'whiteListController',
            templateUrl: 'App/views/whiteList.html',
            title: 'WhiteList'
        })
        .otherwise({ redirectTo: '/' });

    // use the HTML5 History API - http://scotch.io/quick-tips/js/angular/pretty-urls-in-angularjs-removing-the-hashtag
    $locationProvider.html5Mode(true);


    // Initialize the translate provider
    // Doc: http://angular-translate.github.io/docs/#/api
    $translateProvider
        //.translations('en', translations)
        .preferredLanguage('en')
        .fallbackLanguage('en') // maybe there are some translation ids, that are available in an english translation table, but not in other (ro) translation table
        .useLocalStorage() //to remember the chosen language; it use 'storage-cookie' as fallback; 'storage-cookie' depends on 'ngCookies'
        .useStaticFilesLoader({
            prefix: 'Content/translates/',
            suffix: '.json'
        });

});


//// https://auth0.com/blog/2014/01/07/angularjs-authentication-with-cookies-vs-token/
//app.factory('authInterceptor', function ($rootScope, $q, $window) {
//    return {
//        request: function (config) {
//            config.headers = config.headers || {};
//            if ($window.sessionStorage.token) {
//                config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
//            }
//            return config;
//        },
//        response: function (response) {
//            if (response.status === 401) {
//                // handle the case where the user is not authenticated
//            }
//            return response || $q.when(response);
//        }
//    };
//});

//app.config(function ($httpProvider) {
//    $httpProvider.interceptors.push('authInterceptor');
//});



//// Intercept 401s and 403s and redirect you to login
//$httpProvider.interceptors.push(['$q', '$location', function ($q, $location) {
//    return {
//        'responseError': function (response) {
//            if (response.status === 401 || response.status === 403) {
//                $location.path('/login');
//                return $q.reject(response);
//            }
//            else {
//                return $q.reject(response);
//            }
//        }
//    };
//}]);
