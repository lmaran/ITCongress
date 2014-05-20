app.factory('homeService', ['$http', function ($http) {
    var customers = [
        { name: 'John Smith', city: 'Phoenix' },
        { name: 'John Doe', city: 'New York' },
        { name: 'Jane Doe', city: 'San Francisco' },
        { name: 'Thomas Winter', city: 'Seattle' }
    ];

    var factory = {};


    factory.getEvents = function () {
        // http://www.benlesh.com/2013/02/angularjs-creating-service-with-http.html

        // ok, dar nu e necesar decat daca vrei sa prelucrezi aici rezultatul inainte de a-l da mai departe
        //return $http.get('/api/events').then(function (result) {
        //    return result;
        //});

        return $http.get('/api/events');

    };

    factory.getSessions = function () {
        //return $http.get('/api/968000000_it-congress/eventsessions');

        return $http.get('/api/itcongress2014/sessions').then(function (result) {
            return result.data;
        });

        //return $http.get('/api/itcongress2014/sessions');
    };

    factory.getRegisteredSessions = function (eventId, email) {
        return $http.get('/api/' + eventId + '/MySchedule').then(function (result) {
            return result.data;
        });
    };

    factory.addToSchedule = function (eventId, sessionId) {
        var data = {};
        data.SessionId = sessionId;
        return $http.post('/api/' + eventId + '/MySchedule', data).then(function (result) {
            return result.data;
        });
    };

    factory.removeFromSchedule = function (eventId, sessionId) {
        var data = {};
        data.SessionId = sessionId;
        return $http.put('/api/' + eventId + '/MySchedule', data).then(function (result) {
            return result.data;
        });
    };

    return factory;
}]);

