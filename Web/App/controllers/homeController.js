app.controller('homeController', function ($scope, homeService) {

    $scope.sessions = [];
    init();

    $scope.addCustomer = function () {
        $scope.customers.push(
        {
            name: $scope.newCustomer.name,
            city: $scope.newCustomer.city
        });
    };

    function init() {

        homeService.getSessions().then(function (data) {
            //$scope.sessions = data;
            data.forEach(function(session){
                $scope.sessions.push(
                {
                    brand: session.brand,
                    title: session.title,
                    day: getDay(session.sessionId),
                    time: getTime(session.sessionId, session.duration),
                    room: getRoom(session.sessionId)
                });
            });

        })
        .catch(function (err) {
            alert(JSON.stringify(err.data, null, 4));
        });
    };

    function getDay(rowKey) {
        tmpArray = rowKey.split('-');
        switch (tmpArray[0]) {
            case "day1":
                return "21 May";
                break;
            case "day2":
                return "22 May";
                break;
            default:
                return "DayError"
        }
    };

    function getTime(rowKey, currenttDuration) {
        var defaultDuration = 45;
        tmpArray = rowKey.split('-');

        var startTime = tmpArray[1];
        var stopTime = "TimeError";

        if (currenttDuration > 0) {
            stopTime = addMinutes(startTime, currenttDuration);
        } else {
            stopTime = addMinutes(startTime, defaultDuration);
        }
        return startTime + " - " + stopTime;
    };

    function getRoom(rowKey) {
        tmpArray = rowKey.split('-');
        if (tmpArray.length < 3) return ""; //no room
        switch (tmpArray[2]) {
            case "room1":
                return "Presentation Room 1";
                break;
            case "room2":
                return "Presentation Room 2";
                break;
            case "room3":
                return "Workshop Focus Group 1";
                break;
            case "room4":
                return "Workshop Focus Group 2";
                break;
            default:
                return "RoomError"
        }
    };


    http://stackoverflow.com/a/13339259
    // addMinutes('05:40', '20');  // '06:00'
    // addMinutes('23:50', 20);    // '00:10'
    function addMinutes(time, minsToAdd) {
        function z(n) { return (n < 10 ? '0' : '') + n; };
        var bits = time.split(':');
        var mins = bits[0] * 60 + +bits[1] + +minsToAdd;

        return z(mins % (24 * 60) / 60 | 0) + ':' + z(mins % 60);
    }

});