app.controller('registerController', ['$scope', '$rootScope', '$http', '$window', '$location', 'authService', 'whiteListService', 'dialogService', function ($scope, $rootScope, $http, $window, $location, authService, whiteListService, dialogService) {
    //$scope.user = { email: 'test@outlook.com', password: 'aaaa', confirmPassword: 'aaaa' };
    $scope.user = {};
    //$scope.errors = {};

    function validateEmail(email) {
        // http://stackoverflow.com/a/46181
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    } 

    $scope.message = '';

    $scope.isApproved = false;
    $scope.notApproved = false;

    $scope.checkEmail = function () {
        //var email = $scope.user.email;
        if (!validateEmail($scope.user.email)) {
            alert('Enter a valid email!');
        } else {

            whiteListService.get("itcongress2015", $scope.user.email)
                .then(function (data) {
                    if (data == 0) { //not found
                        $scope.isApproved = false;
                        $scope.notApproved = true;
                    } else {
                        $scope.isApproved = true;
                        $scope.notApproved = false;
                    };
                })
                .catch(function (err) {
                    delete $window.localStorage.token;
                    $rootScope.currentToken = null;

                    alert(JSON.stringify(err.data, null, 4));
                });
        }
    }

    $scope.submit = function (userForm) {

        $scope.submitted = true;
        //alert(userForm.$valid);
        if (userForm.$valid) {
            authService.register($scope.user)
                .then(function (data) {

                    // auto login with new created credentials
                    var userCredentials = { userName: $scope.user.email, password: $scope.user.password };
                    authService.login(userCredentials)
                        .then(function (data) {
                            $window.localStorage.token = data.access_token;
                            $window.localStorage.userName = data.userName;
                            $window.localStorage.role = data.role;
                            $window.localStorage.status = data.status;

                            $rootScope.currentToken = $window.localStorage.token;
                            $rootScope.userName = $window.localStorage.userName;
                            $rootScope.role = $window.localStorage.role;
                            $rootScope.status = $window.localStorage.status;

                            //$scope.message = JSON.stringify(data, null, 4);
                             
                            var msg = '';
                            if (data.status.substr(0, 8) == 'Approved') {
                                msg = 'Contul dvs este ACTIV. In orice moment puteti accesa si configura  agenda personala utilizand adrea de email si parola folosite la inregistrare.';
                            } else {
                                msg = 'Contul dvs este INACTIV. Deoarece aceasta adresa de email nu exista in baza noastra de date va rugam sa asteptati ca inregistrarea sa fie activata de catre echipa IT Congress. Un email de confirmare a activarii contului va fi trimis pe aceasta adresa in urmatoarele 24 de ore.';
                            }
                            dialogService.alert(msg, 'Inregistrare realizata cu succes')
                            .then(function () {
                                $location.path('/');
                            });

                           
                        })
                        .catch(function (err) {
                            delete $window.localStorage.token;
                            delete $window.localStorage.userName;
                            delete $window.localStorage.role;
                            delete $window.localStorage.status;

                            $rootScope.currentToken = null;
                            $rootScope.userName = null;
                            $rootScope.role = null;
                            $rootScope.status = null;

                            alert(JSON.stringify(err.data, null, 4));
                        });

                    $scope.message = JSON.stringify(data, null, 4);
                    //$location.path('/');
                })
                .catch(function (err) {
                    //$scope.message = JSON.stringify(err.data, null, 4);
                    //alert(JSON.stringify(err.data, null, 4));

                    //alert(JSON.stringify(err.data.modelState[""], null, 4));

                    var msg = "<ul>";
                    var errorDetails = err.data.modelState[""];
                    for (var key in errorDetails) {
                        msg += "<li>" + errorDetails[key] + "<br></li>";                      
                    };
                    msg += "</ul>"
                    dialogService.alert(msg, err.data.message);
                });

        }
        else{
            //alert('Invalid form');
        }
    };

}]);