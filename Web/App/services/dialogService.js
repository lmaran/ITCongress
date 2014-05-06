// http://blog.rivermoss.com/20140105/confirmation-dialog-using-angular-and-angular-ui-for-bootstrap-part-2/
app.factory('dialogService', ['$modal', function ($modal) {
    function confirm(message, title) {
        var modal = $modal.open({
            templateUrl: '/app/views/confirm.html',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                data: function () {
                    return {
                        title: title ? title : 'Confirm',
                        message: message
                    };
                }
            },
            controller: 'confirmController'
        });
        return modal.result;
    };


    function alert(message, title) {
        var modal = $modal.open({
            templateUrl: '/app/views/alert.html',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                data: function () {
                    return {
                        title: title ? title : '',
                        message: message
                    };
                }
            },
            controller: 'alertController'
        });
        return modal.result;
    }


    return {
        confirm: confirm,
        alert: alert
    };
}]);