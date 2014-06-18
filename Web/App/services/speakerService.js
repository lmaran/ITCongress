app.factory('speakerService', ['$http', function ($http) {
    var factory = {};


    factory.getSpeakers = function (eventId) {
        return $http.get('/api/' + eventId + '/speakers').then(function (result) {
            return result.data;
        });
    };

    factory.getSpeaker = function (eventId, speakerId) {
        return $http.get('/api/' + eventId + '/speakers/' + speakerId).then(function (result) {
            return result.data;
        });
    };

    return factory;
}]);

