﻿var app = angular.module('itcongressApp', ['ngRoute', 'ui.bootstrap', 'ngSanitize']);

app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
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
        .when('/Admin/UserDetails', {
            controller: 'userDetailsController',
            templateUrl: 'App/views/userDetails.html',
            title: 'WhiteList'
        })
        .when('/Admin/ResetPasswords', {
            controller: 'resetPasswordsController',
            templateUrl: 'App/views/resetPasswords.html',
            title: 'WhiteList'
        })
        .when('/Speakers', {
            controller: 'speakerController',
            templateUrl: 'App/views/speakers.html',
            title: 'Speakers'
        })
        .when('/Speakers/:speakerId', {
            controller: 'speakerController',
            templateUrl: 'App/views/speakers.html',
            title: 'Speaker'
        })
        .otherwise({ redirectTo: '/' });

    // use the HTML5 History API - http://scotch.io/quick-tips/js/angular/pretty-urls-in-angularjs-removing-the-hashtag
    $locationProvider.html5Mode(true);

}]);

app.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
}]);



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
