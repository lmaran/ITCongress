// http://blog.rivermoss.com/20140105/confirmation-dialog-using-angular-and-angular-ui-for-bootstrap-part-2/
app.factory('confirmService', ['$modal', function ($modal) {
    function confirmation(message, title) {
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
    }

    return {
        confirmation: confirmation
    };
}]);