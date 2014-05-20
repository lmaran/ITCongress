app.controller('resetPasswordsController', ['$scope', '$rootScope', '$http', '$window', '$location', 'userService', 'whiteListService', 'dialogService', function ($scope, $rootScope, $http, $window, $location, userService, whiteListService, dialogService) {
    //$scope.user = { email: 'test@outlook.com', password: 'aaaa', confirmPassword: 'aaaa' };
    $scope.user = {};
    //$scope.errors = {};

    function validateEmail(email) {
        // http://stackoverflow.com/a/46181
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    } 

    $scope.message = '';


    $scope.submit = function (userForm) {

        $scope.submitted = true;
        //alert(userForm.$valid);
        if (userForm.$valid) {
            userService.resetPassword($scope.user)
                .then(function (data) {
                    dialogService.alert("Password has been changed!", "Done");
                })
                .catch(function (err) {
                    //$scope.message = JSON.stringify(err.data, null, 4);
                    //alert(JSON.stringify(err.data, null, 4));

                    if (err.status == 404) dialogService.alert("Email not found", "Error");
                    else
                    {
                        //alert(JSON.stringify(err, null, 4));

                        var msg = "<ul>";
                        var errorDetails = err.data.modelState[""];
                        for (var key in errorDetails) {
                            msg += "<li>" + errorDetails[key] + "<br></li>";                      
                        };
                        msg += "</ul>"
                        dialogService.alert(msg, err.data.message);
                    }
                });

        }
        else{
            //alert('Invalid form');
        }
    };

}]);