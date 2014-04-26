app.factory('homeService', function ($http) {
    var customers = [
        { name: 'John Smith', city: 'Phoenix' },
        { name: 'John Doe', city: 'New York' },
        { name: 'Jane Doe', city: 'San Francisco' },
        { name: 'Thomas Winter', city: 'Seattle' }
    ];

    var factory = {};

    factory.getCustomers = function () {
        return customers;
    };

    factory.getEvents = function () {
        // http://www.benlesh.com/2013/02/angularjs-creating-service-with-http.html

        // ok, dar nu e necesar decat daca vrei sa prelucrezi aici rezultatul inainte de a-l da mai departe
        //return $http.get('/api/events').then(function (result) {
        //    return result;
        //});

        return $http.get('/api/events');

    };

    factory.getEventSessions = function () {
        //return $http.get('/api/968000000_it-congress/eventsessions');

        return $http.get('/api/968000000_it-congress/eventsessions').then(function (result) {
            return result.data;
        });
    };

    return factory;
});

