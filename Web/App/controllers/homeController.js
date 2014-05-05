app.controller('homeController', function ($scope, $location, $rootScope, homeService) {

    $scope.sessions = [];
    init();

    $scope.addCustomer = function () {
        $scope.customers.push(
        {
            name: $scope.newCustomer.name,
            city: $scope.newCustomer.city
        });
    };

    $scope.addToSchedule = function (sessionId, day, time) {
        eventId = "itcongress2014";
        if ($rootScope.userName == null) {
            $location.path('/Account/Login');
        } else {
            var found = false
            $scope.sessions.forEach(function (session) {
                if (session.day == day && session.time == time && session.isRegistered == true && !found) {
                    alert('You are busy!');
                    found = true;
                };
            })
            if (found) return;

            homeService.addToSchedule(eventId, sessionId).then(function (data){
                //alert(123);
                $scope.sessions.forEach(function (session) {
                    if (session.sessionId == sessionId) {
                        session.isRegistered = true;
                    }
                })
            });
        };
    };

    $scope.removeFromSchedule = function (sessionId) {
        eventId = "itcongress2014";
        if ($rootScope.userName == null) {
            $location.path('/Account/Login');
        } else {
            homeService.removeFromSchedule(eventId, sessionId).then(function (data) {
                //alert(123);
                $scope.sessions.forEach(function (session) {
                    if (session.sessionId == sessionId) {
                        session.isRegistered = false;
                    }
                })
            });
        };
    };

    function init() {

        homeService.getSessions().then(function (data) {

            data.forEach(function(session){
                $scope.sessions.push(
                {
                    //eventId: session.eventId,
                    sessionId: session.sessionId,
                    brand: session.brand,
                    title: session.title,
                    day: getDay(session.sessionId),
                    time: getTime(session.sessionId, session.duration),
                    room: getRoom(session.sessionId),
                    maxAttendees: getMaxAttendees(session.sessionId),
                    currentAttendees: session.currentAttendees || 0,
                    isRegistered: false
                });
            })

        })
        .then(function () {
            if ($rootScope.userName) {
                homeService.getRegisteredSessions("itcongress2014", $rootScope.userName).then(function (data) {
                    $scope.sessions.forEach(function (session) {
                        if (isStringInArray(session.sessionId, data)) {
                            session.isRegistered = true;
                        } 
                    })
                })
            };
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
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

    function getTime(rowKey, currentDuration) {
        var defaultDuration = 45;
        tmpArray = rowKey.split('-');

        var startTime = tmpArray[1];
        var stopTime = "TimeError";

        if (currentDuration > 0) {
            stopTime = addMinutes(startTime, currentDuration);
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

    function getMaxAttendees(rowKey) {
        tmpArray = rowKey.split('-');
        if (tmpArray.length < 3) return -1; //no room
        switch (tmpArray[2]) {
            case "room1":
                return 230;
                break;
            case "room2":
                return 230;
                break;
            case "room3":
                return 80;
                break;
            case "room4":
                return 80;
                break;
            default:
                return -2 //error
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

    function isStringInArray(str, arr) {
        var found = false;
        for (i = 0; i < arr.length && !found; i++) {
            if (arr[i] === str) {
                found = true;
            }
        }
        return found;
    };
});