///#source 1 1 /Scripts/custom-version/ui-bootstrap-tpls.js
/*
 * angular-ui-bootstrap
 * http://angular-ui.github.io/bootstrap/

 * Version: 0.10.0 - 2014-01-13
 * License: MIT
 */
angular.module("ui.bootstrap", ["ui.bootstrap.tpls", "ui.bootstrap.transition", "ui.bootstrap.collapse", "ui.bootstrap.accordion", "ui.bootstrap.alert", "ui.bootstrap.bindHtml", "ui.bootstrap.buttons", "ui.bootstrap.carousel", "ui.bootstrap.position", "ui.bootstrap.datepicker", "ui.bootstrap.dropdownToggle", "ui.bootstrap.modal", "ui.bootstrap.pagination", "ui.bootstrap.tooltip", "ui.bootstrap.popover", "ui.bootstrap.progressbar", "ui.bootstrap.rating", "ui.bootstrap.tabs", "ui.bootstrap.timepicker", "ui.bootstrap.typeahead"]);
angular.module("ui.bootstrap.tpls", ["template/accordion/accordion-group.html", "template/accordion/accordion.html", "template/alert/alert.html", "template/carousel/carousel.html", "template/carousel/slide.html", "template/datepicker/datepicker.html", "template/datepicker/popup.html", "template/modal/backdrop.html", "template/modal/window.html", "template/pagination/pager.html", "template/pagination/pagination.html", "template/tooltip/tooltip-html-unsafe-popup.html", "template/tooltip/tooltip-popup.html", "template/popover/popover.html", "template/progressbar/bar.html", "template/progressbar/progress.html", "template/progressbar/progressbar.html", "template/rating/rating.html", "template/tabs/tab.html", "template/tabs/tabset.html", "template/timepicker/timepicker.html", "template/typeahead/typeahead-match.html", "template/typeahead/typeahead-popup.html"]);
angular.module('ui.bootstrap.transition', [])

/**
 * $transition service provides a consistent interface to trigger CSS 3 transitions and to be informed when they complete.
 * @param  {DOMElement} element  The DOMElement that will be animated.
 * @param  {string|object|function} trigger  The thing that will cause the transition to start:
 *   - As a string, it represents the css class to be added to the element.
 *   - As an object, it represents a hash of style attributes to be applied to the element.
 *   - As a function, it represents a function to be called that will cause the transition to occur.
 * @return {Promise}  A promise that is resolved when the transition finishes.
 */
.factory('$transition', ['$q', '$timeout', '$rootScope', function ($q, $timeout, $rootScope) {

    var $transition = function (element, trigger, options) {
        options = options || {};
        var deferred = $q.defer();
        var endEventName = $transition[options.animation ? "animationEndEventName" : "transitionEndEventName"];

        var transitionEndHandler = function (event) {
            $rootScope.$apply(function () {
                element.unbind(endEventName, transitionEndHandler);
                deferred.resolve(element);
            });
        };

        if (endEventName) {
            element.bind(endEventName, transitionEndHandler);
        }

        // Wrap in a timeout to allow the browser time to update the DOM before the transition is to occur
        $timeout(function () {
            if (angular.isString(trigger)) {
                element.addClass(trigger);
            } else if (angular.isFunction(trigger)) {
                trigger(element);
            } else if (angular.isObject(trigger)) {
                element.css(trigger);
            }
            //If browser does not support transitions, instantly resolve
            if (!endEventName) {
                deferred.resolve(element);
            }
        });

        // Add our custom cancel function to the promise that is returned
        // We can call this if we are about to run a new transition, which we know will prevent this transition from ending,
        // i.e. it will therefore never raise a transitionEnd event for that transition
        deferred.promise.cancel = function () {
            if (endEventName) {
                element.unbind(endEventName, transitionEndHandler);
            }
            deferred.reject('Transition cancelled');
        };

        return deferred.promise;
    };

    // Work out the name of the transitionEnd event
    var transElement = document.createElement('trans');
    var transitionEndEventNames = {
        'WebkitTransition': 'webkitTransitionEnd',
        'MozTransition': 'transitionend',
        'OTransition': 'oTransitionEnd',
        'transition': 'transitionend'
    };
    var animationEndEventNames = {
        'WebkitTransition': 'webkitAnimationEnd',
        'MozTransition': 'animationend',
        'OTransition': 'oAnimationEnd',
        'transition': 'animationend'
    };
    function findEndEventName(endEventNames) {
        for (var name in endEventNames) {
            if (transElement.style[name] !== undefined) {
                return endEventNames[name];
            }
        }
    }
    $transition.transitionEndEventName = findEndEventName(transitionEndEventNames);
    $transition.animationEndEventName = findEndEventName(animationEndEventNames);
    return $transition;
}]);

angular.module('ui.bootstrap.collapse', ['ui.bootstrap.transition'])

  .directive('collapse', ['$transition', function ($transition, $timeout) {

      return {
          link: function (scope, element, attrs) {

              var initialAnimSkip = true;
              var currentTransition;

              function doTransition(change) {
                  var newTransition = $transition(element, change);
                  if (currentTransition) {
                      currentTransition.cancel();
                  }
                  currentTransition = newTransition;
                  newTransition.then(newTransitionDone, newTransitionDone);
                  return newTransition;

                  function newTransitionDone() {
                      // Make sure it's this transition, otherwise, leave it alone.
                      if (currentTransition === newTransition) {
                          currentTransition = undefined;
                      }
                  }
              }

              function expand() {
                  if (initialAnimSkip) {
                      initialAnimSkip = false;
                      expandDone();
                  } else {
                      element.removeClass('collapse').addClass('collapsing');
                      doTransition({ height: element[0].scrollHeight + 'px' }).then(expandDone);
                  }
              }

              function expandDone() {
                  element.removeClass('collapsing');
                  element.addClass('collapse in');
                  element.css({ height: 'auto' });
              }

              function collapse() {
                  if (initialAnimSkip) {
                      initialAnimSkip = false;
                      collapseDone();
                      element.css({ height: 0 });
                  } else {
                      // CSS transitions don't work with height: auto, so we have to manually change the height to a specific value
                      element.css({ height: element[0].scrollHeight + 'px' });
                      //trigger reflow so a browser realizes that height was updated from auto to a specific value
                      var x = element[0].offsetWidth;

                      element.removeClass('collapse in').addClass('collapsing');

                      doTransition({ height: 0 }).then(collapseDone);
                  }
              }

              function collapseDone() {
                  element.removeClass('collapsing');
                  element.addClass('collapse');
              }

              scope.$watch(attrs.collapse, function (shouldCollapse) {
                  if (shouldCollapse) {
                      collapse();
                  } else {
                      expand();
                  }
              });
          }
      };
  }]);

angular.module('ui.bootstrap.accordion', ['ui.bootstrap.collapse'])

.constant('accordionConfig', {
    closeOthers: true
})

.controller('AccordionController', ['$scope', '$attrs', 'accordionConfig', function ($scope, $attrs, accordionConfig) {

    // This array keeps track of the accordion groups
    this.groups = [];

    // Ensure that all the groups in this accordion are closed, unless close-others explicitly says not to
    this.closeOthers = function (openGroup) {
        var closeOthers = angular.isDefined($attrs.closeOthers) ? $scope.$eval($attrs.closeOthers) : accordionConfig.closeOthers;
        if (closeOthers) {
            angular.forEach(this.groups, function (group) {
                if (group !== openGroup) {
                    group.isOpen = false;
                }
            });
        }
    };

    // This is called from the accordion-group directive to add itself to the accordion
    this.addGroup = function (groupScope) {
        var that = this;
        this.groups.push(groupScope);

        groupScope.$on('$destroy', function (event) {
            that.removeGroup(groupScope);
        });
    };

    // This is called from the accordion-group directive when to remove itself
    this.removeGroup = function (group) {
        var index = this.groups.indexOf(group);
        if (index !== -1) {
            this.groups.splice(this.groups.indexOf(group), 1);
        }
    };

}])

// The accordion directive simply sets up the directive controller
// and adds an accordion CSS class to itself element.
.directive('accordion', function () {
    return {
        restrict: 'EA',
        controller: 'AccordionController',
        transclude: true,
        replace: false,
        templateUrl: 'template/accordion/accordion.html'
    };
})

// The accordion-group directive indicates a block of html that will expand and collapse in an accordion
.directive('accordionGroup', ['$parse', function ($parse) {
    return {
        require: '^accordion',         // We need this directive to be inside an accordion
        restrict: 'EA',
        transclude: true,              // It transcludes the contents of the directive into the template
        replace: true,                // The element containing the directive will be replaced with the template
        templateUrl: 'template/accordion/accordion-group.html',
        scope: { heading: '@' },        // Create an isolated scope and interpolate the heading attribute onto this scope
        controller: function () {
            this.setHeading = function (element) {
                this.heading = element;
            };
        },
        link: function (scope, element, attrs, accordionCtrl) {
            var getIsOpen, setIsOpen;

            accordionCtrl.addGroup(scope);

            scope.isOpen = false;

            if (attrs.isOpen) {
                getIsOpen = $parse(attrs.isOpen);
                setIsOpen = getIsOpen.assign;

                scope.$parent.$watch(getIsOpen, function (value) {
                    scope.isOpen = !!value;
                });
            }

            scope.$watch('isOpen', function (value) {
                if (value) {
                    accordionCtrl.closeOthers(scope);
                }
                if (setIsOpen) {
                    setIsOpen(scope.$parent, value);
                }
            });
        }
    };
}])

// Use accordion-heading below an accordion-group to provide a heading containing HTML
// <accordion-group>
//   <accordion-heading>Heading containing HTML - <img src="..."></accordion-heading>
// </accordion-group>
.directive('accordionHeading', function () {
    return {
        restrict: 'EA',
        transclude: true,   // Grab the contents to be used as the heading
        template: '',       // In effect remove this element!
        replace: true,
        require: '^accordionGroup',
        compile: function (element, attr, transclude) {
            return function link(scope, element, attr, accordionGroupCtrl) {
                // Pass the heading to the accordion-group controller
                // so that it can be transcluded into the right place in the template
                // [The second parameter to transclude causes the elements to be cloned so that they work in ng-repeat]
                accordionGroupCtrl.setHeading(transclude(scope, function () { }));
            };
        }
    };
})

// Use in the accordion-group template to indicate where you want the heading to be transcluded
// You must provide the property on the accordion-group controller that will hold the transcluded element
// <div class="accordion-group">
//   <div class="accordion-heading" ><a ... accordion-transclude="heading">...</a></div>
//   ...
// </div>
.directive('accordionTransclude', function () {
    return {
        require: '^accordionGroup',
        link: function (scope, element, attr, controller) {
            scope.$watch(function () { return controller[attr.accordionTransclude]; }, function (heading) {
                if (heading) {
                    element.html('');
                    element.append(heading);
                }
            });
        }
    };
});

angular.module("ui.bootstrap.alert", [])

.controller('AlertController', ['$scope', '$attrs', function ($scope, $attrs) {
    $scope.closeable = 'close' in $attrs;
}])

.directive('alert', function () {
    return {
        restrict: 'EA',
        controller: 'AlertController',
        templateUrl: 'template/alert/alert.html',
        transclude: true,
        replace: true,
        scope: {
            type: '=',
            close: '&'
        }
    };
});

angular.module('ui.bootstrap.bindHtml', [])

  .directive('bindHtmlUnsafe', function () {
      return function (scope, element, attr) {
          element.addClass('ng-binding').data('$binding', attr.bindHtmlUnsafe);
          scope.$watch(attr.bindHtmlUnsafe, function bindHtmlUnsafeWatchAction(value) {
              element.html(value || '');
          });
      };
  });
angular.module('ui.bootstrap.buttons', [])

.constant('buttonConfig', {
    activeClass: 'active',
    toggleEvent: 'click'
})

.controller('ButtonsController', ['buttonConfig', function (buttonConfig) {
    this.activeClass = buttonConfig.activeClass || 'active';
    this.toggleEvent = buttonConfig.toggleEvent || 'click';
}])

.directive('btnRadio', function () {
    return {
        require: ['btnRadio', 'ngModel'],
        controller: 'ButtonsController',
        link: function (scope, element, attrs, ctrls) {
            var buttonsCtrl = ctrls[0], ngModelCtrl = ctrls[1];

            //model -> UI
            ngModelCtrl.$render = function () {
                element.toggleClass(buttonsCtrl.activeClass, angular.equals(ngModelCtrl.$modelValue, scope.$eval(attrs.btnRadio)));
            };

            //ui->model
            element.bind(buttonsCtrl.toggleEvent, function () {
                if (!element.hasClass(buttonsCtrl.activeClass)) {
                    scope.$apply(function () {
                        ngModelCtrl.$setViewValue(scope.$eval(attrs.btnRadio));
                        ngModelCtrl.$render();
                    });
                }
            });
        }
    };
})

.directive('btnCheckbox', function () {
    return {
        require: ['btnCheckbox', 'ngModel'],
        controller: 'ButtonsController',
        link: function (scope, element, attrs, ctrls) {
            var buttonsCtrl = ctrls[0], ngModelCtrl = ctrls[1];

            function getTrueValue() {
                return getCheckboxValue(attrs.btnCheckboxTrue, true);
            }

            function getFalseValue() {
                return getCheckboxValue(attrs.btnCheckboxFalse, false);
            }

            function getCheckboxValue(attributeValue, defaultValue) {
                var val = scope.$eval(attributeValue);
                return angular.isDefined(val) ? val : defaultValue;
            }

            //model -> UI
            ngModelCtrl.$render = function () {
                element.toggleClass(buttonsCtrl.activeClass, angular.equals(ngModelCtrl.$modelValue, getTrueValue()));
            };

            //ui->model
            element.bind(buttonsCtrl.toggleEvent, function () {
                scope.$apply(function () {
                    ngModelCtrl.$setViewValue(element.hasClass(buttonsCtrl.activeClass) ? getFalseValue() : getTrueValue());
                    ngModelCtrl.$render();
                });
            });
        }
    };
});

/**
* @ngdoc overview
* @name ui.bootstrap.carousel
*
* @description
* AngularJS version of an image carousel.
*
*/
angular.module('ui.bootstrap.carousel', ['ui.bootstrap.transition'])
.controller('CarouselController', ['$scope', '$timeout', '$transition', '$q', function ($scope, $timeout, $transition, $q) {
    var self = this,
      slides = self.slides = [],
      currentIndex = -1,
      currentTimeout, isPlaying;
    self.currentSlide = null;

    var destroyed = false;
    /* direction: "prev" or "next" */
    self.select = function (nextSlide, direction) {
        var nextIndex = slides.indexOf(nextSlide);
        //Decide direction if it's not given
        if (direction === undefined) {
            direction = nextIndex > currentIndex ? "next" : "prev";
        }
        if (nextSlide && nextSlide !== self.currentSlide) {
            if ($scope.$currentTransition) {
                $scope.$currentTransition.cancel();
                //Timeout so ng-class in template has time to fix classes for finished slide
                $timeout(goNext);
            } else {
                goNext();
            }
        }
        function goNext() {
            // Scope has been destroyed, stop here.
            if (destroyed) { return; }
            //If we have a slide to transition from and we have a transition type and we're allowed, go
            if (self.currentSlide && angular.isString(direction) && !$scope.noTransition && nextSlide.$element) {
                //We shouldn't do class manip in here, but it's the same weird thing bootstrap does. need to fix sometime
                nextSlide.$element.addClass(direction);
                var reflow = nextSlide.$element[0].offsetWidth; //force reflow

                //Set all other slides to stop doing their stuff for the new transition
                angular.forEach(slides, function (slide) {
                    angular.extend(slide, { direction: '', entering: false, leaving: false, active: false });
                });
                angular.extend(nextSlide, { direction: direction, active: true, entering: true });
                angular.extend(self.currentSlide || {}, { direction: direction, leaving: true });

                $scope.$currentTransition = $transition(nextSlide.$element, {});
                //We have to create new pointers inside a closure since next & current will change
                (function (next, current) {
                    $scope.$currentTransition.then(
                      function () { transitionDone(next, current); },
                      function () { transitionDone(next, current); }
                    );
                }(nextSlide, self.currentSlide));
            } else {
                transitionDone(nextSlide, self.currentSlide);
            }
            self.currentSlide = nextSlide;
            currentIndex = nextIndex;
            //every time you change slides, reset the timer
            restartTimer();
        }
        function transitionDone(next, current) {
            angular.extend(next, { direction: '', active: true, leaving: false, entering: false });
            angular.extend(current || {}, { direction: '', active: false, leaving: false, entering: false });
            $scope.$currentTransition = null;
        }
    };
    $scope.$on('$destroy', function () {
        destroyed = true;
    });

    /* Allow outside people to call indexOf on slides array */
    self.indexOfSlide = function (slide) {
        return slides.indexOf(slide);
    };

    $scope.next = function () {
        var newIndex = (currentIndex + 1) % slides.length;

        //Prevent this user-triggered transition from occurring if there is already one in progress
        if (!$scope.$currentTransition) {
            return self.select(slides[newIndex], 'next');
        }
    };

    $scope.prev = function () {
        var newIndex = currentIndex - 1 < 0 ? slides.length - 1 : currentIndex - 1;

        //Prevent this user-triggered transition from occurring if there is already one in progress
        if (!$scope.$currentTransition) {
            return self.select(slides[newIndex], 'prev');
        }
    };

    $scope.select = function (slide) {
        self.select(slide);
    };

    $scope.isActive = function (slide) {
        return self.currentSlide === slide;
    };

    $scope.slides = function () {
        return slides;
    };

    $scope.$watch('interval', restartTimer);
    $scope.$on('$destroy', resetTimer);

    function restartTimer() {
        resetTimer();
        var interval = +$scope.interval;
        if (!isNaN(interval) && interval >= 0) {
            currentTimeout = $timeout(timerFn, interval);
        }
    }

    function resetTimer() {
        if (currentTimeout) {
            $timeout.cancel(currentTimeout);
            currentTimeout = null;
        }
    }

    function timerFn() {
        if (isPlaying) {
            $scope.next();
            restartTimer();
        } else {
            $scope.pause();
        }
    }

    $scope.play = function () {
        if (!isPlaying) {
            isPlaying = true;
            restartTimer();
        }
    };
    $scope.pause = function () {
        if (!$scope.noPause) {
            isPlaying = false;
            resetTimer();
        }
    };

    self.addSlide = function (slide, element) {
        slide.$element = element;
        slides.push(slide);
        //if this is the first slide or the slide is set to active, select it
        if (slides.length === 1 || slide.active) {
            self.select(slides[slides.length - 1]);
            if (slides.length == 1) {
                $scope.play();
            }
        } else {
            slide.active = false;
        }
    };

    self.removeSlide = function (slide) {
        //get the index of the slide inside the carousel
        var index = slides.indexOf(slide);
        slides.splice(index, 1);
        if (slides.length > 0 && slide.active) {
            if (index >= slides.length) {
                self.select(slides[index - 1]);
            } else {
                self.select(slides[index]);
            }
        } else if (currentIndex > index) {
            currentIndex--;
        }
    };

}])

/**
 * @ngdoc directive
 * @name ui.bootstrap.carousel.directive:carousel
 * @restrict EA
 *
 * @description
 * Carousel is the outer container for a set of image 'slides' to showcase.
 *
 * @param {number=} interval The time, in milliseconds, that it will take the carousel to go to the next slide.
 * @param {boolean=} noTransition Whether to disable transitions on the carousel.
 * @param {boolean=} noPause Whether to disable pausing on the carousel (by default, the carousel interval pauses on hover).
 *
 * @example
<example module="ui.bootstrap">
  <file name="index.html">
    <carousel>
      <slide>
        <img src="http://placekitten.com/150/150" style="margin:auto;">
        <div class="carousel-caption">
          <p>Beautiful!</p>
        </div>
      </slide>
      <slide>
        <img src="http://placekitten.com/100/150" style="margin:auto;">
        <div class="carousel-caption">
          <p>D'aww!</p>
        </div>
      </slide>
    </carousel>
  </file>
  <file name="demo.css">
    .carousel-indicators {
      top: auto;
      bottom: 15px;
    }
  </file>
</example>
 */
.directive('carousel', [function () {
    return {
        restrict: 'EA',
        transclude: true,
        replace: true,
        controller: 'CarouselController',
        require: 'carousel',
        templateUrl: 'template/carousel/carousel.html',
        scope: {
            interval: '=',
            noTransition: '=',
            noPause: '='
        }
    };
}])

/**
 * @ngdoc directive
 * @name ui.bootstrap.carousel.directive:slide
 * @restrict EA
 *
 * @description
 * Creates a slide inside a {@link ui.bootstrap.carousel.directive:carousel carousel}.  Must be placed as a child of a carousel element.
 *
 * @param {boolean=} active Model binding, whether or not this slide is currently active.
 *
 * @example
<example module="ui.bootstrap">
  <file name="index.html">
<div ng-controller="CarouselDemoCtrl">
  <carousel>
    <slide ng-repeat="slide in slides" active="slide.active">
      <img ng-src="{{slide.image}}" style="margin:auto;">
      <div class="carousel-caption">
        <h4>Slide {{$index}}</h4>
        <p>{{slide.text}}</p>
      </div>
    </slide>
  </carousel>
  <div class="row-fluid">
    <div class="span6">
      <ul>
        <li ng-repeat="slide in slides">
          <button class="btn btn-mini" ng-class="{'btn-info': !slide.active, 'btn-success': slide.active}" ng-disabled="slide.active" ng-click="slide.active = true">select</button>
          {{$index}}: {{slide.text}}
        </li>
      </ul>
      <a class="btn" ng-click="addSlide()">Add Slide</a>
    </div>
    <div class="span6">
      Interval, in milliseconds: <input type="number" ng-model="myInterval">
      <br />Enter a negative number to stop the interval.
    </div>
  </div>
</div>
  </file>
  <file name="script.js">
function CarouselDemoCtrl($scope) {
  $scope.myInterval = 5000;
  var slides = $scope.slides = [];
  $scope.addSlide = function() {
    var newWidth = 200 + ((slides.length + (25 * slides.length)) % 150);
    slides.push({
      image: 'http://placekitten.com/' + newWidth + '/200',
      text: ['More','Extra','Lots of','Surplus'][slides.length % 4] + ' '
        ['Cats', 'Kittys', 'Felines', 'Cutes'][slides.length % 4]
    });
  };
  for (var i=0; i<4; i++) $scope.addSlide();
}
  </file>
  <file name="demo.css">
    .carousel-indicators {
      top: auto;
      bottom: 15px;
    }
  </file>
</example>
*/

.directive('slide', ['$parse', function ($parse) {
    return {
        require: '^carousel',
        restrict: 'EA',
        transclude: true,
        replace: true,
        templateUrl: 'template/carousel/slide.html',
        scope: {
        },
        link: function (scope, element, attrs, carouselCtrl) {
            //Set up optional 'active' = binding
            if (attrs.active) {
                var getActive = $parse(attrs.active);
                var setActive = getActive.assign;
                var lastValue = scope.active = getActive(scope.$parent);
                scope.$watch(function parentActiveWatch() {
                    var parentActive = getActive(scope.$parent);

                    if (parentActive !== scope.active) {
                        // we are out of sync and need to copy
                        if (parentActive !== lastValue) {
                            // parent changed and it has precedence
                            lastValue = scope.active = parentActive;
                        } else {
                            // if the parent can be assigned then do so
                            setActive(scope.$parent, parentActive = lastValue = scope.active);
                        }
                    }
                    return parentActive;
                });
            }

            carouselCtrl.addSlide(scope, element);
            //when the scope is destroyed then remove the slide from the current slides array
            scope.$on('$destroy', function () {
                carouselCtrl.removeSlide(scope);
            });

            scope.$watch('active', function (active) {
                if (active) {
                    carouselCtrl.select(scope);
                }
            });
        }
    };
}]);

angular.module('ui.bootstrap.position', [])

/**
 * A set of utility methods that can be use to retrieve position of DOM elements.
 * It is meant to be used where we need to absolute-position DOM elements in
 * relation to other, existing elements (this is the case for tooltips, popovers,
 * typeahead suggestions etc.).
 */
  .factory('$position', ['$document', '$window', function ($document, $window) {

      function getStyle(el, cssprop) {
          if (el.currentStyle) { //IE
              return el.currentStyle[cssprop];
          } else if ($window.getComputedStyle) {
              return $window.getComputedStyle(el)[cssprop];
          }
          // finally try and get inline style
          return el.style[cssprop];
      }

      /**
       * Checks if a given element is statically positioned
       * @param element - raw DOM element
       */
      function isStaticPositioned(element) {
          return (getStyle(element, "position") || 'static') === 'static';
      }

      /**
       * returns the closest, non-statically positioned parentOffset of a given element
       * @param element
       */
      var parentOffsetEl = function (element) {
          var docDomEl = $document[0];
          var offsetParent = element.offsetParent || docDomEl;
          while (offsetParent && offsetParent !== docDomEl && isStaticPositioned(offsetParent)) {
              offsetParent = offsetParent.offsetParent;
          }
          return offsetParent || docDomEl;
      };

      return {
          /**
           * Provides read-only equivalent of jQuery's position function:
           * http://api.jquery.com/position/
           */
          position: function (element) {
              var elBCR = this.offset(element);
              var offsetParentBCR = { top: 0, left: 0 };
              var offsetParentEl = parentOffsetEl(element[0]);
              if (offsetParentEl != $document[0]) {
                  offsetParentBCR = this.offset(angular.element(offsetParentEl));
                  offsetParentBCR.top += offsetParentEl.clientTop - offsetParentEl.scrollTop;
                  offsetParentBCR.left += offsetParentEl.clientLeft - offsetParentEl.scrollLeft;
              }

              var boundingClientRect = element[0].getBoundingClientRect();
              return {
                  width: boundingClientRect.width || element.prop('offsetWidth'),
                  height: boundingClientRect.height || element.prop('offsetHeight'),
                  top: elBCR.top - offsetParentBCR.top,
                  left: elBCR.left - offsetParentBCR.left
              };
          },

          /**
           * Provides read-only equivalent of jQuery's offset function:
           * http://api.jquery.com/offset/
           */
          offset: function (element) {
              var boundingClientRect = element[0].getBoundingClientRect();
              return {
                  width: boundingClientRect.width || element.prop('offsetWidth'),
                  height: boundingClientRect.height || element.prop('offsetHeight'),
                  top: boundingClientRect.top + ($window.pageYOffset || $document[0].body.scrollTop || $document[0].documentElement.scrollTop),
                  left: boundingClientRect.left + ($window.pageXOffset || $document[0].body.scrollLeft || $document[0].documentElement.scrollLeft)
              };
          }
      };
  }]);

angular.module('ui.bootstrap.datepicker', ['ui.bootstrap.position'])

.constant('datepickerConfig', {
    dayFormat: 'dd',
    monthFormat: 'MMMM',
    yearFormat: 'yyyy',
    dayHeaderFormat: 'EEE',
    dayTitleFormat: 'MMMM yyyy',
    monthTitleFormat: 'yyyy',
    showWeeks: true,
    startingDay: 0,
    yearRange: 20,
    minDate: null,
    maxDate: null
})

.controller('DatepickerController', ['$scope', '$attrs', 'dateFilter', 'datepickerConfig', function ($scope, $attrs, dateFilter, dtConfig) {
    var format = {
        day: getValue($attrs.dayFormat, dtConfig.dayFormat),
        month: getValue($attrs.monthFormat, dtConfig.monthFormat),
        year: getValue($attrs.yearFormat, dtConfig.yearFormat),
        dayHeader: getValue($attrs.dayHeaderFormat, dtConfig.dayHeaderFormat),
        dayTitle: getValue($attrs.dayTitleFormat, dtConfig.dayTitleFormat),
        monthTitle: getValue($attrs.monthTitleFormat, dtConfig.monthTitleFormat)
    },
    startingDay = getValue($attrs.startingDay, dtConfig.startingDay),
    yearRange = getValue($attrs.yearRange, dtConfig.yearRange);

    this.minDate = dtConfig.minDate ? new Date(dtConfig.minDate) : null;
    this.maxDate = dtConfig.maxDate ? new Date(dtConfig.maxDate) : null;

    function getValue(value, defaultValue) {
        return angular.isDefined(value) ? $scope.$parent.$eval(value) : defaultValue;
    }

    function getDaysInMonth(year, month) {
        return new Date(year, month, 0).getDate();
    }

    function getDates(startDate, n) {
        var dates = new Array(n);
        var current = startDate, i = 0;
        while (i < n) {
            dates[i++] = new Date(current);
            current.setDate(current.getDate() + 1);
        }
        return dates;
    }

    function makeDate(date, format, isSelected, isSecondary) {
        return { date: date, label: dateFilter(date, format), selected: !!isSelected, secondary: !!isSecondary };
    }

    this.modes = [
      {
          name: 'day',
          getVisibleDates: function (date, selected) {
              var year = date.getFullYear(), month = date.getMonth(), firstDayOfMonth = new Date(year, month, 1);
              var difference = startingDay - firstDayOfMonth.getDay(),
              numDisplayedFromPreviousMonth = (difference > 0) ? 7 - difference : -difference,
              firstDate = new Date(firstDayOfMonth), numDates = 0;

              if (numDisplayedFromPreviousMonth > 0) {
                  firstDate.setDate(-numDisplayedFromPreviousMonth + 1);
                  numDates += numDisplayedFromPreviousMonth; // Previous
              }
              numDates += getDaysInMonth(year, month + 1); // Current
              numDates += (7 - numDates % 7) % 7; // Next

              var days = getDates(firstDate, numDates), labels = new Array(7);
              for (var i = 0; i < numDates; i++) {
                  var dt = new Date(days[i]);
                  days[i] = makeDate(dt, format.day, (selected && selected.getDate() === dt.getDate() && selected.getMonth() === dt.getMonth() && selected.getFullYear() === dt.getFullYear()), dt.getMonth() !== month);
              }
              for (var j = 0; j < 7; j++) {
                  labels[j] = dateFilter(days[j].date, format.dayHeader);
              }
              return { objects: days, title: dateFilter(date, format.dayTitle), labels: labels };
          },
          compare: function (date1, date2) {
              return (new Date(date1.getFullYear(), date1.getMonth(), date1.getDate()) - new Date(date2.getFullYear(), date2.getMonth(), date2.getDate()));
          },
          split: 7,
          step: { months: 1 }
      },
      {
          name: 'month',
          getVisibleDates: function (date, selected) {
              var months = new Array(12), year = date.getFullYear();
              for (var i = 0; i < 12; i++) {
                  var dt = new Date(year, i, 1);
                  months[i] = makeDate(dt, format.month, (selected && selected.getMonth() === i && selected.getFullYear() === year));
              }
              return { objects: months, title: dateFilter(date, format.monthTitle) };
          },
          compare: function (date1, date2) {
              return new Date(date1.getFullYear(), date1.getMonth()) - new Date(date2.getFullYear(), date2.getMonth());
          },
          split: 3,
          step: { years: 1 }
      },
      {
          name: 'year',
          getVisibleDates: function (date, selected) {
              var years = new Array(yearRange), year = date.getFullYear(), startYear = parseInt((year - 1) / yearRange, 10) * yearRange + 1;
              for (var i = 0; i < yearRange; i++) {
                  var dt = new Date(startYear + i, 0, 1);
                  years[i] = makeDate(dt, format.year, (selected && selected.getFullYear() === dt.getFullYear()));
              }
              return { objects: years, title: [years[0].label, years[yearRange - 1].label].join(' - ') };
          },
          compare: function (date1, date2) {
              return date1.getFullYear() - date2.getFullYear();
          },
          split: 5,
          step: { years: yearRange }
      }
    ];

    this.isDisabled = function (date, mode) {
        var currentMode = this.modes[mode || 0];
        return ((this.minDate && currentMode.compare(date, this.minDate) < 0) || (this.maxDate && currentMode.compare(date, this.maxDate) > 0) || ($scope.dateDisabled && $scope.dateDisabled({ date: date, mode: currentMode.name })));
    };
}])

.directive('datepicker', ['dateFilter', '$parse', 'datepickerConfig', '$log', function (dateFilter, $parse, datepickerConfig, $log) {
    return {
        restrict: 'EA',
        replace: true,
        templateUrl: 'template/datepicker/datepicker.html',
        scope: {
            dateDisabled: '&'
        },
        require: ['datepicker', '?^ngModel'],
        controller: 'DatepickerController',
        link: function (scope, element, attrs, ctrls) {
            var datepickerCtrl = ctrls[0], ngModel = ctrls[1];

            if (!ngModel) {
                return; // do nothing if no ng-model
            }

            // Configuration parameters
            var mode = 0, selected = new Date(), showWeeks = datepickerConfig.showWeeks;

            if (attrs.showWeeks) {
                scope.$parent.$watch($parse(attrs.showWeeks), function (value) {
                    showWeeks = !!value;
                    updateShowWeekNumbers();
                });
            } else {
                updateShowWeekNumbers();
            }

            if (attrs.min) {
                scope.$parent.$watch($parse(attrs.min), function (value) {
                    datepickerCtrl.minDate = value ? new Date(value) : null;
                    refill();
                });
            }
            if (attrs.max) {
                scope.$parent.$watch($parse(attrs.max), function (value) {
                    datepickerCtrl.maxDate = value ? new Date(value) : null;
                    refill();
                });
            }

            function updateShowWeekNumbers() {
                scope.showWeekNumbers = mode === 0 && showWeeks;
            }

            // Split array into smaller arrays
            function split(arr, size) {
                var arrays = [];
                while (arr.length > 0) {
                    arrays.push(arr.splice(0, size));
                }
                return arrays;
            }

            function refill(updateSelected) {
                var date = null, valid = true;

                if (ngModel.$modelValue) {
                    date = new Date(ngModel.$modelValue);

                    if (isNaN(date)) {
                        valid = false;
                        $log.error('Datepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.');
                    } else if (updateSelected) {
                        selected = date;
                    }
                }
                ngModel.$setValidity('date', valid);

                var currentMode = datepickerCtrl.modes[mode], data = currentMode.getVisibleDates(selected, date);
                angular.forEach(data.objects, function (obj) {
                    obj.disabled = datepickerCtrl.isDisabled(obj.date, mode);
                });

                ngModel.$setValidity('date-disabled', (!date || !datepickerCtrl.isDisabled(date)));

                scope.rows = split(data.objects, currentMode.split);
                scope.labels = data.labels || [];
                scope.title = data.title;
            }

            function setMode(value) {
                mode = value;
                updateShowWeekNumbers();
                refill();
            }

            ngModel.$render = function () {
                refill(true);
            };

            scope.select = function (date) {
                if (mode === 0) {
                    var dt = ngModel.$modelValue ? new Date(ngModel.$modelValue) : new Date(0, 0, 0, 0, 0, 0, 0);
                    dt.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                    ngModel.$setViewValue(dt);
                    refill(true);
                } else {
                    selected = date;
                    setMode(mode - 1);
                }
            };
            scope.move = function (direction) {
                var step = datepickerCtrl.modes[mode].step;
                selected.setMonth(selected.getMonth() + direction * (step.months || 0));
                selected.setFullYear(selected.getFullYear() + direction * (step.years || 0));
                refill();
            };
            scope.toggleMode = function () {
                setMode((mode + 1) % datepickerCtrl.modes.length);
            };
            scope.getWeekNumber = function (row) {
                return (mode === 0 && scope.showWeekNumbers && row.length === 7) ? getISO8601WeekNumber(row[0].date) : null;
            };

            function getISO8601WeekNumber(date) {
                var checkDate = new Date(date);
                checkDate.setDate(checkDate.getDate() + 4 - (checkDate.getDay() || 7)); // Thursday
                var time = checkDate.getTime();
                checkDate.setMonth(0); // Compare with Jan 1
                checkDate.setDate(1);
                return Math.floor(Math.round((time - checkDate) / 86400000) / 7) + 1;
            }
        }
    };
}])

.constant('datepickerPopupConfig', {
    dateFormat: 'yyyy-MM-dd',
    currentText: 'Today',
    toggleWeeksText: 'Weeks',
    clearText: 'Clear',
    closeText: 'Done',
    closeOnDateSelection: true,
    appendToBody: false,
    showButtonBar: true
})

.directive('datepickerPopup', ['$compile', '$parse', '$document', '$position', 'dateFilter', 'datepickerPopupConfig', 'datepickerConfig',
function ($compile, $parse, $document, $position, dateFilter, datepickerPopupConfig, datepickerConfig) {
    return {
        restrict: 'EA',
        require: 'ngModel',
        link: function (originalScope, element, attrs, ngModel) {
            var scope = originalScope.$new(), // create a child scope so we are not polluting original one
                dateFormat,
                closeOnDateSelection = angular.isDefined(attrs.closeOnDateSelection) ? originalScope.$eval(attrs.closeOnDateSelection) : datepickerPopupConfig.closeOnDateSelection,
                appendToBody = angular.isDefined(attrs.datepickerAppendToBody) ? originalScope.$eval(attrs.datepickerAppendToBody) : datepickerPopupConfig.appendToBody;

            attrs.$observe('datepickerPopup', function (value) {
                dateFormat = value || datepickerPopupConfig.dateFormat;
                ngModel.$render();
            });

            scope.showButtonBar = angular.isDefined(attrs.showButtonBar) ? originalScope.$eval(attrs.showButtonBar) : datepickerPopupConfig.showButtonBar;

            originalScope.$on('$destroy', function () {
                $popup.remove();
                scope.$destroy();
            });

            attrs.$observe('currentText', function (text) {
                scope.currentText = angular.isDefined(text) ? text : datepickerPopupConfig.currentText;
            });
            attrs.$observe('toggleWeeksText', function (text) {
                scope.toggleWeeksText = angular.isDefined(text) ? text : datepickerPopupConfig.toggleWeeksText;
            });
            attrs.$observe('clearText', function (text) {
                scope.clearText = angular.isDefined(text) ? text : datepickerPopupConfig.clearText;
            });
            attrs.$observe('closeText', function (text) {
                scope.closeText = angular.isDefined(text) ? text : datepickerPopupConfig.closeText;
            });

            var getIsOpen, setIsOpen;
            if (attrs.isOpen) {
                getIsOpen = $parse(attrs.isOpen);
                setIsOpen = getIsOpen.assign;

                originalScope.$watch(getIsOpen, function updateOpen(value) {
                    scope.isOpen = !!value;
                });
            }
            scope.isOpen = getIsOpen ? getIsOpen(originalScope) : false; // Initial state

            function setOpen(value) {
                if (setIsOpen) {
                    setIsOpen(originalScope, !!value);
                } else {
                    scope.isOpen = !!value;
                }
            }

            var documentClickBind = function (event) {
                if (scope.isOpen && event.target !== element[0]) {
                    scope.$apply(function () {
                        setOpen(false);
                    });
                }
            };

            var elementFocusBind = function () {
                scope.$apply(function () {
                    setOpen(true);
                });
            };

            // popup element used to display calendar
            var popupEl = angular.element('<div datepicker-popup-wrap><div datepicker></div></div>');
            popupEl.attr({
                'ng-model': 'date',
                'ng-change': 'dateSelection()'
            });
            var datepickerEl = angular.element(popupEl.children()[0]),
                datepickerOptions = {};
            if (attrs.datepickerOptions) {
                datepickerOptions = originalScope.$eval(attrs.datepickerOptions);
                datepickerEl.attr(angular.extend({}, datepickerOptions));
            }

            // TODO: reverse from dateFilter string to Date object
            function parseDate(viewValue) {
                if (!viewValue) {
                    ngModel.$setValidity('date', true);
                    return null;
                } else if (angular.isDate(viewValue)) {
                    ngModel.$setValidity('date', true);
                    return viewValue;
                } else if (angular.isString(viewValue)) {
                    var date = new Date(viewValue);
                    if (isNaN(date)) {
                        ngModel.$setValidity('date', false);
                        return undefined;
                    } else {
                        ngModel.$setValidity('date', true);
                        return date;
                    }
                } else {
                    ngModel.$setValidity('date', false);
                    return undefined;
                }
            }
            ngModel.$parsers.unshift(parseDate);

            // Inner change
            scope.dateSelection = function (dt) {
                if (angular.isDefined(dt)) {
                    scope.date = dt;
                }
                ngModel.$setViewValue(scope.date);
                ngModel.$render();

                if (closeOnDateSelection) {
                    setOpen(false);
                }
            };

            element.bind('input change keyup', function () {
                scope.$apply(function () {
                    scope.date = ngModel.$modelValue;
                });
            });

            // Outter change
            ngModel.$render = function () {
                var date = ngModel.$viewValue ? dateFilter(ngModel.$viewValue, dateFormat) : '';
                element.val(date);
                scope.date = ngModel.$modelValue;
            };

            function addWatchableAttribute(attribute, scopeProperty, datepickerAttribute) {
                if (attribute) {
                    originalScope.$watch($parse(attribute), function (value) {
                        scope[scopeProperty] = value;
                    });
                    datepickerEl.attr(datepickerAttribute || scopeProperty, scopeProperty);
                }
            }
            addWatchableAttribute(attrs.min, 'min');
            addWatchableAttribute(attrs.max, 'max');
            if (attrs.showWeeks) {
                addWatchableAttribute(attrs.showWeeks, 'showWeeks', 'show-weeks');
            } else {
                scope.showWeeks = 'show-weeks' in datepickerOptions ? datepickerOptions['show-weeks'] : datepickerConfig.showWeeks;
                datepickerEl.attr('show-weeks', 'showWeeks');
            }
            if (attrs.dateDisabled) {
                datepickerEl.attr('date-disabled', attrs.dateDisabled);
            }

            function updatePosition() {
                scope.position = appendToBody ? $position.offset(element) : $position.position(element);
                scope.position.top = scope.position.top + element.prop('offsetHeight');
            }

            var documentBindingInitialized = false, elementFocusInitialized = false;
            scope.$watch('isOpen', function (value) {
                if (value) {
                    updatePosition();
                    $document.bind('click', documentClickBind);
                    if (elementFocusInitialized) {
                        element.unbind('focus', elementFocusBind);
                    }
                    element[0].focus();
                    documentBindingInitialized = true;
                } else {
                    if (documentBindingInitialized) {
                        $document.unbind('click', documentClickBind);
                    }
                    element.bind('focus', elementFocusBind);
                    elementFocusInitialized = true;
                }

                if (setIsOpen) {
                    setIsOpen(originalScope, value);
                }
            });

            scope.today = function () {
                scope.dateSelection(new Date());
            };
            scope.clear = function () {
                scope.dateSelection(null);
            };

            var $popup = $compile(popupEl)(scope);
            if (appendToBody) {
                $document.find('body').append($popup);
            } else {
                element.after($popup);
            }
        }
    };
}])

.directive('datepickerPopupWrap', function () {
    return {
        restrict: 'EA',
        replace: true,
        transclude: true,
        templateUrl: 'template/datepicker/popup.html',
        link: function (scope, element, attrs) {
            element.bind('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
            });
        }
    };
});

/*
 * dropdownToggle - Provides dropdown menu functionality in place of bootstrap js
 * @restrict class or attribute
 * @example:
   <li class="dropdown">
     <a class="dropdown-toggle">My Dropdown Menu</a>
     <ul class="dropdown-menu">
       <li ng-repeat="choice in dropChoices">
         <a ng-href="{{choice.href}}">{{choice.text}}</a>
       </li>
     </ul>
   </li>
 */

angular.module('ui.bootstrap.dropdownToggle', []).directive('dropdownToggle', ['$document', '$location', function ($document, $location) {
    var openElement = null,
        closeMenu = angular.noop;
    return {
        restrict: 'CA',
        link: function (scope, element, attrs) {
            scope.$watch('$location.path', function () { closeMenu(); });
            element.parent().bind('click', function () { closeMenu(); });
            element.bind('click', function (event) {

                var elementWasOpen = (element === openElement);

                event.preventDefault();
                event.stopPropagation();

                if (!!openElement) {
                    closeMenu();
                }

                if (!elementWasOpen && !element.hasClass('disabled') && !element.prop('disabled')) {
                    element.parent().addClass('open');
                    openElement = element;
                    closeMenu = function (event) {
                        if (event) {
                            event.preventDefault();
                            event.stopPropagation();
                        }
                        $document.unbind('click', closeMenu);
                        element.parent().removeClass('open');
                        closeMenu = angular.noop;
                        openElement = null;
                    };
                    $document.bind('click', closeMenu);
                }
            });
        }
    };
}]);

angular.module('ui.bootstrap.modal', ['ui.bootstrap.transition'])

/**
 * A helper, internal data structure that acts as a map but also allows getting / removing
 * elements in the LIFO order
 */
  .factory('$$stackedMap', function () {
      return {
          createNew: function () {
              var stack = [];

              return {
                  add: function (key, value) {
                      stack.push({
                          key: key,
                          value: value
                      });
                  },
                  get: function (key) {
                      for (var i = 0; i < stack.length; i++) {
                          if (key == stack[i].key) {
                              return stack[i];
                          }
                      }
                  },
                  keys: function () {
                      var keys = [];
                      for (var i = 0; i < stack.length; i++) {
                          keys.push(stack[i].key);
                      }
                      return keys;
                  },
                  top: function () {
                      return stack[stack.length - 1];
                  },
                  remove: function (key) {
                      var idx = -1;
                      for (var i = 0; i < stack.length; i++) {
                          if (key == stack[i].key) {
                              idx = i;
                              break;
                          }
                      }
                      return stack.splice(idx, 1)[0];
                  },
                  removeTop: function () {
                      return stack.splice(stack.length - 1, 1)[0];
                  },
                  length: function () {
                      return stack.length;
                  }
              };
          }
      };
  })

/**
 * A helper directive for the $modal service. It creates a backdrop element.
 */
  .directive('modalBackdrop', ['$timeout', function ($timeout) {
      return {
          restrict: 'EA',
          replace: true,
          templateUrl: 'template/modal/backdrop.html',
          link: function (scope) {

              scope.animate = false;

              //trigger CSS transitions
              $timeout(function () {
                  scope.animate = true;
              });
          }
      };
  }])

  .directive('modalWindow', ['$modalStack', '$timeout', function ($modalStack, $timeout) {
      return {
          restrict: 'EA',
          scope: {
              index: '@',
              animate: '='
          },
          replace: true,
          transclude: true,
          templateUrl: 'template/modal/window.html',
          link: function (scope, element, attrs) {
              scope.windowClass = attrs.windowClass || '';

              $timeout(function () {
                  // trigger CSS transitions
                  scope.animate = true;
                  // focus a freshly-opened modal
                  element[0].focus();
              });

              scope.close = function (evt) {
                  var modal = $modalStack.getTop();
                  if (modal && modal.value.backdrop && modal.value.backdrop != 'static' && (evt.target === evt.currentTarget)) {
                      evt.preventDefault();
                      evt.stopPropagation();
                      $modalStack.dismiss(modal.key, 'backdrop click');
                  }
              };
          }
      };
  }])

  .factory('$modalStack', ['$transition', '$timeout', '$document', '$compile', '$rootScope', '$$stackedMap',
    function ($transition, $timeout, $document, $compile, $rootScope, $$stackedMap) {

        var OPENED_MODAL_CLASS = 'modal-open';

        var backdropDomEl, backdropScope;
        var openedWindows = $$stackedMap.createNew();
        var $modalStack = {};

        function backdropIndex() {
            var topBackdropIndex = -1;
            var opened = openedWindows.keys();
            for (var i = 0; i < opened.length; i++) {
                if (openedWindows.get(opened[i]).value.backdrop) {
                    topBackdropIndex = i;
                }
            }
            return topBackdropIndex;
        }

        $rootScope.$watch(backdropIndex, function (newBackdropIndex) {
            if (backdropScope) {
                backdropScope.index = newBackdropIndex;
            }
        });

        function removeModalWindow(modalInstance) {

            var body = $document.find('body').eq(0);
            var modalWindow = openedWindows.get(modalInstance).value;

            //clean up the stack
            openedWindows.remove(modalInstance);

            //remove window DOM element
            removeAfterAnimate(modalWindow.modalDomEl, modalWindow.modalScope, 300, checkRemoveBackdrop);
            body.toggleClass(OPENED_MODAL_CLASS, openedWindows.length() > 0);
        }

        function checkRemoveBackdrop() {
            //remove backdrop if no longer needed
            if (backdropDomEl && backdropIndex() == -1) {
                var backdropScopeRef = backdropScope;
                removeAfterAnimate(backdropDomEl, backdropScope, 150, function () {
                    backdropScopeRef.$destroy();
                    backdropScopeRef = null;
                });
                backdropDomEl = undefined;
                backdropScope = undefined;
            }
        }

        function removeAfterAnimate(domEl, scope, emulateTime, done) {
            // Closing animation
            scope.animate = false;

            var transitionEndEventName = $transition.transitionEndEventName;
            if (transitionEndEventName) {
                // transition out
                var timeout = $timeout(afterAnimating, emulateTime);

                domEl.bind(transitionEndEventName, function () {
                    $timeout.cancel(timeout);
                    afterAnimating();
                    scope.$apply();
                });
            } else {
                // Ensure this call is async
                $timeout(afterAnimating, 0);
            }

            function afterAnimating() {
                if (afterAnimating.done) {
                    return;
                }
                afterAnimating.done = true;

                domEl.remove();
                if (done) {
                    done();
                }
            }
        }

        $document.bind('keydown', function (evt) {
            var modal;

            if (evt.which === 27) {
                modal = openedWindows.top();
                if (modal && modal.value.keyboard) {
                    $rootScope.$apply(function () {
                        $modalStack.dismiss(modal.key);
                    });
                }
            }
        });

        $modalStack.open = function (modalInstance, modal) {

            openedWindows.add(modalInstance, {
                deferred: modal.deferred,
                modalScope: modal.scope,
                backdrop: modal.backdrop,
                keyboard: modal.keyboard
            });

            var body = $document.find('body').eq(0),
                currBackdropIndex = backdropIndex();

            if (currBackdropIndex >= 0 && !backdropDomEl) {
                backdropScope = $rootScope.$new(true);
                backdropScope.index = currBackdropIndex;
                backdropDomEl = $compile('<div modal-backdrop></div>')(backdropScope);
                body.append(backdropDomEl);
            }

            var angularDomEl = angular.element('<div modal-window></div>');
            angularDomEl.attr('window-class', modal.windowClass);
            angularDomEl.attr('index', openedWindows.length() - 1);
            angularDomEl.attr('animate', 'animate');
            angularDomEl.html(modal.content);

            var modalDomEl = $compile(angularDomEl)(modal.scope);
            openedWindows.top().value.modalDomEl = modalDomEl;
            body.append(modalDomEl);
            body.addClass(OPENED_MODAL_CLASS);
        };

        $modalStack.close = function (modalInstance, result) {
            var modalWindow = openedWindows.get(modalInstance).value;
            if (modalWindow) {
                modalWindow.deferred.resolve(result);
                removeModalWindow(modalInstance);
            }
        };

        $modalStack.dismiss = function (modalInstance, reason) {
            var modalWindow = openedWindows.get(modalInstance).value;
            if (modalWindow) {
                modalWindow.deferred.reject(reason);
                removeModalWindow(modalInstance);
            }
        };

        $modalStack.dismissAll = function (reason) {
            var topModal = this.getTop();
            while (topModal) {
                this.dismiss(topModal.key, reason);
                topModal = this.getTop();
            }
        };

        $modalStack.getTop = function () {
            return openedWindows.top();
        };

        return $modalStack;
    }])

  .provider('$modal', function () {

      var $modalProvider = {
          options: {
              backdrop: true, //can be also false or 'static'
              keyboard: true
          },
          $get: ['$injector', '$rootScope', '$q', '$http', '$templateCache', '$controller', '$modalStack',
            function ($injector, $rootScope, $q, $http, $templateCache, $controller, $modalStack) {

                var $modal = {};

                function getTemplatePromise(options) {
                    return options.template ? $q.when(options.template) :
                      $http.get(options.templateUrl, { cache: $templateCache }).then(function (result) {
                          return result.data;
                      });
                }

                function getResolvePromises(resolves) {
                    var promisesArr = [];
                    angular.forEach(resolves, function (value, key) {
                        if (angular.isFunction(value) || angular.isArray(value)) {
                            promisesArr.push($q.when($injector.invoke(value)));
                        }
                    });
                    return promisesArr;
                }

                $modal.open = function (modalOptions) {

                    var modalResultDeferred = $q.defer();
                    var modalOpenedDeferred = $q.defer();

                    //prepare an instance of a modal to be injected into controllers and returned to a caller
                    var modalInstance = {
                        result: modalResultDeferred.promise,
                        opened: modalOpenedDeferred.promise,
                        close: function (result) {
                            $modalStack.close(modalInstance, result);
                        },
                        dismiss: function (reason) {
                            $modalStack.dismiss(modalInstance, reason);
                        }
                    };

                    //merge and clean up options
                    modalOptions = angular.extend({}, $modalProvider.options, modalOptions);
                    modalOptions.resolve = modalOptions.resolve || {};

                    //verify options
                    if (!modalOptions.template && !modalOptions.templateUrl) {
                        throw new Error('One of template or templateUrl options is required.');
                    }

                    var templateAndResolvePromise =
                      $q.all([getTemplatePromise(modalOptions)].concat(getResolvePromises(modalOptions.resolve)));


                    templateAndResolvePromise.then(function resolveSuccess(tplAndVars) {

                        var modalScope = (modalOptions.scope || $rootScope).$new();
                        modalScope.$close = modalInstance.close;
                        modalScope.$dismiss = modalInstance.dismiss;

                        var ctrlInstance, ctrlLocals = {};
                        var resolveIter = 1;

                        //controllers
                        if (modalOptions.controller) {
                            ctrlLocals.$scope = modalScope;
                            ctrlLocals.$modalInstance = modalInstance;
                            angular.forEach(modalOptions.resolve, function (value, key) {
                                ctrlLocals[key] = tplAndVars[resolveIter++];
                            });

                            ctrlInstance = $controller(modalOptions.controller, ctrlLocals);
                        }

                        $modalStack.open(modalInstance, {
                            scope: modalScope,
                            deferred: modalResultDeferred,
                            content: tplAndVars[0],
                            backdrop: modalOptions.backdrop,
                            keyboard: modalOptions.keyboard,
                            windowClass: modalOptions.windowClass
                        });

                    }, function resolveError(reason) {
                        modalResultDeferred.reject(reason);
                    });

                    templateAndResolvePromise.then(function () {
                        modalOpenedDeferred.resolve(true);
                    }, function () {
                        modalOpenedDeferred.reject(false);
                    });

                    return modalInstance;
                };

                return $modal;
            }]
      };

      return $modalProvider;
  });

angular.module('ui.bootstrap.pagination', [])

.controller('PaginationController', ['$scope', '$attrs', '$parse', '$interpolate', function ($scope, $attrs, $parse, $interpolate) {
    var self = this,
        setNumPages = $attrs.numPages ? $parse($attrs.numPages).assign : angular.noop;

    this.init = function (defaultItemsPerPage) {
        if ($attrs.itemsPerPage) {
            $scope.$parent.$watch($parse($attrs.itemsPerPage), function (value) {
                self.itemsPerPage = parseInt(value, 10);
                $scope.totalPages = self.calculateTotalPages();
            });
        } else {
            this.itemsPerPage = defaultItemsPerPage;
        }
    };

    this.noPrevious = function () {
        return this.page === 1;
    };
    this.noNext = function () {
        return this.page === $scope.totalPages;
    };

    this.isActive = function (page) {
        return this.page === page;
    };

    this.calculateTotalPages = function () {
        var totalPages = this.itemsPerPage < 1 ? 1 : Math.ceil($scope.totalItems / this.itemsPerPage);
        return Math.max(totalPages || 0, 1);
    };

    this.getAttributeValue = function (attribute, defaultValue, interpolate) {
        return angular.isDefined(attribute) ? (interpolate ? $interpolate(attribute)($scope.$parent) : $scope.$parent.$eval(attribute)) : defaultValue;
    };

    this.render = function () {
        this.page = parseInt($scope.page, 10) || 1;
        if (this.page > 0 && this.page <= $scope.totalPages) {
            $scope.pages = this.getPages(this.page, $scope.totalPages);
        }
    };

    $scope.selectPage = function (page) {
        if (!self.isActive(page) && page > 0 && page <= $scope.totalPages) {
            $scope.page = page;
            $scope.onSelectPage({ page: page });
        }
    };

    $scope.$watch('page', function () {
        self.render();
    });

    $scope.$watch('totalItems', function () {
        $scope.totalPages = self.calculateTotalPages();
    });

    $scope.$watch('totalPages', function (value) {
        setNumPages($scope.$parent, value); // Readonly variable

        if (self.page > value) {
            $scope.selectPage(value);
        } else {
            self.render();
        }
    });
}])

.constant('paginationConfig', {
    itemsPerPage: 10,
    boundaryLinks: false,
    directionLinks: true,
    firstText: 'First',
    previousText: 'Previous',
    nextText: 'Next',
    lastText: 'Last',
    rotate: true
})

.directive('pagination', ['$parse', 'paginationConfig', function ($parse, config) {
    return {
        restrict: 'EA',
        scope: {
            page: '=',
            totalItems: '=',
            onSelectPage: ' &'
        },
        controller: 'PaginationController',
        templateUrl: 'template/pagination/pagination.html',
        replace: true,
        link: function (scope, element, attrs, paginationCtrl) {

            // Setup configuration parameters
            var maxSize,
            boundaryLinks = paginationCtrl.getAttributeValue(attrs.boundaryLinks, config.boundaryLinks),
            directionLinks = paginationCtrl.getAttributeValue(attrs.directionLinks, config.directionLinks),
            firstText = paginationCtrl.getAttributeValue(attrs.firstText, config.firstText, true),
            previousText = paginationCtrl.getAttributeValue(attrs.previousText, config.previousText, true),
            nextText = paginationCtrl.getAttributeValue(attrs.nextText, config.nextText, true),
            lastText = paginationCtrl.getAttributeValue(attrs.lastText, config.lastText, true),
            rotate = paginationCtrl.getAttributeValue(attrs.rotate, config.rotate);

            paginationCtrl.init(config.itemsPerPage);

            if (attrs.maxSize) {
                scope.$parent.$watch($parse(attrs.maxSize), function (value) {
                    maxSize = parseInt(value, 10);
                    paginationCtrl.render();
                });
            }

            // Create page object used in template
            function makePage(number, text, isActive, isDisabled) {
                return {
                    number: number,
                    text: text,
                    active: isActive,
                    disabled: isDisabled
                };
            }

            paginationCtrl.getPages = function (currentPage, totalPages) {
                var pages = [];

                // Default page limits
                var startPage = 1, endPage = totalPages;
                var isMaxSized = (angular.isDefined(maxSize) && maxSize < totalPages);

                // recompute if maxSize
                if (isMaxSized) {
                    if (rotate) {
                        // Current page is displayed in the middle of the visible ones
                        startPage = Math.max(currentPage - Math.floor(maxSize / 2), 1);
                        endPage = startPage + maxSize - 1;

                        // Adjust if limit is exceeded
                        if (endPage > totalPages) {
                            endPage = totalPages;
                            startPage = endPage - maxSize + 1;
                        }
                    } else {
                        // Visible pages are paginated with maxSize
                        startPage = ((Math.ceil(currentPage / maxSize) - 1) * maxSize) + 1;

                        // Adjust last page if limit is exceeded
                        endPage = Math.min(startPage + maxSize - 1, totalPages);
                    }
                }

                // Add page number links
                for (var number = startPage; number <= endPage; number++) {
                    var page = makePage(number, number, paginationCtrl.isActive(number), false);
                    pages.push(page);
                }

                // Add links to move between page sets
                if (isMaxSized && !rotate) {
                    if (startPage > 1) {
                        var previousPageSet = makePage(startPage - 1, '...', false, false);
                        pages.unshift(previousPageSet);
                    }

                    if (endPage < totalPages) {
                        var nextPageSet = makePage(endPage + 1, '...', false, false);
                        pages.push(nextPageSet);
                    }
                }

                // Add previous & next links
                if (directionLinks) {
                    var previousPage = makePage(currentPage - 1, previousText, false, paginationCtrl.noPrevious());
                    pages.unshift(previousPage);

                    var nextPage = makePage(currentPage + 1, nextText, false, paginationCtrl.noNext());
                    pages.push(nextPage);
                }

                // Add first & last links
                if (boundaryLinks) {
                    var firstPage = makePage(1, firstText, false, paginationCtrl.noPrevious());
                    pages.unshift(firstPage);

                    var lastPage = makePage(totalPages, lastText, false, paginationCtrl.noNext());
                    pages.push(lastPage);
                }

                return pages;
            };
        }
    };
}])

.constant('pagerConfig', {
    itemsPerPage: 10,
    previousText: 'Â« Previous',
    nextText: 'Next Â»',
    align: true
})

.directive('pager', ['pagerConfig', function (config) {
    return {
        restrict: 'EA',
        scope: {
            page: '=',
            totalItems: '=',
            onSelectPage: ' &'
        },
        controller: 'PaginationController',
        templateUrl: 'template/pagination/pager.html',
        replace: true,
        link: function (scope, element, attrs, paginationCtrl) {

            // Setup configuration parameters
            var previousText = paginationCtrl.getAttributeValue(attrs.previousText, config.previousText, true),
            nextText = paginationCtrl.getAttributeValue(attrs.nextText, config.nextText, true),
            align = paginationCtrl.getAttributeValue(attrs.align, config.align);

            paginationCtrl.init(config.itemsPerPage);

            // Create page object used in template
            function makePage(number, text, isDisabled, isPrevious, isNext) {
                return {
                    number: number,
                    text: text,
                    disabled: isDisabled,
                    previous: (align && isPrevious),
                    next: (align && isNext)
                };
            }

            paginationCtrl.getPages = function (currentPage) {
                return [
                  makePage(currentPage - 1, previousText, paginationCtrl.noPrevious(), true, false),
                  makePage(currentPage + 1, nextText, paginationCtrl.noNext(), false, true)
                ];
            };
        }
    };
}]);

/**
 * The following features are still outstanding: animation as a
 * function, placement as a function, inside, support for more triggers than
 * just mouse enter/leave, html tooltips, and selector delegation.
 */
angular.module('ui.bootstrap.tooltip', ['ui.bootstrap.position', 'ui.bootstrap.bindHtml'])

/**
 * The $tooltip service creates tooltip- and popover-like directives as well as
 * houses global options for them.
 */
.provider('$tooltip', function () {
    // The default options tooltip and popover.
    var defaultOptions = {
        placement: 'top',
        animation: true,
        popupDelay: 0
    };

    // Default hide triggers for each show trigger
    var triggerMap = {
        'mouseenter': 'mouseleave',
        'click': 'click',
        'focus': 'blur'
    };

    // The options specified to the provider globally.
    var globalOptions = {};

    /**
     * `options({})` allows global configuration of all tooltips in the
     * application.
     *
     *   var app = angular.module( 'App', ['ui.bootstrap.tooltip'], function( $tooltipProvider ) {
     *     // place tooltips left instead of top by default
     *     $tooltipProvider.options( { placement: 'left' } );
     *   });
     */
    this.options = function (value) {
        angular.extend(globalOptions, value);
    };

    /**
     * This allows you to extend the set of trigger mappings available. E.g.:
     *
     *   $tooltipProvider.setTriggers( 'openTrigger': 'closeTrigger' );
     */
    this.setTriggers = function setTriggers(triggers) {
        angular.extend(triggerMap, triggers);
    };

    /**
     * This is a helper function for translating camel-case to snake-case.
     */
    function snake_case(name) {
        var regexp = /[A-Z]/g;
        var separator = '-';
        return name.replace(regexp, function (letter, pos) {
            return (pos ? separator : '') + letter.toLowerCase();
        });
    }

    /**
     * Returns the actual instance of the $tooltip service.
     * TODO support multiple triggers
     */
    this.$get = ['$window', '$compile', '$timeout', '$parse', '$document', '$position', '$interpolate', function ($window, $compile, $timeout, $parse, $document, $position, $interpolate) {
        return function $tooltip(type, prefix, defaultTriggerShow) {
            var options = angular.extend({}, defaultOptions, globalOptions);

            /**
             * Returns an object of show and hide triggers.
             *
             * If a trigger is supplied,
             * it is used to show the tooltip; otherwise, it will use the `trigger`
             * option passed to the `$tooltipProvider.options` method; else it will
             * default to the trigger supplied to this directive factory.
             *
             * The hide trigger is based on the show trigger. If the `trigger` option
             * was passed to the `$tooltipProvider.options` method, it will use the
             * mapped trigger from `triggerMap` or the passed trigger if the map is
             * undefined; otherwise, it uses the `triggerMap` value of the show
             * trigger; else it will just use the show trigger.
             */
            function getTriggers(trigger) {
                var show = trigger || options.trigger || defaultTriggerShow;
                var hide = triggerMap[show] || show;
                return {
                    show: show,
                    hide: hide
                };
            }

            var directiveName = snake_case(type);

            var startSym = $interpolate.startSymbol();
            var endSym = $interpolate.endSymbol();
            var template =
              '<div ' + directiveName + '-popup ' +
                'title="' + startSym + 'tt_title' + endSym + '" ' +
                'content="' + startSym + 'tt_content' + endSym + '" ' +
                'placement="' + startSym + 'tt_placement' + endSym + '" ' +
                'animation="tt_animation" ' +
                'is-open="tt_isOpen"' +
                '>' +
              '</div>';

            return {
                restrict: 'EA',
                scope: true,
                compile: function (tElem, tAttrs) {
                    var tooltipLinker = $compile(template);

                    return function link(scope, element, attrs) {
                        var tooltip;
                        var transitionTimeout;
                        var popupTimeout;
                        var appendToBody = angular.isDefined(options.appendToBody) ? options.appendToBody : false;
                        var triggers = getTriggers(undefined);
                        var hasRegisteredTriggers = false;
                        var hasEnableExp = angular.isDefined(attrs[prefix + 'Enable']);

                        var positionTooltip = function () {
                            var position,
                              ttWidth,
                              ttHeight,
                              ttPosition;
                            // Get the position of the directive element.
                            position = appendToBody ? $position.offset(element) : $position.position(element);

                            // Get the height and width of the tooltip so we can center it.
                            ttWidth = tooltip.prop('offsetWidth');
                            ttHeight = tooltip.prop('offsetHeight');

                            // Calculate the tooltip's top and left coordinates to center it with
                            // this directive.
                            switch (scope.tt_placement) {
                                case 'right':
                                    ttPosition = {
                                        top: position.top + position.height / 2 - ttHeight / 2,
                                        left: position.left + position.width
                                    };
                                    break;
                                case 'bottom':
                                    ttPosition = {
                                        top: position.top + position.height,
                                        left: position.left + position.width / 2 - ttWidth / 2
                                    };
                                    break;
                                case 'left':
                                    ttPosition = {
                                        top: position.top + position.height / 2 - ttHeight / 2,
                                        left: position.left - ttWidth
                                    };
                                    break;
                                default:
                                    ttPosition = {
                                        top: position.top - ttHeight,
                                        left: position.left + position.width / 2 - ttWidth / 2
                                    };
                                    break;
                            }

                            ttPosition.top += 'px';
                            ttPosition.left += 'px';

                            // Now set the calculated positioning.
                            tooltip.css(ttPosition);

                        };

                        // By default, the tooltip is not open.
                        // TODO add ability to start tooltip opened
                        scope.tt_isOpen = false;

                        function toggleTooltipBind() {
                            if (!scope.tt_isOpen) {
                                showTooltipBind();
                            } else {
                                hideTooltipBind();
                            }
                        }

                        // Show the tooltip with delay if specified, otherwise show it immediately
                        function showTooltipBind() {
                            if (hasEnableExp && !scope.$eval(attrs[prefix + 'Enable'])) {
                                return;
                            }
                            if (scope.tt_popupDelay) {
                                popupTimeout = $timeout(show, scope.tt_popupDelay, false);
                                popupTimeout.then(function (reposition) { reposition(); });
                            } else {
                                show()();
                            }
                        }

                        function hideTooltipBind() {
                            scope.$apply(function () {
                                hide();
                            });
                        }

                        // Show the tooltip popup element.
                        function show() {


                            // Don't show empty tooltips.
                            if (!scope.tt_content) {
                                return angular.noop;
                            }

                            createTooltip();

                            // If there is a pending remove transition, we must cancel it, lest the
                            // tooltip be mysteriously removed.
                            if (transitionTimeout) {
                                $timeout.cancel(transitionTimeout);
                            }

                            // Set the initial positioning.
                            tooltip.css({ top: 0, left: 0, display: 'block' });

                            // Now we add it to the DOM because need some info about it. But it's not 
                            // visible yet anyway.
                            if (appendToBody) {
                                $document.find('body').append(tooltip);
                            } else {
                                element.after(tooltip);
                            }

                            positionTooltip();

                            // And show the tooltip.
                            scope.tt_isOpen = true;
                            scope.$digest(); // digest required as $apply is not called

                            // Return positioning function as promise callback for correct
                            // positioning after draw.
                            return positionTooltip;
                        }

                        // Hide the tooltip popup element.
                        function hide() {
                            // First things first: we don't show it anymore.
                            scope.tt_isOpen = false;

                            //if tooltip is going to be shown after delay, we must cancel this
                            $timeout.cancel(popupTimeout);

                            // And now we remove it from the DOM. However, if we have animation, we 
                            // need to wait for it to expire beforehand.
                            // FIXME: this is a placeholder for a port of the transitions library.
                            if (scope.tt_animation) {
                                transitionTimeout = $timeout(removeTooltip, 500);
                            } else {
                                removeTooltip();
                            }
                        }

                        function createTooltip() {
                            // There can only be one tooltip element per directive shown at once.
                            if (tooltip) {
                                removeTooltip();
                            }
                            tooltip = tooltipLinker(scope, function () { });

                            // Get contents rendered into the tooltip
                            scope.$digest();
                        }

                        function removeTooltip() {
                            if (tooltip) {
                                tooltip.remove();
                                tooltip = null;
                            }
                        }

                        /**
                         * Observe the relevant attributes.
                         */
                        attrs.$observe(type, function (val) {
                            scope.tt_content = val;

                            if (!val && scope.tt_isOpen) {
                                hide();
                            }
                        });

                        attrs.$observe(prefix + 'Title', function (val) {
                            scope.tt_title = val;
                        });

                        attrs.$observe(prefix + 'Placement', function (val) {
                            scope.tt_placement = angular.isDefined(val) ? val : options.placement;
                        });

                        attrs.$observe(prefix + 'PopupDelay', function (val) {
                            var delay = parseInt(val, 10);
                            scope.tt_popupDelay = !isNaN(delay) ? delay : options.popupDelay;
                        });

                        var unregisterTriggers = function () {
                            if (hasRegisteredTriggers) {
                                element.unbind(triggers.show, showTooltipBind);
                                element.unbind(triggers.hide, hideTooltipBind);
                            }
                        };

                        attrs.$observe(prefix + 'Trigger', function (val) {
                            unregisterTriggers();

                            triggers = getTriggers(val);

                            if (triggers.show === triggers.hide) {
                                element.bind(triggers.show, toggleTooltipBind);
                            } else {
                                element.bind(triggers.show, showTooltipBind);
                                element.bind(triggers.hide, hideTooltipBind);
                            }

                            hasRegisteredTriggers = true;
                        });

                        var animation = scope.$eval(attrs[prefix + 'Animation']);
                        scope.tt_animation = angular.isDefined(animation) ? !!animation : options.animation;

                        attrs.$observe(prefix + 'AppendToBody', function (val) {
                            appendToBody = angular.isDefined(val) ? $parse(val)(scope) : appendToBody;
                        });

                        // if a tooltip is attached to <body> we need to remove it on
                        // location change as its parent scope will probably not be destroyed
                        // by the change.
                        if (appendToBody) {
                            scope.$on('$locationChangeSuccess', function closeTooltipOnLocationChangeSuccess() {
                                if (scope.tt_isOpen) {
                                    hide();
                                }
                            });
                        }

                        // Make sure tooltip is destroyed and removed.
                        scope.$on('$destroy', function onDestroyTooltip() {
                            $timeout.cancel(transitionTimeout);
                            $timeout.cancel(popupTimeout);
                            unregisterTriggers();
                            removeTooltip();
                        });
                    };
                }
            };
        };
    }];
})

.directive('tooltipPopup', function () {
    return {
        restrict: 'EA',
        replace: true,
        scope: { content: '@', placement: '@', animation: '&', isOpen: '&' },
        templateUrl: 'template/tooltip/tooltip-popup.html'
    };
})

.directive('tooltip', ['$tooltip', function ($tooltip) {
    return $tooltip('tooltip', 'tooltip', 'mouseenter');
}])

.directive('tooltipHtmlUnsafePopup', function () {
    return {
        restrict: 'EA',
        replace: true,
        scope: { content: '@', placement: '@', animation: '&', isOpen: '&' },
        templateUrl: 'template/tooltip/tooltip-html-unsafe-popup.html'
    };
})

.directive('tooltipHtmlUnsafe', ['$tooltip', function ($tooltip) {
    return $tooltip('tooltipHtmlUnsafe', 'tooltip', 'mouseenter');
}]);

/**
 * The following features are still outstanding: popup delay, animation as a
 * function, placement as a function, inside, support for more triggers than
 * just mouse enter/leave, html popovers, and selector delegatation.
 */
angular.module('ui.bootstrap.popover', ['ui.bootstrap.tooltip'])

.directive('popoverPopup', function () {
    return {
        restrict: 'EA',
        replace: true,
        scope: { title: '@', content: '@', placement: '@', animation: '&', isOpen: '&' },
        templateUrl: 'template/popover/popover.html'
    };
})

.directive('popover', ['$tooltip', function ($tooltip) {
    return $tooltip('popover', 'popover', 'click');
}]);

angular.module('ui.bootstrap.progressbar', ['ui.bootstrap.transition'])

.constant('progressConfig', {
    animate: true,
    max: 100
})

.controller('ProgressController', ['$scope', '$attrs', 'progressConfig', '$transition', function ($scope, $attrs, progressConfig, $transition) {
    var self = this,
        bars = [],
        max = angular.isDefined($attrs.max) ? $scope.$parent.$eval($attrs.max) : progressConfig.max,
        animate = angular.isDefined($attrs.animate) ? $scope.$parent.$eval($attrs.animate) : progressConfig.animate;

    this.addBar = function (bar, element) {
        var oldValue = 0, index = bar.$parent.$index;
        if (angular.isDefined(index) && bars[index]) {
            oldValue = bars[index].value;
        }
        bars.push(bar);

        this.update(element, bar.value, oldValue);

        bar.$watch('value', function (value, oldValue) {
            if (value !== oldValue) {
                self.update(element, value, oldValue);
            }
        });

        bar.$on('$destroy', function () {
            self.removeBar(bar);
        });
    };

    // Update bar element width
    this.update = function (element, newValue, oldValue) {
        var percent = this.getPercentage(newValue);

        if (animate) {
            element.css('width', this.getPercentage(oldValue) + '%');
            $transition(element, { width: percent + '%' });
        } else {
            element.css({ 'transition': 'none', 'width': percent + '%' });
        }
    };

    this.removeBar = function (bar) {
        bars.splice(bars.indexOf(bar), 1);
    };

    this.getPercentage = function (value) {
        return Math.round(100 * value / max);
    };
}])

.directive('progress', function () {
    return {
        restrict: 'EA',
        replace: true,
        transclude: true,
        controller: 'ProgressController',
        require: 'progress',
        scope: {},
        template: '<div class="progress" ng-transclude></div>'
        //templateUrl: 'template/progressbar/progress.html' // Works in AngularJS 1.2
    };
})

.directive('bar', function () {
    return {
        restrict: 'EA',
        replace: true,
        transclude: true,
        require: '^progress',
        scope: {
            value: '=',
            type: '@'
        },
        templateUrl: 'template/progressbar/bar.html',
        link: function (scope, element, attrs, progressCtrl) {
            progressCtrl.addBar(scope, element);
        }
    };
})

.directive('progressbar', function () {
    return {
        restrict: 'EA',
        replace: true,
        transclude: true,
        controller: 'ProgressController',
        scope: {
            value: '=',
            type: '@'
        },
        templateUrl: 'template/progressbar/progressbar.html',
        link: function (scope, element, attrs, progressCtrl) {
            progressCtrl.addBar(scope, angular.element(element.children()[0]));
        }
    };
});
angular.module('ui.bootstrap.rating', [])

.constant('ratingConfig', {
    max: 5,
    stateOn: null,
    stateOff: null
})

.controller('RatingController', ['$scope', '$attrs', '$parse', 'ratingConfig', function ($scope, $attrs, $parse, ratingConfig) {

    this.maxRange = angular.isDefined($attrs.max) ? $scope.$parent.$eval($attrs.max) : ratingConfig.max;
    this.stateOn = angular.isDefined($attrs.stateOn) ? $scope.$parent.$eval($attrs.stateOn) : ratingConfig.stateOn;
    this.stateOff = angular.isDefined($attrs.stateOff) ? $scope.$parent.$eval($attrs.stateOff) : ratingConfig.stateOff;

    this.createRateObjects = function (states) {
        var defaultOptions = {
            stateOn: this.stateOn,
            stateOff: this.stateOff
        };

        for (var i = 0, n = states.length; i < n; i++) {
            states[i] = angular.extend({ index: i }, defaultOptions, states[i]);
        }
        return states;
    };

    // Get objects used in template
    $scope.range = angular.isDefined($attrs.ratingStates) ? this.createRateObjects(angular.copy($scope.$parent.$eval($attrs.ratingStates))) : this.createRateObjects(new Array(this.maxRange));

    $scope.rate = function (value) {
        if ($scope.value !== value && !$scope.readonly) {
            $scope.value = value;
        }
    };

    $scope.enter = function (value) {
        if (!$scope.readonly) {
            $scope.val = value;
        }
        $scope.onHover({ value: value });
    };

    $scope.reset = function () {
        $scope.val = angular.copy($scope.value);
        $scope.onLeave();
    };

    $scope.$watch('value', function (value) {
        $scope.val = value;
    });

    $scope.readonly = false;
    if ($attrs.readonly) {
        $scope.$parent.$watch($parse($attrs.readonly), function (value) {
            $scope.readonly = !!value;
        });
    }
}])

.directive('rating', function () {
    return {
        restrict: 'EA',
        scope: {
            value: '=',
            onHover: '&',
            onLeave: '&'
        },
        controller: 'RatingController',
        templateUrl: 'template/rating/rating.html',
        replace: true
    };
});

/**
 * @ngdoc overview
 * @name ui.bootstrap.tabs
 *
 * @description
 * AngularJS version of the tabs directive.
 */

angular.module('ui.bootstrap.tabs', [])

.controller('TabsetController', ['$scope', function TabsetCtrl($scope) {
    var ctrl = this,
        tabs = ctrl.tabs = $scope.tabs = [];

    ctrl.select = function (tab) {
        angular.forEach(tabs, function (tab) {
            tab.active = false;
        });
        tab.active = true;
    };

    ctrl.addTab = function addTab(tab) {
        tabs.push(tab);
        if (tabs.length === 1 || tab.active) {
            ctrl.select(tab);
        }
    };

    ctrl.removeTab = function removeTab(tab) {
        var index = tabs.indexOf(tab);
        //Select a new tab if the tab to be removed is selected
        if (tab.active && tabs.length > 1) {
            //If this is the last tab, select the previous tab. else, the next tab.
            var newActiveIndex = index == tabs.length - 1 ? index - 1 : index + 1;
            ctrl.select(tabs[newActiveIndex]);
        }
        tabs.splice(index, 1);
    };
}])

/**
 * @ngdoc directive
 * @name ui.bootstrap.tabs.directive:tabset
 * @restrict EA
 *
 * @description
 * Tabset is the outer container for the tabs directive
 *
 * @param {boolean=} vertical Whether or not to use vertical styling for the tabs.
 * @param {boolean=} justified Whether or not to use justified styling for the tabs.
 *
 * @example
<example module="ui.bootstrap">
  <file name="index.html">
    <tabset>
      <tab heading="Tab 1"><b>First</b> Content!</tab>
      <tab heading="Tab 2"><i>Second</i> Content!</tab>
    </tabset>
    <hr />
    <tabset vertical="true">
      <tab heading="Vertical Tab 1"><b>First</b> Vertical Content!</tab>
      <tab heading="Vertical Tab 2"><i>Second</i> Vertical Content!</tab>
    </tabset>
    <tabset justified="true">
      <tab heading="Justified Tab 1"><b>First</b> Justified Content!</tab>
      <tab heading="Justified Tab 2"><i>Second</i> Justified Content!</tab>
    </tabset>
  </file>
</example>
 */
.directive('tabset', function () {
    return {
        restrict: 'EA',
        transclude: true,
        replace: true,
        scope: {},
        controller: 'TabsetController',
        templateUrl: 'template/tabs/tabset.html',
        link: function (scope, element, attrs) {
            scope.vertical = angular.isDefined(attrs.vertical) ? scope.$parent.$eval(attrs.vertical) : false;
            scope.justified = angular.isDefined(attrs.justified) ? scope.$parent.$eval(attrs.justified) : false;
            scope.type = angular.isDefined(attrs.type) ? scope.$parent.$eval(attrs.type) : 'tabs';
        }
    };
})

/**
 * @ngdoc directive
 * @name ui.bootstrap.tabs.directive:tab
 * @restrict EA
 *
 * @param {string=} heading The visible heading, or title, of the tab. Set HTML headings with {@link ui.bootstrap.tabs.directive:tabHeading tabHeading}.
 * @param {string=} select An expression to evaluate when the tab is selected.
 * @param {boolean=} active A binding, telling whether or not this tab is selected.
 * @param {boolean=} disabled A binding, telling whether or not this tab is disabled.
 *
 * @description
 * Creates a tab with a heading and content. Must be placed within a {@link ui.bootstrap.tabs.directive:tabset tabset}.
 *
 * @example
<example module="ui.bootstrap">
  <file name="index.html">
    <div ng-controller="TabsDemoCtrl">
      <button class="btn btn-small" ng-click="items[0].active = true">
        Select item 1, using active binding
      </button>
      <button class="btn btn-small" ng-click="items[1].disabled = !items[1].disabled">
        Enable/disable item 2, using disabled binding
      </button>
      <br />
      <tabset>
        <tab heading="Tab 1">First Tab</tab>
        <tab select="alertMe()">
          <tab-heading><i class="icon-bell"></i> Alert me!</tab-heading>
          Second Tab, with alert callback and html heading!
        </tab>
        <tab ng-repeat="item in items"
          heading="{{item.title}}"
          disabled="item.disabled"
          active="item.active">
          {{item.content}}
        </tab>
      </tabset>
    </div>
  </file>
  <file name="script.js">
    function TabsDemoCtrl($scope) {
      $scope.items = [
        { title:"Dynamic Title 1", content:"Dynamic Item 0" },
        { title:"Dynamic Title 2", content:"Dynamic Item 1", disabled: true }
      ];

      $scope.alertMe = function() {
        setTimeout(function() {
          alert("You've selected the alert tab!");
        });
      };
    };
  </file>
</example>
 */

/**
 * @ngdoc directive
 * @name ui.bootstrap.tabs.directive:tabHeading
 * @restrict EA
 *
 * @description
 * Creates an HTML heading for a {@link ui.bootstrap.tabs.directive:tab tab}. Must be placed as a child of a tab element.
 *
 * @example
<example module="ui.bootstrap">
  <file name="index.html">
    <tabset>
      <tab>
        <tab-heading><b>HTML</b> in my titles?!</tab-heading>
        And some content, too!
      </tab>
      <tab>
        <tab-heading><i class="icon-heart"></i> Icon heading?!?</tab-heading>
        That's right.
      </tab>
    </tabset>
  </file>
</example>
 */
.directive('tab', ['$parse', function ($parse) {
    return {
        require: '^tabset',
        restrict: 'EA',
        replace: true,
        templateUrl: 'template/tabs/tab.html',
        transclude: true,
        scope: {
            heading: '@',
            onSelect: '&select', //This callback is called in contentHeadingTransclude
            //once it inserts the tab's content into the dom
            onDeselect: '&deselect'
        },
        controller: function () {
            //Empty controller so other directives can require being 'under' a tab
        },
        compile: function (elm, attrs, transclude) {
            return function postLink(scope, elm, attrs, tabsetCtrl) {
                var getActive, setActive;
                if (attrs.active) {
                    getActive = $parse(attrs.active);
                    setActive = getActive.assign;
                    scope.$parent.$watch(getActive, function updateActive(value, oldVal) {
                        // Avoid re-initializing scope.active as it is already initialized
                        // below. (watcher is called async during init with value ===
                        // oldVal)
                        if (value !== oldVal) {
                            scope.active = !!value;
                        }
                    });
                    scope.active = getActive(scope.$parent);
                } else {
                    setActive = getActive = angular.noop;
                }

                scope.$watch('active', function (active) {
                    // Note this watcher also initializes and assigns scope.active to the
                    // attrs.active expression.
                    setActive(scope.$parent, active);
                    if (active) {
                        tabsetCtrl.select(scope);
                        scope.onSelect();
                    } else {
                        scope.onDeselect();
                    }
                });

                scope.disabled = false;
                if (attrs.disabled) {
                    scope.$parent.$watch($parse(attrs.disabled), function (value) {
                        scope.disabled = !!value;
                    });
                }

                scope.select = function () {
                    if (!scope.disabled) {
                        scope.active = true;
                    }
                };

                tabsetCtrl.addTab(scope);
                scope.$on('$destroy', function () {
                    tabsetCtrl.removeTab(scope);
                });


                //We need to transclude later, once the content container is ready.
                //when this link happens, we're inside a tab heading.
                scope.$transcludeFn = transclude;
            };
        }
    };
}])

.directive('tabHeadingTransclude', [function () {
    return {
        restrict: 'A',
        require: '^tab',
        link: function (scope, elm, attrs, tabCtrl) {
            scope.$watch('headingElement', function updateHeadingElement(heading) {
                if (heading) {
                    elm.html('');
                    elm.append(heading);
                }
            });
        }
    };
}])

.directive('tabContentTransclude', function () {
    return {
        restrict: 'A',
        require: '^tabset',
        link: function (scope, elm, attrs) {
            var tab = scope.$eval(attrs.tabContentTransclude);

            //Now our tab is ready to be transcluded: both the tab heading area
            //and the tab content area are loaded.  Transclude 'em both.
            tab.$transcludeFn(tab.$parent, function (contents) {
                angular.forEach(contents, function (node) {
                    if (isTabHeading(node)) {
                        //Let tabHeadingTransclude know.
                        tab.headingElement = node;
                    } else {
                        elm.append(node);
                    }
                });
            });
        }
    };
    function isTabHeading(node) {
        return node.tagName && (
          node.hasAttribute('tab-heading') ||
          node.hasAttribute('data-tab-heading') ||
          node.tagName.toLowerCase() === 'tab-heading' ||
          node.tagName.toLowerCase() === 'data-tab-heading'
        );
    }
})

;

angular.module('ui.bootstrap.timepicker', [])

.constant('timepickerConfig', {
    hourStep: 1,
    minuteStep: 1,
    showMeridian: true,
    meridians: null,
    readonlyInput: false,
    mousewheel: true
})

.directive('timepicker', ['$parse', '$log', 'timepickerConfig', '$locale', function ($parse, $log, timepickerConfig, $locale) {
    return {
        restrict: 'EA',
        require: '?^ngModel',
        replace: true,
        scope: {},
        templateUrl: 'template/timepicker/timepicker.html',
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) {
                return; // do nothing if no ng-model
            }

            var selected = new Date(),
                meridians = angular.isDefined(attrs.meridians) ? scope.$parent.$eval(attrs.meridians) : timepickerConfig.meridians || $locale.DATETIME_FORMATS.AMPMS;

            var hourStep = timepickerConfig.hourStep;
            if (attrs.hourStep) {
                scope.$parent.$watch($parse(attrs.hourStep), function (value) {
                    hourStep = parseInt(value, 10);
                });
            }

            var minuteStep = timepickerConfig.minuteStep;
            if (attrs.minuteStep) {
                scope.$parent.$watch($parse(attrs.minuteStep), function (value) {
                    minuteStep = parseInt(value, 10);
                });
            }

            // 12H / 24H mode
            scope.showMeridian = timepickerConfig.showMeridian;
            if (attrs.showMeridian) {
                scope.$parent.$watch($parse(attrs.showMeridian), function (value) {
                    scope.showMeridian = !!value;

                    if (ngModel.$error.time) {
                        // Evaluate from template
                        var hours = getHoursFromTemplate(), minutes = getMinutesFromTemplate();
                        if (angular.isDefined(hours) && angular.isDefined(minutes)) {
                            selected.setHours(hours);
                            refresh();
                        }
                    } else {
                        updateTemplate();
                    }
                });
            }

            // Get scope.hours in 24H mode if valid
            function getHoursFromTemplate() {
                var hours = parseInt(scope.hours, 10);
                var valid = (scope.showMeridian) ? (hours > 0 && hours < 13) : (hours >= 0 && hours < 24);
                if (!valid) {
                    return undefined;
                }

                if (scope.showMeridian) {
                    if (hours === 12) {
                        hours = 0;
                    }
                    if (scope.meridian === meridians[1]) {
                        hours = hours + 12;
                    }
                }
                return hours;
            }

            function getMinutesFromTemplate() {
                var minutes = parseInt(scope.minutes, 10);
                return (minutes >= 0 && minutes < 60) ? minutes : undefined;
            }

            function pad(value) {
                return (angular.isDefined(value) && value.toString().length < 2) ? '0' + value : value;
            }

            // Input elements
            var inputs = element.find('input'), hoursInputEl = inputs.eq(0), minutesInputEl = inputs.eq(1);

            // Respond on mousewheel spin
            var mousewheel = (angular.isDefined(attrs.mousewheel)) ? scope.$eval(attrs.mousewheel) : timepickerConfig.mousewheel;
            if (mousewheel) {

                var isScrollingUp = function (e) {
                    if (e.originalEvent) {
                        e = e.originalEvent;
                    }
                    //pick correct delta variable depending on event
                    var delta = (e.wheelDelta) ? e.wheelDelta : -e.deltaY;
                    return (e.detail || delta > 0);
                };

                hoursInputEl.bind('mousewheel wheel', function (e) {
                    scope.$apply((isScrollingUp(e)) ? scope.incrementHours() : scope.decrementHours());
                    e.preventDefault();
                });

                minutesInputEl.bind('mousewheel wheel', function (e) {
                    scope.$apply((isScrollingUp(e)) ? scope.incrementMinutes() : scope.decrementMinutes());
                    e.preventDefault();
                });
            }

            scope.readonlyInput = (angular.isDefined(attrs.readonlyInput)) ? scope.$eval(attrs.readonlyInput) : timepickerConfig.readonlyInput;
            if (!scope.readonlyInput) {

                var invalidate = function (invalidHours, invalidMinutes) {
                    ngModel.$setViewValue(null);
                    ngModel.$setValidity('time', false);
                    if (angular.isDefined(invalidHours)) {
                        scope.invalidHours = invalidHours;
                    }
                    if (angular.isDefined(invalidMinutes)) {
                        scope.invalidMinutes = invalidMinutes;
                    }
                };

                scope.updateHours = function () {
                    var hours = getHoursFromTemplate();

                    if (angular.isDefined(hours)) {
                        selected.setHours(hours);
                        refresh('h');
                    } else {
                        invalidate(true);
                    }
                };

                hoursInputEl.bind('blur', function (e) {
                    if (!scope.validHours && scope.hours < 10) {
                        scope.$apply(function () {
                            scope.hours = pad(scope.hours);
                        });
                    }
                });

                scope.updateMinutes = function () {
                    var minutes = getMinutesFromTemplate();

                    if (angular.isDefined(minutes)) {
                        selected.setMinutes(minutes);
                        refresh('m');
                    } else {
                        invalidate(undefined, true);
                    }
                };

                minutesInputEl.bind('blur', function (e) {
                    if (!scope.invalidMinutes && scope.minutes < 10) {
                        scope.$apply(function () {
                            scope.minutes = pad(scope.minutes);
                        });
                    }
                });
            } else {
                scope.updateHours = angular.noop;
                scope.updateMinutes = angular.noop;
            }

            ngModel.$render = function () {
                var date = ngModel.$modelValue ? new Date(ngModel.$modelValue) : null;

                if (isNaN(date)) {
                    ngModel.$setValidity('time', false);
                    $log.error('Timepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.');
                } else {
                    if (date) {
                        selected = date;
                    }
                    makeValid();
                    updateTemplate();
                }
            };

            // Call internally when we know that model is valid.
            function refresh(keyboardChange) {
                makeValid();
                ngModel.$setViewValue(new Date(selected));
                updateTemplate(keyboardChange);
            }

            function makeValid() {
                ngModel.$setValidity('time', true);
                scope.invalidHours = false;
                scope.invalidMinutes = false;
            }

            function updateTemplate(keyboardChange) {
                var hours = selected.getHours(), minutes = selected.getMinutes();

                if (scope.showMeridian) {
                    hours = (hours === 0 || hours === 12) ? 12 : hours % 12; // Convert 24 to 12 hour system
                }
                scope.hours = keyboardChange === 'h' ? hours : pad(hours);
                scope.minutes = keyboardChange === 'm' ? minutes : pad(minutes);
                scope.meridian = selected.getHours() < 12 ? meridians[0] : meridians[1];
            }

            function addMinutes(minutes) {
                var dt = new Date(selected.getTime() + minutes * 60000);
                selected.setHours(dt.getHours(), dt.getMinutes());
                refresh();
            }

            scope.incrementHours = function () {
                addMinutes(hourStep * 60);
            };
            scope.decrementHours = function () {
                addMinutes(-hourStep * 60);
            };
            scope.incrementMinutes = function () {
                addMinutes(minuteStep);
            };
            scope.decrementMinutes = function () {
                addMinutes(-minuteStep);
            };
            scope.toggleMeridian = function () {
                addMinutes(12 * 60 * ((selected.getHours() < 12) ? 1 : -1));
            };
        }
    };
}]);

angular.module('ui.bootstrap.typeahead', ['ui.bootstrap.position', 'ui.bootstrap.bindHtml'])

/**
 * A helper service that can parse typeahead's syntax (string provided by users)
 * Extracted to a separate service for ease of unit testing
 */
  .factory('typeaheadParser', ['$parse', function ($parse) {

      //                      00000111000000000000022200000000000000003333333333333330000000000044000
      var TYPEAHEAD_REGEXP = /^\s*(.*?)(?:\s+as\s+(.*?))?\s+for\s+(?:([\$\w][\$\w\d]*))\s+in\s+(.*)$/;

      return {
          parse: function (input) {

              var match = input.match(TYPEAHEAD_REGEXP), modelMapper, viewMapper, source;
              if (!match) {
                  throw new Error(
                    "Expected typeahead specification in form of '_modelValue_ (as _label_)? for _item_ in _collection_'" +
                      " but got '" + input + "'.");
              }

              return {
                  itemName: match[3],
                  source: $parse(match[4]),
                  viewMapper: $parse(match[2] || match[1]),
                  modelMapper: $parse(match[1])
              };
          }
      };
  }])

  .directive('typeahead', ['$compile', '$parse', '$q', '$timeout', '$document', '$position', 'typeaheadParser',
    function ($compile, $parse, $q, $timeout, $document, $position, typeaheadParser) {

        var HOT_KEYS = [9, 13, 27, 38, 40];

        return {
            require: 'ngModel',
            link: function (originalScope, element, attrs, modelCtrl) {

                //SUPPORTED ATTRIBUTES (OPTIONS)

                //minimal no of characters that needs to be entered before typeahead kicks-in
                var minSearch = originalScope.$eval(attrs.typeaheadMinLength) || 1;

                //minimal wait time after last character typed before typehead kicks-in
                var waitTime = originalScope.$eval(attrs.typeaheadWaitMs) || 0;

                //should it restrict model values to the ones selected from the popup only?
                var isEditable = originalScope.$eval(attrs.typeaheadEditable) !== false;

                //binding to a variable that indicates if matches are being retrieved asynchronously
                var isLoadingSetter = $parse(attrs.typeaheadLoading).assign || angular.noop;

                //a callback executed when a match is selected
                var onSelectCallback = $parse(attrs.typeaheadOnSelect);

                var inputFormatter = attrs.typeaheadInputFormatter ? $parse(attrs.typeaheadInputFormatter) : undefined;

                var appendToBody = attrs.typeaheadAppendToBody ? $parse(attrs.typeaheadAppendToBody) : false;

                //INTERNAL VARIABLES

                //model setter executed upon match selection
                var $setModelValue = $parse(attrs.ngModel).assign;

                //expressions used by typeahead
                var parserResult = typeaheadParser.parse(attrs.typeahead);

                var hasFocus;

                //pop-up element used to display matches
                var popUpEl = angular.element('<div typeahead-popup></div>');
                popUpEl.attr({
                    matches: 'matches',
                    active: 'activeIdx',
                    select: 'select(activeIdx)',
                    query: 'query',
                    position: 'position'
                });
                //custom item template
                if (angular.isDefined(attrs.typeaheadTemplateUrl)) {
                    popUpEl.attr('template-url', attrs.typeaheadTemplateUrl);
                }

                //create a child scope for the typeahead directive so we are not polluting original scope
                //with typeahead-specific data (matches, query etc.)
                var scope = originalScope.$new();
                originalScope.$on('$destroy', function () {
                    scope.$destroy();
                });

                var resetMatches = function () {
                    scope.matches = [];
                    scope.activeIdx = -1;
                };

                var getMatchesAsync = function (inputValue) {

                    var locals = { $viewValue: inputValue };
                    isLoadingSetter(originalScope, true);
                    $q.when(parserResult.source(originalScope, locals)).then(function (matches) {

                        //it might happen that several async queries were in progress if a user were typing fast
                        //but we are interested only in responses that correspond to the current view value
                        if (inputValue === modelCtrl.$viewValue && hasFocus) {
                            if (matches.length > 0) {

                                scope.activeIdx = 0;
                                scope.matches.length = 0;

                                //transform labels
                                for (var i = 0; i < matches.length; i++) {
                                    locals[parserResult.itemName] = matches[i];
                                    scope.matches.push({
                                        label: parserResult.viewMapper(scope, locals),
                                        model: matches[i]
                                    });
                                }

                                scope.query = inputValue;
                                //position pop-up with matches - we need to re-calculate its position each time we are opening a window
                                //with matches as a pop-up might be absolute-positioned and position of an input might have changed on a page
                                //due to other elements being rendered
                                scope.position = appendToBody ? $position.offset(element) : $position.position(element);
                                scope.position.top = scope.position.top + element.prop('offsetHeight');

                            } else {
                                resetMatches();
                            }
                            isLoadingSetter(originalScope, false);
                        }
                    }, function () {
                        resetMatches();
                        isLoadingSetter(originalScope, false);
                    });
                };

                resetMatches();

                //we need to propagate user's query so we can higlight matches
                scope.query = undefined;

                //Declare the timeout promise var outside the function scope so that stacked calls can be cancelled later 
                var timeoutPromise;

                //plug into $parsers pipeline to open a typeahead on view changes initiated from DOM
                //$parsers kick-in on all the changes coming from the view as well as manually triggered by $setViewValue
                modelCtrl.$parsers.unshift(function (inputValue) {

                    hasFocus = true;

                    if (inputValue && inputValue.length >= minSearch) {
                        if (waitTime > 0) {
                            if (timeoutPromise) {
                                $timeout.cancel(timeoutPromise);//cancel previous timeout
                            }
                            timeoutPromise = $timeout(function () {
                                getMatchesAsync(inputValue);
                            }, waitTime);
                        } else {
                            getMatchesAsync(inputValue);
                        }
                    } else {
                        isLoadingSetter(originalScope, false);
                        resetMatches();
                    }

                    if (isEditable) {
                        return inputValue;
                    } else {
                        if (!inputValue) {
                            // Reset in case user had typed something previously.
                            modelCtrl.$setValidity('editable', true);
                            return inputValue;
                        } else {
                            modelCtrl.$setValidity('editable', false);
                            return undefined;
                        }
                    }
                });

                modelCtrl.$formatters.push(function (modelValue) {

                    var candidateViewValue, emptyViewValue;
                    var locals = {};

                    if (inputFormatter) {

                        locals['$model'] = modelValue;
                        return inputFormatter(originalScope, locals);

                    } else {

                        //it might happen that we don't have enough info to properly render input value
                        //we need to check for this situation and simply return model value if we can't apply custom formatting
                        locals[parserResult.itemName] = modelValue;
                        candidateViewValue = parserResult.viewMapper(originalScope, locals);
                        locals[parserResult.itemName] = undefined;
                        emptyViewValue = parserResult.viewMapper(originalScope, locals);

                        return candidateViewValue !== emptyViewValue ? candidateViewValue : modelValue;
                    }
                });

                scope.select = function (activeIdx) {
                    //called from within the $digest() cycle
                    var locals = {};
                    var model, item;

                    locals[parserResult.itemName] = item = scope.matches[activeIdx].model;
                    model = parserResult.modelMapper(originalScope, locals);
                    $setModelValue(originalScope, model);
                    modelCtrl.$setValidity('editable', true);

                    onSelectCallback(originalScope, {
                        $item: item,
                        $model: model,
                        $label: parserResult.viewMapper(originalScope, locals)
                    });

                    resetMatches();

                    //return focus to the input element if a mach was selected via a mouse click event
                    element[0].focus();
                };

                //bind keyboard events: arrows up(38) / down(40), enter(13) and tab(9), esc(27)
                element.bind('keydown', function (evt) {

                    //typeahead is open and an "interesting" key was pressed
                    if (scope.matches.length === 0 || HOT_KEYS.indexOf(evt.which) === -1) {
                        return;
                    }

                    evt.preventDefault();

                    if (evt.which === 40) {
                        scope.activeIdx = (scope.activeIdx + 1) % scope.matches.length;
                        scope.$digest();

                    } else if (evt.which === 38) {
                        scope.activeIdx = (scope.activeIdx ? scope.activeIdx : scope.matches.length) - 1;
                        scope.$digest();

                    } else if (evt.which === 13 || evt.which === 9) {
                        scope.$apply(function () {
                            scope.select(scope.activeIdx);
                        });

                    } else if (evt.which === 27) {
                        evt.stopPropagation();

                        resetMatches();
                        scope.$digest();
                    }
                });

                element.bind('blur', function (evt) {
                    hasFocus = false;
                });

                // Keep reference to click handler to unbind it.
                var dismissClickHandler = function (evt) {
                    if (element[0] !== evt.target) {
                        resetMatches();
                        scope.$digest();
                    }
                };

                $document.bind('click', dismissClickHandler);

                originalScope.$on('$destroy', function () {
                    $document.unbind('click', dismissClickHandler);
                });

                var $popup = $compile(popUpEl)(scope);
                if (appendToBody) {
                    $document.find('body').append($popup);
                } else {
                    element.after($popup);
                }
            }
        };

    }])

  .directive('typeaheadPopup', function () {
      return {
          restrict: 'EA',
          scope: {
              matches: '=',
              query: '=',
              active: '=',
              position: '=',
              select: '&'
          },
          replace: true,
          templateUrl: 'template/typeahead/typeahead-popup.html',
          link: function (scope, element, attrs) {

              scope.templateUrl = attrs.templateUrl;

              scope.isOpen = function () {
                  return scope.matches.length > 0;
              };

              scope.isActive = function (matchIdx) {
                  return scope.active == matchIdx;
              };

              scope.selectActive = function (matchIdx) {
                  scope.active = matchIdx;
              };

              scope.selectMatch = function (activeIdx) {
                  scope.select({ activeIdx: activeIdx });
              };
          }
      };
  })

  .directive('typeaheadMatch', ['$http', '$templateCache', '$compile', '$parse', function ($http, $templateCache, $compile, $parse) {
      return {
          restrict: 'EA',
          scope: {
              index: '=',
              match: '=',
              query: '='
          },
          link: function (scope, element, attrs) {
              var tplUrl = $parse(attrs.templateUrl)(scope.$parent) || 'template/typeahead/typeahead-match.html';
              $http.get(tplUrl, { cache: $templateCache }).success(function (tplContent) {
                  element.replaceWith($compile(tplContent.trim())(scope));
              });
          }
      };
  }])

  .filter('typeaheadHighlight', function () {

      function escapeRegexp(queryToEscape) {
          return queryToEscape.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
      }

      return function (matchItem, query) {
          return query ? matchItem.replace(new RegExp(escapeRegexp(query), 'gi'), '<strong>$&</strong>') : matchItem;
      };
  });
angular.module("template/accordion/accordion-group.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("template/accordion/accordion-group.html",
      "<div class=\"panel panel-default\">\n" +
      "  <div class=\"panel-heading\">\n" +
      "    <h4 class=\"panel-title\">\n" +
      "      <a class=\"accordion-toggle\" ng-click=\"isOpen = !isOpen\" accordion-transclude=\"heading\">{{heading}}</a>\n" +
      "    </h4>\n" +
      "  </div>\n" +
      "  <div class=\"panel-collapse\" collapse=\"!isOpen\">\n" +
      "	  <div class=\"panel-body\" ng-transclude></div>\n" +
      "  </div>\n" +
      "</div>");
}]);

angular.module("template/accordion/accordion.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("template/accordion/accordion.html",
      "<div class=\"panel-group\" ng-transclude></div>");
}]);

angular.module("template/alert/alert.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("template/alert/alert.html",
      "<div class='alert' ng-class='\"alert-\" + (type || \"warning\")'>\n" +
      "    <button ng-show='closeable' type='button' class='close' ng-click='close()'>&times;</button>\n" +
      "    <div ng-transclude></div>\n" +
      "</div>\n" +
      "");
}]);

angular.module("template/carousel/carousel.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("template/carousel/carousel.html",
      "<div ng-mouseenter=\"pause()\" ng-mouseleave=\"play()\" class=\"carousel\">\n" +
      "    <ol class=\"carousel-indicators\" ng-show=\"slides().length > 1\">\n" +
      "        <li ng-repeat=\"slide in slides()\" ng-class=\"{active: isActive(slide)}\" ng-click=\"select(slide)\"></li>\n" +
      "    </ol>\n" +
      "    <div class=\"carousel-inner\" ng-transclude></div>\n" +
      "    <a class=\"left carousel-control\" ng-click=\"prev()\" ng-show=\"slides().length > 1\"><span class=\"icon-prev\"></span></a>\n" +
      "    <a class=\"right carousel-control\" ng-click=\"next()\" ng-show=\"slides().length > 1\"><span class=\"icon-next\"></span></a>\n" +
      "</div>\n" +
      "");
}]);

angular.module("template/carousel/slide.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("template/carousel/slide.html",
      "<div ng-class=\"{\n" +
      "    'active': leaving || (active && !entering),\n" +
      "    'prev': (next || active) && direction=='prev',\n" +
      "    'next': (next || active) && direction=='next',\n" +
      "    'right': direction=='prev',\n" +
      "    'left': direction=='next'\n" +
      "  }\" class=\"item text-center\" ng-transclude></div>\n" +
      "");
}]);

angular.module("template/datepicker/datepicker.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("template/datepicker/datepicker.html",
      "<table>\n" +
      "  <thead>\n" +
      "    <tr>\n" +
      "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-left\" ng-click=\"move(-1)\"><i class=\"glyphicon glyphicon-chevron-left\"></i></button></th>\n" +
      "      <th colspan=\"{{rows[0].length - 2 + showWeekNumbers}}\"><button type=\"button\" class=\"btn btn-default btn-sm btn-block\" ng-click=\"toggleMode()\"><strong>{{title}}</strong></button></th>\n" +
      "      <th><button type=\"button\" class=\"btn btn-default btn-sm pull-right\" ng-click=\"move(1)\"><i class=\"glyphicon glyphicon-chevron-right\"></i></button></th>\n" +
      "    </tr>\n" +
      "    <tr ng-show=\"labels.length > 0\" class=\"h6\">\n" +
      "      <th ng-show=\"showWeekNumbers\" class=\"text-center\">#</th>\n" +
      "      <th ng-repeat=\"label in labels\" class=\"text-center\">{{label}}</th>\n" +
      "    </tr>\n" +
      "  </thead>\n" +
      "  <tbody>\n" +
      "    <tr ng-repeat=\"row in rows\">\n" +
      "      <td ng-show=\"showWeekNumbers\" class=\"text-center\"><em>{{ getWeekNumber(row) }}</em></td>\n" +
      "      <td ng-repeat=\"dt in row\" class=\"text-center\">\n" +
      "        <button type=\"button\" style=\"width:100%;\" class=\"btn btn-default btn-sm\" ng-class=\"{'btn-info': dt.selected}\" ng-click=\"select(dt.date)\" ng-disabled=\"dt.disabled\"><span ng-class=\"{'text-muted': dt.secondary}\">{{dt.label}}</span></button>\n" +
      "      </td>\n" +
      "    </tr>\n" +
      "  </tbody>\n" +
      "</table>\n" +
      "");
}]);

angular.module("template/datepicker/popup.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("template/datepicker/popup.html",
      "<ul class=\"dropdown-menu\" ng-style=\"{display: (isOpen && 'block') || 'none', top: position.top+'px', left: position.left+'px'}\">\n" +
      "	<li ng-transclude></li>\n" +
      "	<li ng-show=\"showButtonBar\" style=\"padding:10px 9px 2px\">\n" +
      "		<span class=\"btn-group\">\n" +
      "			<button type=\"button\" class=\"btn btn-sm btn-info\" ng-click=\"today()\">{{currentText}}</button>\n" +
      "			<button type=\"button\" class=\"btn btn-sm btn-default\" ng-click=\"showWeeks = ! showWeeks\" ng-class=\"{active: showWeeks}\">{{toggleWeeksText}}</button>\n" +
      "			<button type=\"button\" class=\"btn btn-sm btn-danger\" ng-click=\"clear()\">{{clearText}}</button>\n" +
      "		</span>\n" +
      "		<button type=\"button\" class=\"btn btn-sm btn-success pull-right\" ng-click=\"isOpen = false\">{{closeText}}</button>\n" +
      "	</li>\n" +
      "</ul>\n" +
      "");
}]);

angular.module("template/modal/backdrop.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("template/modal/backdrop.html",
      "<div class=\"modal-backdrop fade\" ng-class=\"{in: animate}\" ng-style=\"{'z-index': 1040 + index*10}\"></div>");
}]);

angular.module("template/modal/window.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("template/modal/window.html",
      "<div tabindex=\"-1\" class=\"modal fade {{ windowClass }}\" ng-class=\"{in: animate}\" ng-style=\"{'z-index': 1050 + index*10, display: 'block'}\" ng-click=\"close($event)\">\n" +
      "    <div class=\"modal-dialog\"><div class=\"modal-content\" ng-transclude></div></div>\n" +
      "</div>");
}]);

angular.module("template/pagination/pager.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("template/pagination/pager.html",
      "<ul class=\"pager\">\n" +
      "  <li ng-repeat=\"page in pages\" ng-class=\"{disabled: page.disabled, previous: page.previous, next: page.next}\"><a ng-click=\"selectPage(page.number)\">{{page.text}}</a></li>\n" +
      "</ul>");
}]);

angular.module("template/pagination/pagination.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("template/pagination/pagination.html",
      "<ul class=\"pagination\">\n" +
      "  <li ng-repeat=\"page in pages\" ng-class=\"{active: page.active, disabled: page.disabled}\"><a ng-click=\"selectPage(page.number)\">{{page.text}}</a></li>\n" +
      "</ul>");
}]);

angular.module("template/tooltip/tooltip-html-unsafe-popup.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("template/tooltip/tooltip-html-unsafe-popup.html",
      "<div class=\"tooltip {{placement}}\" ng-class=\"{ in: isOpen(), fade: animation() }\">\n" +
      "  <div class=\"tooltip-arrow\"></div>\n" +
      "  <div class=\"tooltip-inner\" bind-html-unsafe=\"content\"></div>\n" +
      "</div>\n" +
      "");
}]);

angular.module("template/tooltip/tooltip-popup.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("template/tooltip/tooltip-popup.html",
      "<div class=\"tooltip {{placement}}\" ng-class=\"{ in: isOpen(), fade: animation() }\">\n" +
      "  <div class=\"tooltip-arrow\"></div>\n" +
      "  <div class=\"tooltip-inner\" ng-bind=\"content\"></div>\n" +
      "</div>\n" +
      "");
}]);

angular.module("template/popover/popover.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("template/popover/popover.html",
      "<div class=\"popover {{placement}}\" ng-class=\"{ in: isOpen(), fade: animation() }\">\n" +
      "  <div class=\"arrow\"></div>\n" +
      "\n" +
      "  <div class=\"popover-inner\">\n" +
      "      <h3 class=\"popover-title\" ng-bind=\"title\" ng-show=\"title\"></h3>\n" +
      "      <div class=\"popover-content\" ng-bind=\"content\"></div>\n" +
      "  </div>\n" +
      "</div>\n" +
      "");
}]);

angular.module("template/progressbar/bar.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("template/progressbar/bar.html",
      "<div class=\"progress-bar\" ng-class=\"type && 'progress-bar-' + type\" ng-transclude></div>");
}]);

angular.module("template/progressbar/progress.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("template/progressbar/progress.html",
      "<div class=\"progress\" ng-transclude></div>");
}]);

angular.module("template/progressbar/progressbar.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("template/progressbar/progressbar.html",
      "<div class=\"progress\"><div class=\"progress-bar\" ng-class=\"type && 'progress-bar-' + type\" ng-transclude></div></div>");
}]);

angular.module("template/rating/rating.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("template/rating/rating.html",
      "<span ng-mouseleave=\"reset()\">\n" +
      "    <i ng-repeat=\"r in range\" ng-mouseenter=\"enter($index + 1)\" ng-click=\"rate($index + 1)\" class=\"glyphicon\" ng-class=\"$index < val && (r.stateOn || 'glyphicon-star') || (r.stateOff || 'glyphicon-star-empty')\"></i>\n" +
      "</span>");
}]);

angular.module("template/tabs/tab.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("template/tabs/tab.html",
      "<li ng-class=\"{active: active, disabled: disabled}\">\n" +
      "  <a ng-click=\"select()\" tab-heading-transclude>{{heading}}</a>\n" +
      "</li>\n" +
      "");
}]);

angular.module("template/tabs/tabset-titles.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("template/tabs/tabset-titles.html",
      "<ul class=\"nav {{type && 'nav-' + type}}\" ng-class=\"{'nav-stacked': vertical}\">\n" +
      "</ul>\n" +
      "");
}]);

angular.module("template/tabs/tabset.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("template/tabs/tabset.html",
      "\n" +
      "<div class=\"tabbable\">\n" +
      "  <ul class=\"nav {{type && 'nav-' + type}}\" ng-class=\"{'nav-stacked': vertical, 'nav-justified': justified}\" ng-transclude></ul>\n" +
      "  <div class=\"tab-content\">\n" +
      "    <div class=\"tab-pane\" \n" +
      "         ng-repeat=\"tab in tabs\" \n" +
      "         ng-class=\"{active: tab.active}\"\n" +
      "         tab-content-transclude=\"tab\">\n" +
      "    </div>\n" +
      "  </div>\n" +
      "</div>\n" +
      "");
}]);

angular.module("template/timepicker/timepicker.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("template/timepicker/timepicker.html",
      "<table>\n" +
      "	<tbody>\n" +
      "		<tr class=\"text-center\">\n" +
      "			<td><a ng-click=\"incrementHours()\" class=\"btn btn-link\"><span class=\"glyphicon glyphicon-chevron-up\"></span></a></td>\n" +
      "			<td>&nbsp;</td>\n" +
      "			<td><a ng-click=\"incrementMinutes()\" class=\"btn btn-link\"><span class=\"glyphicon glyphicon-chevron-up\"></span></a></td>\n" +
      "			<td ng-show=\"showMeridian\"></td>\n" +
      "		</tr>\n" +
      "		<tr>\n" +
      "			<td style=\"width:50px;\" class=\"form-group\" ng-class=\"{'has-error': invalidHours}\">\n" +
      "				<input type=\"text\" ng-model=\"hours\" ng-change=\"updateHours()\" class=\"form-control text-center\" ng-mousewheel=\"incrementHours()\" ng-readonly=\"readonlyInput\" maxlength=\"2\">\n" +
      "			</td>\n" +
      "			<td>:</td>\n" +
      "			<td style=\"width:50px;\" class=\"form-group\" ng-class=\"{'has-error': invalidMinutes}\">\n" +
      "				<input type=\"text\" ng-model=\"minutes\" ng-change=\"updateMinutes()\" class=\"form-control text-center\" ng-readonly=\"readonlyInput\" maxlength=\"2\">\n" +
      "			</td>\n" +
      "			<td ng-show=\"showMeridian\"><button type=\"button\" class=\"btn btn-default text-center\" ng-click=\"toggleMeridian()\">{{meridian}}</button></td>\n" +
      "		</tr>\n" +
      "		<tr class=\"text-center\">\n" +
      "			<td><a ng-click=\"decrementHours()\" class=\"btn btn-link\"><span class=\"glyphicon glyphicon-chevron-down\"></span></a></td>\n" +
      "			<td>&nbsp;</td>\n" +
      "			<td><a ng-click=\"decrementMinutes()\" class=\"btn btn-link\"><span class=\"glyphicon glyphicon-chevron-down\"></span></a></td>\n" +
      "			<td ng-show=\"showMeridian\"></td>\n" +
      "		</tr>\n" +
      "	</tbody>\n" +
      "</table>\n" +
      "");
}]);

angular.module("template/typeahead/typeahead-match.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("template/typeahead/typeahead-match.html",
      "<a tabindex=\"-1\" bind-html-unsafe=\"match.label | typeaheadHighlight:query\"></a>");
}]);

angular.module("template/typeahead/typeahead-popup.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("template/typeahead/typeahead-popup.html",
      "<ul class=\"dropdown-menu\" ng-style=\"{display: isOpen()&&'block' || 'none', top: position.top+'px', left: position.left+'px'}\">\n" +
      "    <li ng-repeat=\"match in matches\" ng-class=\"{active: isActive($index) }\" ng-mouseenter=\"selectActive($index)\" ng-click=\"selectMatch($index)\">\n" +
      "        <div typeahead-match index=\"$index\" match=\"match\" query=\"query\" template-url=\"templateUrl\"></div>\n" +
      "    </li>\n" +
      "</ul>");
}]);
///#source 1 1 /Scripts/custom-version/angular-sanitize.js
/**
 * @license AngularJS v1.3.0-beta.5
 * (c) 2010-2014 Google, Inc. http://angularjs.org
 * License: MIT
 */
(function (window, angular, undefined) {
    'use strict';

    var $sanitizeMinErr = angular.$$minErr('$sanitize');

    /**
     * @ngdoc module
     * @name ngSanitize
     * @description
     *
     * # ngSanitize
     *
     * The `ngSanitize` module provides functionality to sanitize HTML.
     *
     *
     * <div doc-module-components="ngSanitize"></div>
     *
     * See {@link ngSanitize.$sanitize `$sanitize`} for usage.
     */

    /*
     * HTML Parser By Misko Hevery (misko@hevery.com)
     * based on:  HTML Parser By John Resig (ejohn.org)
     * Original code by Erik Arvidsson, Mozilla Public License
     * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
     *
     * // Use like so:
     * htmlParser(htmlString, {
     *     start: function(tag, attrs, unary) {},
     *     end: function(tag) {},
     *     chars: function(text) {},
     *     comment: function(text) {}
     * });
     *
     */


    /**
     * @ngdoc service
     * @name $sanitize
     * @function
     *
     * @description
     *   The input is sanitized by parsing the html into tokens. All safe tokens (from a whitelist) are
     *   then serialized back to properly escaped html string. This means that no unsafe input can make
     *   it into the returned string, however, since our parser is more strict than a typical browser
     *   parser, it's possible that some obscure input, which would be recognized as valid HTML by a
     *   browser, won't make it through the sanitizer.
     *   The whitelist is configured using the functions `aHrefSanitizationWhitelist` and
     *   `imgSrcSanitizationWhitelist` of {@link ng.$compileProvider `$compileProvider`}.
     *
     * @param {string} html Html input.
     * @returns {string} Sanitized html.
     *
     * @example
       <example module="ngSanitize" deps="angular-sanitize.js">
       <file name="index.html">
         <script>
           function Ctrl($scope, $sce) {
             $scope.snippet =
               '<p style="color:blue">an html\n' +
               '<em onmouseover="this.textContent=\'PWN3D!\'">click here</em>\n' +
               'snippet</p>';
             $scope.deliberatelyTrustDangerousSnippet = function() {
               return $sce.trustAsHtml($scope.snippet);
             };
           }
         </script>
         <div ng-controller="Ctrl">
            Snippet: <textarea ng-model="snippet" cols="60" rows="3"></textarea>
           <table>
             <tr>
               <td>Directive</td>
               <td>How</td>
               <td>Source</td>
               <td>Rendered</td>
             </tr>
             <tr id="bind-html-with-sanitize">
               <td>ng-bind-html</td>
               <td>Automatically uses $sanitize</td>
               <td><pre>&lt;div ng-bind-html="snippet"&gt;<br/>&lt;/div&gt;</pre></td>
               <td><div ng-bind-html="snippet"></div></td>
             </tr>
             <tr id="bind-html-with-trust">
               <td>ng-bind-html</td>
               <td>Bypass $sanitize by explicitly trusting the dangerous value</td>
               <td>
               <pre>&lt;div ng-bind-html="deliberatelyTrustDangerousSnippet()"&gt;
    &lt;/div&gt;</pre>
               </td>
               <td><div ng-bind-html="deliberatelyTrustDangerousSnippet()"></div></td>
             </tr>
             <tr id="bind-default">
               <td>ng-bind</td>
               <td>Automatically escapes</td>
               <td><pre>&lt;div ng-bind="snippet"&gt;<br/>&lt;/div&gt;</pre></td>
               <td><div ng-bind="snippet"></div></td>
             </tr>
           </table>
           </div>
       </file>
       <file name="protractor.js" type="protractor">
         it('should sanitize the html snippet by default', function() {
           expect(element(by.css('#bind-html-with-sanitize div')).getInnerHtml()).
             toBe('<p>an html\n<em>click here</em>\nsnippet</p>');
         });
    
         it('should inline raw snippet if bound to a trusted value', function() {
           expect(element(by.css('#bind-html-with-trust div')).getInnerHtml()).
             toBe("<p style=\"color:blue\">an html\n" +
                  "<em onmouseover=\"this.textContent='PWN3D!'\">click here</em>\n" +
                  "snippet</p>");
         });
    
         it('should escape snippet without any filter', function() {
           expect(element(by.css('#bind-default div')).getInnerHtml()).
             toBe("&lt;p style=\"color:blue\"&gt;an html\n" +
                  "&lt;em onmouseover=\"this.textContent='PWN3D!'\"&gt;click here&lt;/em&gt;\n" +
                  "snippet&lt;/p&gt;");
         });
    
         it('should update', function() {
           element(by.model('snippet')).clear();
           element(by.model('snippet')).sendKeys('new <b onclick="alert(1)">text</b>');
           expect(element(by.css('#bind-html-with-sanitize div')).getInnerHtml()).
             toBe('new <b>text</b>');
           expect(element(by.css('#bind-html-with-trust div')).getInnerHtml()).toBe(
             'new <b onclick="alert(1)">text</b>');
           expect(element(by.css('#bind-default div')).getInnerHtml()).toBe(
             "new &lt;b onclick=\"alert(1)\"&gt;text&lt;/b&gt;");
         });
       </file>
       </example>
     */
    function $SanitizeProvider() {
        this.$get = ['$$sanitizeUri', function ($$sanitizeUri) {
            return function (html) {
                var buf = [];
                htmlParser(html, htmlSanitizeWriter(buf, function (uri, isImage) {
                    return !/^unsafe/.test($$sanitizeUri(uri, isImage));
                }));
                return buf.join('');
            };
        }];
    }

    function sanitizeText(chars) {
        var buf = [];
        var writer = htmlSanitizeWriter(buf, angular.noop);
        writer.chars(chars);
        return buf.join('');
    }


    // Regular Expressions for parsing tags and attributes
    var START_TAG_REGEXP =
           /^<\s*([\w:-]+)((?:\s+[\w:-]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)\s*>/,
      END_TAG_REGEXP = /^<\s*\/\s*([\w:-]+)[^>]*>/,
      ATTR_REGEXP = /([\w:-]+)(?:\s*=\s*(?:(?:"((?:[^"])*)")|(?:'((?:[^'])*)')|([^>\s]+)))?/g,
      BEGIN_TAG_REGEXP = /^</,
      BEGING_END_TAGE_REGEXP = /^<\s*\//,
      COMMENT_REGEXP = /<!--(.*?)-->/g,
      DOCTYPE_REGEXP = /<!DOCTYPE([^>]*?)>/i,
      CDATA_REGEXP = /<!\[CDATA\[(.*?)]]>/g,
      // Match everything outside of normal chars and " (quote character)
      NON_ALPHANUMERIC_REGEXP = /([^\#-~| |!])/g;


    // Good source of info about elements and attributes
    // http://dev.w3.org/html5/spec/Overview.html#semantics
    // http://simon.html5.org/html-elements

    // Safe Void Elements - HTML5
    // http://dev.w3.org/html5/spec/Overview.html#void-elements
    var voidElements = makeMap("area,br,col,hr,img,wbr");

    // Elements that you can, intentionally, leave open (and which close themselves)
    // http://dev.w3.org/html5/spec/Overview.html#optional-tags
    var optionalEndTagBlockElements = makeMap("colgroup,dd,dt,li,p,tbody,td,tfoot,th,thead,tr"),
        optionalEndTagInlineElements = makeMap("rp,rt"),
        optionalEndTagElements = angular.extend({},
                                                optionalEndTagInlineElements,
                                                optionalEndTagBlockElements);

    // Safe Block Elements - HTML5
    var blockElements = angular.extend({}, optionalEndTagBlockElements, makeMap("address,article," +
            "aside,blockquote,caption,center,del,dir,div,dl,figure,figcaption,footer,h1,h2,h3,h4,h5," +
            "h6,header,hgroup,hr,ins,map,menu,nav,ol,pre,script,section,table,ul"));

    // Inline Elements - HTML5
    var inlineElements = angular.extend({}, optionalEndTagInlineElements, makeMap("a,abbr,acronym,b," +
            "bdi,bdo,big,br,cite,code,del,dfn,em,font,i,img,ins,kbd,label,map,mark,q,ruby,rp,rt,s," +
            "samp,small,span,strike,strong,sub,sup,time,tt,u,var"));


    // Special Elements (can contain anything)
    var specialElements = makeMap("script,style");

    var validElements = angular.extend({},
                                       voidElements,
                                       blockElements,
                                       inlineElements,
                                       optionalEndTagElements);

    //Attributes that have href and hence need to be sanitized
    var uriAttrs = makeMap("background,cite,href,longdesc,src,usemap");
    var validAttrs = angular.extend({}, uriAttrs, makeMap(
        'abbr,align,alt,axis,bgcolor,border,cellpadding,cellspacing,class,clear,' +
        'color,cols,colspan,compact,coords,dir,face,headers,height,hreflang,hspace,' +
        'ismap,lang,language,nohref,nowrap,rel,rev,rows,rowspan,rules,' +
        'scope,scrolling,shape,size,span,start,summary,target,title,type,' +
        'valign,value,vspace,width'));

    function makeMap(str) {
        var obj = {}, items = str.split(','), i;
        for (i = 0; i < items.length; i++) obj[items[i]] = true;
        return obj;
    }


    /**
     * @example
     * htmlParser(htmlString, {
     *     start: function(tag, attrs, unary) {},
     *     end: function(tag) {},
     *     chars: function(text) {},
     *     comment: function(text) {}
     * });
     *
     * @param {string} html string
     * @param {object} handler
     */
    function htmlParser(html, handler) {
        var index, chars, match, stack = [], last = html;
        stack.last = function () { return stack[stack.length - 1]; };

        while (html) {
            chars = true;

            // Make sure we're not in a script or style element
            if (!stack.last() || !specialElements[stack.last()]) {

                // Comment
                if (html.indexOf("<!--") === 0) {
                    // comments containing -- are not allowed unless they terminate the comment
                    index = html.indexOf("--", 4);

                    if (index >= 0 && html.lastIndexOf("-->", index) === index) {
                        if (handler.comment) handler.comment(html.substring(4, index));
                        html = html.substring(index + 3);
                        chars = false;
                    }
                    // DOCTYPE
                } else if (DOCTYPE_REGEXP.test(html)) {
                    match = html.match(DOCTYPE_REGEXP);

                    if (match) {
                        html = html.replace(match[0], '');
                        chars = false;
                    }
                    // end tag
                } else if (BEGING_END_TAGE_REGEXP.test(html)) {
                    match = html.match(END_TAG_REGEXP);

                    if (match) {
                        html = html.substring(match[0].length);
                        match[0].replace(END_TAG_REGEXP, parseEndTag);
                        chars = false;
                    }

                    // start tag
                } else if (BEGIN_TAG_REGEXP.test(html)) {
                    match = html.match(START_TAG_REGEXP);

                    if (match) {
                        html = html.substring(match[0].length);
                        match[0].replace(START_TAG_REGEXP, parseStartTag);
                        chars = false;
                    }
                }

                if (chars) {
                    index = html.indexOf("<");

                    var text = index < 0 ? html : html.substring(0, index);
                    html = index < 0 ? "" : html.substring(index);

                    if (handler.chars) handler.chars(decodeEntities(text));
                }

            } else {
                html = html.replace(new RegExp("(.*)<\\s*\\/\\s*" + stack.last() + "[^>]*>", 'i'),
                  function (all, text) {
                      text = text.replace(COMMENT_REGEXP, "$1").replace(CDATA_REGEXP, "$1");

                      if (handler.chars) handler.chars(decodeEntities(text));

                      return "";
                  });

                parseEndTag("", stack.last());
            }

            if (html == last) {
                throw $sanitizeMinErr('badparse', "The sanitizer was unable to parse the following block " +
                                                  "of html: {0}", html);
            }
            last = html;
        }

        // Clean up any remaining tags
        parseEndTag();

        function parseStartTag(tag, tagName, rest, unary) {
            tagName = angular.lowercase(tagName);
            if (blockElements[tagName]) {
                while (stack.last() && inlineElements[stack.last()]) {
                    parseEndTag("", stack.last());
                }
            }

            if (optionalEndTagElements[tagName] && stack.last() == tagName) {
                parseEndTag("", tagName);
            }

            unary = voidElements[tagName] || !!unary;

            if (!unary)
                stack.push(tagName);

            var attrs = {};

            rest.replace(ATTR_REGEXP,
              function (match, name, doubleQuotedValue, singleQuotedValue, unquotedValue) {
                  var value = doubleQuotedValue
                    || singleQuotedValue
                    || unquotedValue
                    || '';

                  attrs[name] = decodeEntities(value);
              });
            if (handler.start) handler.start(tagName, attrs, unary);
        }

        function parseEndTag(tag, tagName) {
            var pos = 0, i;
            tagName = angular.lowercase(tagName);
            if (tagName)
                // Find the closest opened tag of the same type
                for (pos = stack.length - 1; pos >= 0; pos--)
                    if (stack[pos] == tagName)
                        break;

            if (pos >= 0) {
                // Close all the open elements, up the stack
                for (i = stack.length - 1; i >= pos; i--)
                    if (handler.end) handler.end(stack[i]);

                // Remove the open elements from the stack
                stack.length = pos;
            }
        }
    }

    var hiddenPre = document.createElement("pre");
    var spaceRe = /^(\s*)([\s\S]*?)(\s*)$/;
    /**
     * decodes all entities into regular string
     * @param value
     * @returns {string} A string with decoded entities.
     */
    function decodeEntities(value) {
        if (!value) { return ''; }

        // Note: IE8 does not preserve spaces at the start/end of innerHTML
        // so we must capture them and reattach them afterward
        var parts = spaceRe.exec(value);
        var spaceBefore = parts[1];
        var spaceAfter = parts[3];
        var content = parts[2];
        if (content) {
            hiddenPre.innerHTML = content.replace(/</g, "&lt;");
            // innerText depends on styling as it doesn't display hidden elements.
            // Therefore, it's better to use textContent not to cause unnecessary
            // reflows. However, IE<9 don't support textContent so the innerText
            // fallback is necessary.
            content = 'textContent' in hiddenPre ?
              hiddenPre.textContent : hiddenPre.innerText;
        }
        return spaceBefore + content + spaceAfter;
    }

    /**
     * Escapes all potentially dangerous characters, so that the
     * resulting string can be safely inserted into attribute or
     * element text.
     * @param value
     * @returns {string} escaped text
     */
    function encodeEntities(value) {
        return value.
          replace(/&/g, '&amp;').
          replace(NON_ALPHANUMERIC_REGEXP, function (value) {
              return '&#' + value.charCodeAt(0) + ';';
          }).
          replace(/</g, '&lt;').
          replace(/>/g, '&gt;');
    }

    /**
     * create an HTML/XML writer which writes to buffer
     * @param {Array} buf use buf.jain('') to get out sanitized html string
     * @returns {object} in the form of {
     *     start: function(tag, attrs, unary) {},
     *     end: function(tag) {},
     *     chars: function(text) {},
     *     comment: function(text) {}
     * }
     */
    function htmlSanitizeWriter(buf, uriValidator) {
        var ignore = false;
        var out = angular.bind(buf, buf.push);
        return {
            start: function (tag, attrs, unary) {
                tag = angular.lowercase(tag);
                if (!ignore && specialElements[tag]) {
                    ignore = tag;
                }
                if (!ignore && validElements[tag] === true) {
                    out('<');
                    out(tag);
                    angular.forEach(attrs, function (value, key) {
                        var lkey = angular.lowercase(key);
                        var isImage = (tag === 'img' && lkey === 'src') || (lkey === 'background');
                        if (validAttrs[lkey] === true &&
                          (uriAttrs[lkey] !== true || uriValidator(value, isImage))) {
                            out(' ');
                            out(key);
                            out('="');
                            out(encodeEntities(value));
                            out('"');
                        }
                    });
                    out(unary ? '/>' : '>');
                }
            },
            end: function (tag) {
                tag = angular.lowercase(tag);
                if (!ignore && validElements[tag] === true) {
                    out('</');
                    out(tag);
                    out('>');
                }
                if (tag == ignore) {
                    ignore = false;
                }
            },
            chars: function (chars) {
                if (!ignore) {
                    out(encodeEntities(chars));
                }
            }
        };
    }


    // define ngSanitize module and register $sanitize service
    angular.module('ngSanitize', []).provider('$sanitize', $SanitizeProvider);

    /* global sanitizeText: false */

    /**
     * @ngdoc filter
     * @name linky
     * @function
     *
     * @description
     * Finds links in text input and turns them into html links. Supports http/https/ftp/mailto and
     * plain email address links.
     *
     * Requires the {@link ngSanitize `ngSanitize`} module to be installed.
     *
     * @param {string} text Input text.
     * @param {string} target Window (_blank|_self|_parent|_top) or named frame to open links in.
     * @returns {string} Html-linkified text.
     *
     * @usage
       <span ng-bind-html="linky_expression | linky"></span>
     *
     * @example
       <example module="ngSanitize" deps="angular-sanitize.js">
         <file name="index.html">
           <script>
             function Ctrl($scope) {
               $scope.snippet =
                 'Pretty text with some links:\n'+
                 'http://angularjs.org/,\n'+
                 'mailto:us@somewhere.org,\n'+
                 'another@somewhere.org,\n'+
                 'and one more: ftp://127.0.0.1/.';
               $scope.snippetWithTarget = 'http://angularjs.org/';
             }
           </script>
           <div ng-controller="Ctrl">
           Snippet: <textarea ng-model="snippet" cols="60" rows="3"></textarea>
           <table>
             <tr>
               <td>Filter</td>
               <td>Source</td>
               <td>Rendered</td>
             </tr>
             <tr id="linky-filter">
               <td>linky filter</td>
               <td>
                 <pre>&lt;div ng-bind-html="snippet | linky"&gt;<br>&lt;/div&gt;</pre>
               </td>
               <td>
                 <div ng-bind-html="snippet | linky"></div>
               </td>
             </tr>
             <tr id="linky-target">
              <td>linky target</td>
              <td>
                <pre>&lt;div ng-bind-html="snippetWithTarget | linky:'_blank'"&gt;<br>&lt;/div&gt;</pre>
              </td>
              <td>
                <div ng-bind-html="snippetWithTarget | linky:'_blank'"></div>
              </td>
             </tr>
             <tr id="escaped-html">
               <td>no filter</td>
               <td><pre>&lt;div ng-bind="snippet"&gt;<br>&lt;/div&gt;</pre></td>
               <td><div ng-bind="snippet"></div></td>
             </tr>
           </table>
         </file>
         <file name="protractor.js" type="protractor">
           it('should linkify the snippet with urls', function() {
             expect(element(by.id('linky-filter')).element(by.binding('snippet | linky')).getText()).
                 toBe('Pretty text with some links: http://angularjs.org/, us@somewhere.org, ' +
                      'another@somewhere.org, and one more: ftp://127.0.0.1/.');
             expect(element.all(by.css('#linky-filter a')).count()).toEqual(4);
           });
    
           it('should not linkify snippet without the linky filter', function() {
             expect(element(by.id('escaped-html')).element(by.binding('snippet')).getText()).
                 toBe('Pretty text with some links: http://angularjs.org/, mailto:us@somewhere.org, ' +
                      'another@somewhere.org, and one more: ftp://127.0.0.1/.');
             expect(element.all(by.css('#escaped-html a')).count()).toEqual(0);
           });
    
           it('should update', function() {
             element(by.model('snippet')).clear();
             element(by.model('snippet')).sendKeys('new http://link.');
             expect(element(by.id('linky-filter')).element(by.binding('snippet | linky')).getText()).
                 toBe('new http://link.');
             expect(element.all(by.css('#linky-filter a')).count()).toEqual(1);
             expect(element(by.id('escaped-html')).element(by.binding('snippet')).getText())
                 .toBe('new http://link.');
           });
    
           it('should work with the target property', function() {
            expect(element(by.id('linky-target')).
                element(by.binding("snippetWithTarget | linky:'_blank'")).getText()).
                toBe('http://angularjs.org/');
            expect(element(by.css('#linky-target a')).getAttribute('target')).toEqual('_blank');
           });
         </file>
       </example>
     */
    angular.module('ngSanitize').filter('linky', ['$sanitize', function ($sanitize) {
        var LINKY_URL_REGEXP =
              /((ftp|https?):\/\/|(mailto:)?[A-Za-z0-9._%+-]+@)\S*[^\s.;,(){}<>]/,
            MAILTO_REGEXP = /^mailto:/;

        return function (text, target) {
            if (!text) return text;
            var match;
            var raw = text;
            var html = [];
            var url;
            var i;
            while ((match = raw.match(LINKY_URL_REGEXP))) {
                // We can not end in these as they are sometimes found at the end of the sentence
                url = match[0];
                // if we did not match ftp/http/mailto then assume mailto
                if (match[2] == match[3]) url = 'mailto:' + url;
                i = match.index;
                addText(raw.substr(0, i));
                addLink(url, match[0].replace(MAILTO_REGEXP, ''));
                raw = raw.substring(i + match[0].length);
            }
            addText(raw);
            return $sanitize(html.join(''));

            function addText(text) {
                if (!text) {
                    return;
                }
                html.push(sanitizeText(text));
            }

            function addLink(url, text) {
                html.push('<a ');
                if (angular.isDefined(target)) {
                    html.push('target="');
                    html.push(target);
                    html.push('" ');
                }
                html.push('href="');
                html.push(url);
                html.push('">');
                addText(text);
                html.push('</a>');
            }
        };
    }]);


})(window, window.angular);
///#source 1 1 /Scripts/custom-version/angular-route.js
/**
 * @license AngularJS v1.3.0-beta.5
 * (c) 2010-2014 Google, Inc. http://angularjs.org
 * License: MIT
 */
(function (window, angular, undefined) {
    'use strict';

    /**
     * @ngdoc module
     * @name ngRoute
     * @description
     *
     * # ngRoute
     *
     * The `ngRoute` module provides routing and deeplinking services and directives for angular apps.
     *
     * ## Example
     * See {@link ngRoute.$route#example $route} for an example of configuring and using `ngRoute`.
     *
     *
     * <div doc-module-components="ngRoute"></div>
     */
    /* global -ngRouteModule */
    var ngRouteModule = angular.module('ngRoute', ['ng']).
                            provider('$route', $RouteProvider);

    /**
     * @ngdoc provider
     * @name $routeProvider
     * @function
     *
     * @description
     *
     * Used for configuring routes.
     *
     * ## Example
     * See {@link ngRoute.$route#example $route} for an example of configuring and using `ngRoute`.
     *
     * ## Dependencies
     * Requires the {@link ngRoute `ngRoute`} module to be installed.
     */
    function $RouteProvider() {
        function inherit(parent, extra) {
            return angular.extend(new (angular.extend(function () { }, { prototype: parent }))(), extra);
        }

        var routes = {};

        /**
         * @ngdoc method
         * @name $routeProvider#when
         *
         * @param {string} path Route path (matched against `$location.path`). If `$location.path`
         *    contains redundant trailing slash or is missing one, the route will still match and the
         *    `$location.path` will be updated to add or drop the trailing slash to exactly match the
         *    route definition.
         *
         *    * `path` can contain named groups starting with a colon: e.g. `:name`. All characters up
         *        to the next slash are matched and stored in `$routeParams` under the given `name`
         *        when the route matches.
         *    * `path` can contain named groups starting with a colon and ending with a star:
         *        e.g.`:name*`. All characters are eagerly stored in `$routeParams` under the given `name`
         *        when the route matches.
         *    * `path` can contain optional named groups with a question mark: e.g.`:name?`.
         *
         *    For example, routes like `/color/:color/largecode/:largecode*\/edit` will match
         *    `/color/brown/largecode/code/with/slashes/edit` and extract:
         *
         *    * `color: brown`
         *    * `largecode: code/with/slashes`.
         *
         *
         * @param {Object} route Mapping information to be assigned to `$route.current` on route
         *    match.
         *
         *    Object properties:
         *
         *    - `controller` – `{(string|function()=}` – Controller fn that should be associated with
         *      newly created scope or the name of a {@link angular.Module#controller registered
         *      controller} if passed as a string.
         *    - `controllerAs` – `{string=}` – A controller alias name. If present the controller will be
         *      published to scope under the `controllerAs` name.
         *    - `template` – `{string=|function()=}` – html template as a string or a function that
         *      returns an html template as a string which should be used by {@link
         *      ngRoute.directive:ngView ngView} or {@link ng.directive:ngInclude ngInclude} directives.
         *      This property takes precedence over `templateUrl`.
         *
         *      If `template` is a function, it will be called with the following parameters:
         *
         *      - `{Array.<Object>}` - route parameters extracted from the current
         *        `$location.path()` by applying the current route
         *
         *    - `templateUrl` – `{string=|function()=}` – path or function that returns a path to an html
         *      template that should be used by {@link ngRoute.directive:ngView ngView}.
         *
         *      If `templateUrl` is a function, it will be called with the following parameters:
         *
         *      - `{Array.<Object>}` - route parameters extracted from the current
         *        `$location.path()` by applying the current route
         *
         *    - `resolve` - `{Object.<string, function>=}` - An optional map of dependencies which should
         *      be injected into the controller. If any of these dependencies are promises, the router
         *      will wait for them all to be resolved or one to be rejected before the controller is
         *      instantiated.
         *      If all the promises are resolved successfully, the values of the resolved promises are
         *      injected and {@link ngRoute.$route#$routeChangeSuccess $routeChangeSuccess} event is
         *      fired. If any of the promises are rejected the
         *      {@link ngRoute.$route#$routeChangeError $routeChangeError} event is fired. The map object
         *      is:
         *
         *      - `key` – `{string}`: a name of a dependency to be injected into the controller.
         *      - `factory` - `{string|function}`: If `string` then it is an alias for a service.
         *        Otherwise if function, then it is {@link auto.$injector#invoke injected}
         *        and the return value is treated as the dependency. If the result is a promise, it is
         *        resolved before its value is injected into the controller. Be aware that
         *        `ngRoute.$routeParams` will still refer to the previous route within these resolve
         *        functions.  Use `$route.current.params` to access the new route parameters, instead.
         *
         *    - `redirectTo` – {(string|function())=} – value to update
         *      {@link ng.$location $location} path with and trigger route redirection.
         *
         *      If `redirectTo` is a function, it will be called with the following parameters:
         *
         *      - `{Object.<string>}` - route parameters extracted from the current
         *        `$location.path()` by applying the current route templateUrl.
         *      - `{string}` - current `$location.path()`
         *      - `{Object}` - current `$location.search()`
         *
         *      The custom `redirectTo` function is expected to return a string which will be used
         *      to update `$location.path()` and `$location.search()`.
         *
         *    - `[reloadOnSearch=true]` - {boolean=} - reload route when only `$location.search()`
         *      or `$location.hash()` changes.
         *
         *      If the option is set to `false` and url in the browser changes, then
         *      `$routeUpdate` event is broadcasted on the root scope.
         *
         *    - `[caseInsensitiveMatch=false]` - {boolean=} - match routes without being case sensitive
         *
         *      If the option is set to `true`, then the particular route can be matched without being
         *      case sensitive
         *
         * @returns {Object} self
         *
         * @description
         * Adds a new route definition to the `$route` service.
         */
        this.when = function (path, route) {
            routes[path] = angular.extend(
              { reloadOnSearch: true },
              route,
              path && pathRegExp(path, route)
            );

            // create redirection for trailing slashes
            if (path) {
                var redirectPath = (path[path.length - 1] == '/')
                      ? path.substr(0, path.length - 1)
                      : path + '/';

                routes[redirectPath] = angular.extend(
                  { redirectTo: path },
                  pathRegExp(redirectPath, route)
                );
            }

            return this;
        };

        /**
         * @param path {string} path
         * @param opts {Object} options
         * @return {?Object}
         *
         * @description
         * Normalizes the given path, returning a regular expression
         * and the original path.
         *
         * Inspired by pathRexp in visionmedia/express/lib/utils.js.
         */
        function pathRegExp(path, opts) {
            var insensitive = opts.caseInsensitiveMatch,
                ret = {
                    originalPath: path,
                    regexp: path
                },
                keys = ret.keys = [];

            path = path
              .replace(/([().])/g, '\\$1')
              .replace(/(\/)?:(\w+)([\?\*])?/g, function (_, slash, key, option) {
                  var optional = option === '?' ? option : null;
                  var star = option === '*' ? option : null;
                  keys.push({ name: key, optional: !!optional });
                  slash = slash || '';
                  return ''
                    + (optional ? '' : slash)
                    + '(?:'
                    + (optional ? slash : '')
                    + (star && '(.+?)' || '([^/]+)')
                    + (optional || '')
                    + ')'
                    + (optional || '');
              })
              .replace(/([\/$\*])/g, '\\$1');

            ret.regexp = new RegExp('^' + path + '$', insensitive ? 'i' : '');
            return ret;
        }

        /**
         * @ngdoc method
         * @name $routeProvider#otherwise
         *
         * @description
         * Sets route definition that will be used on route change when no other route definition
         * is matched.
         *
         * @param {Object} params Mapping information to be assigned to `$route.current`.
         * @returns {Object} self
         */
        this.otherwise = function (params) {
            this.when(null, params);
            return this;
        };


        this.$get = ['$rootScope',
                     '$location',
                     '$routeParams',
                     '$q',
                     '$injector',
                     '$http',
                     '$templateCache',
                     '$sce',
            function ($rootScope, $location, $routeParams, $q, $injector, $http, $templateCache, $sce) {

                /**
                 * @ngdoc service
                 * @name $route
                 * @requires $location
                 * @requires $routeParams
                 *
                 * @property {Object} current Reference to the current route definition.
                 * The route definition contains:
                 *
                 *   - `controller`: The controller constructor as define in route definition.
                 *   - `locals`: A map of locals which is used by {@link ng.$controller $controller} service for
                 *     controller instantiation. The `locals` contain
                 *     the resolved values of the `resolve` map. Additionally the `locals` also contain:
                 *
                 *     - `$scope` - The current route scope.
                 *     - `$template` - The current route template HTML.
                 *
                 * @property {Object} routes Object with all route configuration Objects as its properties.
                 *
                 * @description
                 * `$route` is used for deep-linking URLs to controllers and views (HTML partials).
                 * It watches `$location.url()` and tries to map the path to an existing route definition.
                 *
                 * Requires the {@link ngRoute `ngRoute`} module to be installed.
                 *
                 * You can define routes through {@link ngRoute.$routeProvider $routeProvider}'s API.
                 *
                 * The `$route` service is typically used in conjunction with the
                 * {@link ngRoute.directive:ngView `ngView`} directive and the
                 * {@link ngRoute.$routeParams `$routeParams`} service.
                 *
                 * @example
                 * This example shows how changing the URL hash causes the `$route` to match a route against the
                 * URL, and the `ngView` pulls in the partial.
                 *
                 * Note that this example is using {@link ng.directive:script inlined templates}
                 * to get it working on jsfiddle as well.
                 *
                 * <example name="$route-service" module="ngRouteExample"
                 *          deps="angular-route.js" fixBase="true">
                 *   <file name="index.html">
                 *     <div ng-controller="MainController">
                 *       Choose:
                 *       <a href="Book/Moby">Moby</a> |
                 *       <a href="Book/Moby/ch/1">Moby: Ch1</a> |
                 *       <a href="Book/Gatsby">Gatsby</a> |
                 *       <a href="Book/Gatsby/ch/4?key=value">Gatsby: Ch4</a> |
                 *       <a href="Book/Scarlet">Scarlet Letter</a><br/>
                 *
                 *       <div ng-view></div>
                 *
                 *       <hr />
                 *
                 *       <pre>$location.path() = {{$location.path()}}</pre>
                 *       <pre>$route.current.templateUrl = {{$route.current.templateUrl}}</pre>
                 *       <pre>$route.current.params = {{$route.current.params}}</pre>
                 *       <pre>$route.current.scope.name = {{$route.current.scope.name}}</pre>
                 *       <pre>$routeParams = {{$routeParams}}</pre>
                 *     </div>
                 *   </file>
                 *
                 *   <file name="book.html">
                 *     controller: {{name}}<br />
                 *     Book Id: {{params.bookId}}<br />
                 *   </file>
                 *
                 *   <file name="chapter.html">
                 *     controller: {{name}}<br />
                 *     Book Id: {{params.bookId}}<br />
                 *     Chapter Id: {{params.chapterId}}
                 *   </file>
                 *
                 *   <file name="script.js">
                 *     angular.module('ngRouteExample', ['ngRoute'])
                 *
                 *      .controller('MainController', function($scope, $route, $routeParams, $location) {
                 *          $scope.$route = $route;
                 *          $scope.$location = $location;
                 *          $scope.$routeParams = $routeParams;
                 *      })
                 *
                 *      .controller('BookController', function($scope, $routeParams) {
                 *          $scope.name = "BookController";
                 *          $scope.params = $routeParams;
                 *      })
                 *
                 *      .controller('ChapterController', function($scope, $routeParams) {
                 *          $scope.name = "ChapterController";
                 *          $scope.params = $routeParams;
                 *      })
                 *
                 *     .config(function($routeProvider, $locationProvider) {
                 *       $routeProvider
                 *        .when('/Book/:bookId', {
                 *         templateUrl: 'book.html',
                 *         controller: 'BookController',
                 *         resolve: {
                 *           // I will cause a 1 second delay
                 *           delay: function($q, $timeout) {
                 *             var delay = $q.defer();
                 *             $timeout(delay.resolve, 1000);
                 *             return delay.promise;
                 *           }
                 *         }
                 *       })
                 *       .when('/Book/:bookId/ch/:chapterId', {
                 *         templateUrl: 'chapter.html',
                 *         controller: 'ChapterController'
                 *       });
                 *
                 *       // configure html5 to get links working on jsfiddle
                 *       $locationProvider.html5Mode(true);
                 *     });
                 *
                 *   </file>
                 *
                 *   <file name="protractor.js" type="protractor">
                 *     it('should load and compile correct template', function() {
                 *       element(by.linkText('Moby: Ch1')).click();
                 *       var content = element(by.css('[ng-view]')).getText();
                 *       expect(content).toMatch(/controller\: ChapterController/);
                 *       expect(content).toMatch(/Book Id\: Moby/);
                 *       expect(content).toMatch(/Chapter Id\: 1/);
                 *
                 *       element(by.partialLinkText('Scarlet')).click();
                 *
                 *       content = element(by.css('[ng-view]')).getText();
                 *       expect(content).toMatch(/controller\: BookController/);
                 *       expect(content).toMatch(/Book Id\: Scarlet/);
                 *     });
                 *   </file>
                 * </example>
                 */

                /**
                 * @ngdoc event
                 * @name $route#$routeChangeStart
                 * @eventType broadcast on root scope
                 * @description
                 * Broadcasted before a route change. At this  point the route services starts
                 * resolving all of the dependencies needed for the route change to occur.
                 * Typically this involves fetching the view template as well as any dependencies
                 * defined in `resolve` route property. Once  all of the dependencies are resolved
                 * `$routeChangeSuccess` is fired.
                 *
                 * @param {Object} angularEvent Synthetic event object.
                 * @param {Route} next Future route information.
                 * @param {Route} current Current route information.
                 */

                /**
                 * @ngdoc event
                 * @name $route#$routeChangeSuccess
                 * @eventType broadcast on root scope
                 * @description
                 * Broadcasted after a route dependencies are resolved.
                 * {@link ngRoute.directive:ngView ngView} listens for the directive
                 * to instantiate the controller and render the view.
                 *
                 * @param {Object} angularEvent Synthetic event object.
                 * @param {Route} current Current route information.
                 * @param {Route|Undefined} previous Previous route information, or undefined if current is
                 * first route entered.
                 */

                /**
                 * @ngdoc event
                 * @name $route#$routeChangeError
                 * @eventType broadcast on root scope
                 * @description
                 * Broadcasted if any of the resolve promises are rejected.
                 *
                 * @param {Object} angularEvent Synthetic event object
                 * @param {Route} current Current route information.
                 * @param {Route} previous Previous route information.
                 * @param {Route} rejection Rejection of the promise. Usually the error of the failed promise.
                 */

                /**
                 * @ngdoc event
                 * @name $route#$routeUpdate
                 * @eventType broadcast on root scope
                 * @description
                 *
                 * The `reloadOnSearch` property has been set to false, and we are reusing the same
                 * instance of the Controller.
                 */

                var forceReload = false,
                    $route = {
                        routes: routes,

                        /**
                         * @ngdoc method
                         * @name $route#reload
                         *
                         * @description
                         * Causes `$route` service to reload the current route even if
                         * {@link ng.$location $location} hasn't changed.
                         *
                         * As a result of that, {@link ngRoute.directive:ngView ngView}
                         * creates new scope, reinstantiates the controller.
                         */
                        reload: function () {
                            forceReload = true;
                            $rootScope.$evalAsync(updateRoute);
                        }
                    };

                $rootScope.$on('$locationChangeSuccess', updateRoute);

                return $route;

                /////////////////////////////////////////////////////

                /**
                 * @param on {string} current url
                 * @param route {Object} route regexp to match the url against
                 * @return {?Object}
                 *
                 * @description
                 * Check if the route matches the current url.
                 *
                 * Inspired by match in
                 * visionmedia/express/lib/router/router.js.
                 */
                function switchRouteMatcher(on, route) {
                    var keys = route.keys,
                        params = {};

                    if (!route.regexp) return null;

                    var m = route.regexp.exec(on);
                    if (!m) return null;

                    for (var i = 1, len = m.length; i < len; ++i) {
                        var key = keys[i - 1];

                        var val = 'string' == typeof m[i]
                              ? decodeURIComponent(m[i])
                              : m[i];

                        if (key && val) {
                            params[key.name] = val;
                        }
                    }
                    return params;
                }

                function updateRoute() {
                    var next = parseRoute(),
                        last = $route.current;

                    if (next && last && next.$$route === last.$$route
                        && angular.equals(next.pathParams, last.pathParams)
                        && !next.reloadOnSearch && !forceReload) {
                        last.params = next.params;
                        angular.copy(last.params, $routeParams);
                        $rootScope.$broadcast('$routeUpdate', last);
                    } else if (next || last) {
                        forceReload = false;
                        $rootScope.$broadcast('$routeChangeStart', next, last);
                        $route.current = next;
                        if (next) {
                            if (next.redirectTo) {
                                if (angular.isString(next.redirectTo)) {
                                    $location.path(interpolate(next.redirectTo, next.params)).search(next.params)
                                             .replace();
                                } else {
                                    $location.url(next.redirectTo(next.pathParams, $location.path(), $location.search()))
                                             .replace();
                                }
                            }
                        }

                        $q.when(next).
                          then(function () {
                              if (next) {
                                  var locals = angular.extend({}, next.resolve),
                                      template, templateUrl;

                                  angular.forEach(locals, function (value, key) {
                                      locals[key] = angular.isString(value) ?
                                          $injector.get(value) : $injector.invoke(value);
                                  });

                                  if (angular.isDefined(template = next.template)) {
                                      if (angular.isFunction(template)) {
                                          template = template(next.params);
                                      }
                                  } else if (angular.isDefined(templateUrl = next.templateUrl)) {
                                      if (angular.isFunction(templateUrl)) {
                                          templateUrl = templateUrl(next.params);
                                      }
                                      templateUrl = $sce.getTrustedResourceUrl(templateUrl);
                                      if (angular.isDefined(templateUrl)) {
                                          next.loadedTemplateUrl = templateUrl;
                                          template = $http.get(templateUrl, { cache: $templateCache }).
                                              then(function (response) { return response.data; });
                                      }
                                  }
                                  if (angular.isDefined(template)) {
                                      locals['$template'] = template;
                                  }
                                  return $q.all(locals);
                              }
                          }).
                          // after route change
                          then(function (locals) {
                              if (next == $route.current) {
                                  if (next) {
                                      next.locals = locals;
                                      angular.copy(next.params, $routeParams);
                                  }
                                  $rootScope.$broadcast('$routeChangeSuccess', next, last);
                              }
                          }, function (error) {
                              if (next == $route.current) {
                                  $rootScope.$broadcast('$routeChangeError', next, last, error);
                              }
                          });
                    }
                }


                /**
                 * @returns {Object} the current active route, by matching it against the URL
                 */
                function parseRoute() {
                    // Match a route
                    var params, match;
                    angular.forEach(routes, function (route, path) {
                        if (!match && (params = switchRouteMatcher($location.path(), route))) {
                            match = inherit(route, {
                                params: angular.extend({}, $location.search(), params),
                                pathParams: params
                            });
                            match.$$route = route;
                        }
                    });
                    // No route matched; fallback to "otherwise" route
                    return match || routes[null] && inherit(routes[null], { params: {}, pathParams: {} });
                }

                /**
                 * @returns {string} interpolation of the redirect path with the parameters
                 */
                function interpolate(string, params) {
                    var result = [];
                    angular.forEach((string || '').split(':'), function (segment, i) {
                        if (i === 0) {
                            result.push(segment);
                        } else {
                            var segmentMatch = segment.match(/(\w+)(.*)/);
                            var key = segmentMatch[1];
                            result.push(params[key]);
                            result.push(segmentMatch[2] || '');
                            delete params[key];
                        }
                    });
                    return result.join('');
                }
            }];
    }

    ngRouteModule.provider('$routeParams', $RouteParamsProvider);


    /**
     * @ngdoc service
     * @name $routeParams
     * @requires $route
     *
     * @description
     * The `$routeParams` service allows you to retrieve the current set of route parameters.
     *
     * Requires the {@link ngRoute `ngRoute`} module to be installed.
     *
     * The route parameters are a combination of {@link ng.$location `$location`}'s
     * {@link ng.$location#search `search()`} and {@link ng.$location#path `path()`}.
     * The `path` parameters are extracted when the {@link ngRoute.$route `$route`} path is matched.
     *
     * In case of parameter name collision, `path` params take precedence over `search` params.
     *
     * The service guarantees that the identity of the `$routeParams` object will remain unchanged
     * (but its properties will likely change) even when a route change occurs.
     *
     * Note that the `$routeParams` are only updated *after* a route change completes successfully.
     * This means that you cannot rely on `$routeParams` being correct in route resolve functions.
     * Instead you can use `$route.current.params` to access the new route's parameters.
     *
     * @example
     * ```js
     *  // Given:
     *  // URL: http://server.com/index.html#/Chapter/1/Section/2?search=moby
     *  // Route: /Chapter/:chapterId/Section/:sectionId
     *  //
     *  // Then
     *  $routeParams ==> {chapterId:1, sectionId:2, search:'moby'}
     * ```
     */
    function $RouteParamsProvider() {
        this.$get = function () { return {}; };
    }

    ngRouteModule.directive('ngView', ngViewFactory);
    ngRouteModule.directive('ngView', ngViewFillContentFactory);


    /**
     * @ngdoc directive
     * @name ngView
     * @restrict ECA
     *
     * @description
     * # Overview
     * `ngView` is a directive that complements the {@link ngRoute.$route $route} service by
     * including the rendered template of the current route into the main layout (`index.html`) file.
     * Every time the current route changes, the included view changes with it according to the
     * configuration of the `$route` service.
     *
     * Requires the {@link ngRoute `ngRoute`} module to be installed.
     *
     * @animations
     * enter - animation is used to bring new content into the browser.
     * leave - animation is used to animate existing content away.
     *
     * The enter and leave animation occur concurrently.
     *
     * @scope
     * @priority 400
     * @param {string=} onload Expression to evaluate whenever the view updates.
     *
     * @param {string=} autoscroll Whether `ngView` should call {@link ng.$anchorScroll
     *                  $anchorScroll} to scroll the viewport after the view is updated.
     *
     *                  - If the attribute is not set, disable scrolling.
     *                  - If the attribute is set without value, enable scrolling.
     *                  - Otherwise enable scrolling only if the `autoscroll` attribute value evaluated
     *                    as an expression yields a truthy value.
     * @example
        <example name="ngView-directive" module="ngViewExample"
                 deps="angular-route.js;angular-animate.js"
                 animations="true" fixBase="true">
          <file name="index.html">
            <div ng-controller="MainCtrl as main">
              Choose:
              <a href="Book/Moby">Moby</a> |
              <a href="Book/Moby/ch/1">Moby: Ch1</a> |
              <a href="Book/Gatsby">Gatsby</a> |
              <a href="Book/Gatsby/ch/4?key=value">Gatsby: Ch4</a> |
              <a href="Book/Scarlet">Scarlet Letter</a><br/>
    
              <div class="view-animate-container">
                <div ng-view class="view-animate"></div>
              </div>
              <hr />
    
              <pre>$location.path() = {{main.$location.path()}}</pre>
              <pre>$route.current.templateUrl = {{main.$route.current.templateUrl}}</pre>
              <pre>$route.current.params = {{main.$route.current.params}}</pre>
              <pre>$route.current.scope.name = {{main.$route.current.scope.name}}</pre>
              <pre>$routeParams = {{main.$routeParams}}</pre>
            </div>
          </file>
    
          <file name="book.html">
            <div>
              controller: {{book.name}}<br />
              Book Id: {{book.params.bookId}}<br />
            </div>
          </file>
    
          <file name="chapter.html">
            <div>
              controller: {{chapter.name}}<br />
              Book Id: {{chapter.params.bookId}}<br />
              Chapter Id: {{chapter.params.chapterId}}
            </div>
          </file>
    
          <file name="animations.css">
            .view-animate-container {
              position:relative;
              height:100px!important;
              position:relative;
              background:white;
              border:1px solid black;
              height:40px;
              overflow:hidden;
            }
    
            .view-animate {
              padding:10px;
            }
    
            .view-animate.ng-enter, .view-animate.ng-leave {
              -webkit-transition:all cubic-bezier(0.250, 0.460, 0.450, 0.940) 1.5s;
              transition:all cubic-bezier(0.250, 0.460, 0.450, 0.940) 1.5s;
    
              display:block;
              width:100%;
              border-left:1px solid black;
    
              position:absolute;
              top:0;
              left:0;
              right:0;
              bottom:0;
              padding:10px;
            }
    
            .view-animate.ng-enter {
              left:100%;
            }
            .view-animate.ng-enter.ng-enter-active {
              left:0;
            }
            .view-animate.ng-leave.ng-leave-active {
              left:-100%;
            }
          </file>
    
          <file name="script.js">
            angular.module('ngViewExample', ['ngRoute', 'ngAnimate'])
              .config(['$routeProvider', '$locationProvider',
                function($routeProvider, $locationProvider) {
                  $routeProvider
                    .when('/Book/:bookId', {
                      templateUrl: 'book.html',
                      controller: 'BookCtrl',
                      controllerAs: 'book'
                    })
                    .when('/Book/:bookId/ch/:chapterId', {
                      templateUrl: 'chapter.html',
                      controller: 'ChapterCtrl',
                      controllerAs: 'chapter'
                    });
    
                  // configure html5 to get links working on jsfiddle
                  $locationProvider.html5Mode(true);
              }])
              .controller('MainCtrl', ['$route', '$routeParams', '$location',
                function($route, $routeParams, $location) {
                  this.$route = $route;
                  this.$location = $location;
                  this.$routeParams = $routeParams;
              }])
              .controller('BookCtrl', ['$routeParams', function($routeParams) {
                this.name = "BookCtrl";
                this.params = $routeParams;
              }])
              .controller('ChapterCtrl', ['$routeParams', function($routeParams) {
                this.name = "ChapterCtrl";
                this.params = $routeParams;
              }]);
    
          </file>
    
          <file name="protractor.js" type="protractor">
            it('should load and compile correct template', function() {
              element(by.linkText('Moby: Ch1')).click();
              var content = element(by.css('[ng-view]')).getText();
              expect(content).toMatch(/controller\: ChapterCtrl/);
              expect(content).toMatch(/Book Id\: Moby/);
              expect(content).toMatch(/Chapter Id\: 1/);
    
              element(by.partialLinkText('Scarlet')).click();
    
              content = element(by.css('[ng-view]')).getText();
              expect(content).toMatch(/controller\: BookCtrl/);
              expect(content).toMatch(/Book Id\: Scarlet/);
            });
          </file>
        </example>
     */


    /**
     * @ngdoc event
     * @name ngView#$viewContentLoaded
     * @eventType emit on the current ngView scope
     * @description
     * Emitted every time the ngView content is reloaded.
     */
    ngViewFactory.$inject = ['$route', '$anchorScroll', '$animate'];
    function ngViewFactory($route, $anchorScroll, $animate) {
        return {
            restrict: 'ECA',
            terminal: true,
            priority: 400,
            transclude: 'element',
            link: function (scope, $element, attr, ctrl, $transclude) {
                var currentScope,
                    currentElement,
                    previousElement,
                    autoScrollExp = attr.autoscroll,
                    onloadExp = attr.onload || '';

                scope.$on('$routeChangeSuccess', update);
                update();

                function cleanupLastView() {
                    if (previousElement) {
                        previousElement.remove();
                        previousElement = null;
                    }
                    if (currentScope) {
                        currentScope.$destroy();
                        currentScope = null;
                    }
                    if (currentElement) {
                        $animate.leave(currentElement, function () {
                            previousElement = null;
                        });
                        previousElement = currentElement;
                        currentElement = null;
                    }
                }

                function update() {
                    var locals = $route.current && $route.current.locals,
                        template = locals && locals.$template;

                    if (angular.isDefined(template)) {
                        var newScope = scope.$new();
                        var current = $route.current;

                        // Note: This will also link all children of ng-view that were contained in the original
                        // html. If that content contains controllers, ... they could pollute/change the scope.
                        // However, using ng-view on an element with additional content does not make sense...
                        // Note: We can't remove them in the cloneAttchFn of $transclude as that
                        // function is called before linking the content, which would apply child
                        // directives to non existing elements.
                        var clone = $transclude(newScope, function (clone) {
                            $animate.enter(clone, null, currentElement || $element, function onNgViewEnter() {
                                if (angular.isDefined(autoScrollExp)
                                  && (!autoScrollExp || scope.$eval(autoScrollExp))) {
                                    $anchorScroll();
                                }
                            });
                            cleanupLastView();
                        });

                        currentElement = clone;
                        currentScope = current.scope = newScope;
                        currentScope.$emit('$viewContentLoaded');
                        currentScope.$eval(onloadExp);
                    } else {
                        cleanupLastView();
                    }
                }
            }
        };
    }

    // This directive is called during the $transclude call of the first `ngView` directive.
    // It will replace and compile the content of the element with the loaded template.
    // We need this directive so that the element content is already filled when
    // the link function of another directive on the same element as ngView
    // is called.
    ngViewFillContentFactory.$inject = ['$compile', '$controller', '$route'];
    function ngViewFillContentFactory($compile, $controller, $route) {
        return {
            restrict: 'ECA',
            priority: -400,
            link: function (scope, $element) {
                var current = $route.current,
                    locals = current.locals;

                $element.html(locals.$template);

                var link = $compile($element.contents());

                if (current.controller) {
                    locals.$scope = scope;
                    var controller = $controller(current.controller, locals);
                    if (current.controllerAs) {
                        scope[current.controllerAs] = controller;
                    }
                    $element.data('$ngControllerController', controller);
                    $element.children().data('$ngControllerController', controller);
                }

                link(scope);
            }
        };
    }


})(window, window.angular);
///#source 1 1 /App/app.js
var app = angular.module('itcongressApp', ['ngRoute', 'ui.bootstrap', 'ngSanitize']);

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

///#source 1 1 /App/controllers/homeController.js
app.controller('homeController', ['$scope', '$location', '$rootScope', 'homeService', function ($scope, $location, $rootScope, homeService) {

    $scope.sessions = [];
    init();

    $scope.addCustomer = function () {
        $scope.customers.push(
        {
            name: $scope.newCustomer.name,
            city: $scope.newCustomer.city
        });
    };

    $scope.gotoSpeaker = function (speakerId) {

    };

    $scope.addToSchedule = function (sessionId, day, time) {
        eventId = "itcongress2015";
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
        eventId = "itcongress2015";
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
                    brand: session.brand || '',
                    title: session.title,
                    day: getDay(session.sessionId),
                    time: getTime(session.sessionId, session.duration),
                    room: getRoom(session.sessionId),
                    roomName: getRoomName(session.sessionId),
                    maxAttendees: getMaxAttendees(session.sessionId),
                    currentAttendees: session.currentAttendees || 0,
                    isRegistered: false,
                    speakers: session.speakers
                });
            })

        })
        .then(function () {
            if ($rootScope.userName) {
                homeService.getRegisteredSessions("itcongress2015", $rootScope.userName).then(function (data) {
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
                return "13 May";
                break;
            case "day2":
                return "14 May";
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

    function getRoomName(rowKey) {
        switch (getRoom(rowKey)) {
            case "":
                return ""; //no room
                break;
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

    function getRoom(rowKey) {
        tmpArray = rowKey.split('-');
        if (tmpArray.length < 3) return ""; //no room
        return tmpArray[2];
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
}]);
///#source 1 1 /App/controllers/navbarController.js
app.controller('navbarController', ['$scope', '$location', '$rootScope', '$window', function ($scope, $location, $rootScope, $window) {

    // Get currentToken from localStorage
    $rootScope.currentToken = $window.localStorage.token || null;
    $rootScope.userName = $window.localStorage.userName || null;
    $rootScope.role = $window.localStorage.role || null;
    $rootScope.status = $window.localStorage.status || null;
    
    $scope.menu = [{
        'title': 'Agenda',
        'link': '/'
    }
    ,{
        'title': 'Speakers',
        'link': '/Speakers'
    }
    ];

    $scope.logout = function () {
        //Auth.logout()
        //.then(function () {
        //    $location.path('/login');
        //});

        delete $window.localStorage.token;
        delete $window.localStorage.userName;
        delete $window.localStorage.role;
        delete $window.localStorage.status;

        $rootScope.currentToken = null;
        $rootScope.userName = null;
        $rootScope.role = null;
        $rootScope.status = null;

        $location.path('/Account/Login');
    };

    // http://stackoverflow.com/a/18562339
    $scope.isActive = function (route) {
        return route === $location.path();
    };

    $scope.isActiveAdmin = function () {
        if ($location.path() == '/Admin/Users' || $location.path() == '/Admin/WhiteList' || $location.path() == '/Admin/ResetPasswords' || $location.path() == '/Admin/UserDetails')
            return true;
    };

}]);

///#source 1 1 /App/controllers/registerController.js
app.controller('registerController', ['$scope', '$rootScope', '$http', '$window', '$location', 'authService', 'whiteListService', 'dialogService', 'userService', function ($scope, $rootScope, $http, $window, $location, authService, whiteListService, dialogService, userService) {
    $scope.user = {};

    emailInUrl = $location.search()['email'];
    if (emailInUrl && emailInUrl.length > 0) {
        $scope.user.email = emailInUrl;
    }

    $scope.hasUserDetails = true;

    function validateEmail(email) {
        // http://stackoverflow.com/a/46181
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    } 

    $scope.message = '';

    $scope.isApproved = false;
    $scope.notApproved = false;



    $scope.checkEmail = function () {

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


            userService.getUserDetails("itcongress2015", $scope.user.email)
            .then(function (data) {
                $scope.hasUserDetails = true;
                //alert(JSON.stringify(data));
                $scope.user.firstName = data.firstName;
                $scope.user.lastName = data.lastName;
                $scope.user.company = data.company;
                $scope.user.title = data.title;
                $scope.user.phoneNumber = data.phone;
                $scope.user.owner = data.owner;

                registerUser($scope.user);
            })
            .catch(function (err) {
                if (err.status == 404) //not found
                    $scope.hasUserDetails = false;
                else
                    alert(JSON.stringify(err, null, 4));

                return false;
            });

            return false;




        }
        else{
            //alert('Invalid form');
        }
    };

    function registerUser(user) {
        authService.register(user)
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
                            msg = 'Contul dvs este ACTIV. In orice moment puteti accesa si configura  agenda personala utilizand adresa de email si parola folosite la inregistrare.';
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

}]);
///#source 1 1 /App/controllers/loginController.js
app.controller('loginController', ['$scope', '$rootScope', '$http', '$window', '$location', 'authService', 'dialogService', function ($scope, $rootScope, $http, $window, $location, authService, dialogService) {
    //$scope.user = { userName: 'test2@outlook.com', password: 'Aa1111'};
    $scope.user = {};
    //$scope.errors = {};

    $scope.message = '';

    $scope.submit = function (userCredentials) {
        //authService.login($scope.user)
        //alert('aaa');
        //return false;
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
                //alert(JSON.stringify(data, null, 4));
                $location.path('/');

            })
            .catch(function (err) {
                delete $window.localStorage.token;
                delete $window.localStorage.userName;
                delete $window.localStorage.isAdmin;
                delete $window.localStorage.status;

                $rootScope.currentToken = null;
                $rootScope.userName = null;
                $rootScope.role = null;
                $rootScope.status = null;

                //alert(JSON.stringify(err.data, null, 4));
                dialogService.alert(err.data.error_description, "Authentication Error");
            });

    };

    $scope.goToRegister = function () {
        if ($scope.user.userName && $scope.user.userName.length > 0)
            $location.path('/Account/Register').search('email', $scope.user.userName);
        else
            $location.path('/Account/Register');
    }
   
}]);
///#source 1 1 /App/controllers/userController.js
app.controller('userController', ['$scope', 'userService', function ($scope, userService) {
    $scope.users = [];

    $scope.changeStatus = function (id, newStatus) {
        // get the index for selected item
        var i = 0;
        for (i in $scope.users) {
            if ($scope.users[i].id == id) break;
        };

        userService.updateStatus(id, newStatus).then(function () {
            $scope.users[i].status = newStatus;
        })
    };


    init();

    function init() {
        userService.getUsers().then(function (data) {
            $scope.users = data;
        });
    };

}]);
///#source 1 1 /App/controllers/whiteListController.js
app.controller('whiteListController', ['$scope', 'whiteListService', 'dialogService', function ($scope, whiteListService, dialogService) {
    $scope.whiteList = [];
    $scope.errors = {};

    init();

    $scope.delete = function (email) {
        eventId = "itcongress2015";
        dialogService.confirm('Click ok to delete ' + email + ', otherwise click cancel.', 'Delete Email')
            .then(function () {

                // get the index for selected item
                var i = 0;
                for (i in $scope.whiteList) {
                    if ($scope.whiteList[i] == email) break;
                };

                whiteListService.delete(eventId, email).then(function () {
                    $scope.whiteList.splice(i, 1);
                })
                .catch(function (err) {
                    $scope.errors = JSON.stringify(err.data, null, 4);
                    alert($scope.errors);
                });

            }, function () {
                //alert('cancelled');
            });
    };

    $scope.add = function () {
        eventId = "itcongress2015";
        whiteListService.add(eventId, $scope.newEmail).then(function () {
            $scope.whiteList.push($scope.newEmail);
        })
        .catch(function (err) {
            $scope.errors = JSON.stringify(err.data, null, 4);
            alert($scope.errors);
        });
    };


    function init() {
        whiteListService.getWhiteList().then(function (data) {
            $scope.whiteList = data;
        });
    };
}]);
///#source 1 1 /App/controllers/confirmController.js
// http://blog.rivermoss.com/20140105/confirmation-dialog-using-angular-and-angular-ui-for-bootstrap-part-2/
app.controller('confirmController', ['$scope', '$modalInstance', 'data', function ($scope, $modalInstance, data) {

    $scope.data = data;

    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
}]);
///#source 1 1 /App/controllers/alertController.js
// http://blog.rivermoss.com/20140105/confirmation-dialog-using-angular-and-angular-ui-for-bootstrap-part-2/
app.controller('alertController', ['$scope', '$modalInstance', 'data', function ($scope, $modalInstance, data) {

    $scope.data = data;

    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
}]);
///#source 1 1 /App/controllers/speakerController.js
app.controller('speakerController', ['$scope', '$location', '$rootScope', 'speakerService', '$routeParams', function ($scope, $location, $rootScope, speakerService, $routeParams) {

    $scope.speakers = [];
    init();

    $scope.search = $routeParams.speakerId;

    function init() {

        speakerService.getSpeakers("itcongress2015").then(function (data) {
            $scope.speakers = data;
        })
        .catch(function (err) {
            alert(JSON.stringify(err, null, 4));
        });
    };
    

}]);
///#source 1 1 /App/controllers/resetPasswordsController.js
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
///#source 1 1 /App/controllers/userDetailsController.js
app.controller('userDetailsController', ['$scope', 'userService', 'dialogService', function ($scope, userService, dialogService) {
    $scope.userDetailsList = [];

    init();

    function init() {
        userService.getAllUserDetails("itcongress2015").then(function (data) {
            $scope.userDetailsList = data;
        });
    };
}]);
///#source 1 1 /App/services/homeService.js
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

        return $http.get('/api/itcongress2015/sessions').then(function (result) {
            return result.data;
        });

        //return $http.get('/api/itcongress2015/sessions');
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


///#source 1 1 /App/services/authService.js
app.factory('authService', ['$http', function ($http) {

    var factory = {};

    // http://stackoverflow.com/a/14868725
    var formEncode = function (obj) {
        var str = [];
        for (var p in obj)
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        return str.join("&");
    }

    factory.login = function (userCredentials) {
        userCredentials.grant_type = 'password';

        // the OWIN OAuth provider is expecting the post to the "/Token" service to be form encoded and not json encoded
        // so, the expected request should be: "userName=test2%40outlook.com&password=Aa1111%40&grant_type=password"
        
        // depending on jQuery:
        //var dataAsFormEncoded = $.param(userCredentials);

        // if you want to not depend on JQuery: http://stackoverflow.com/a/14868725
        var dataAsFormEncoded = formEncode(userCredentials);

        return $http.post('/token', dataAsFormEncoded, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
            .then(function (response) {
                return response.data;
            });
    };

    factory.register = function (userRegistrationData) {
        return $http.post('/api/account/register', userRegistrationData)
            .then(function (response) {
                return response.data;
            });
    };

    return factory;
}]);
///#source 1 1 /App/services/userService.js
app.factory('userService', ['$http', function ($http) {

    var factory = {};

    factory.getUsers = function () {
        return $http.get('/api/users').then(function (result) {
            return result.data;
        });
    };

    factory.updateStatus = function (userId, newStatus) {
        return $http.put('/api/users/' + userId + '/' + newStatus);
    };

    factory.resetPassword = function (data) {
        return $http.put('/api/account/resetPassword', data);
    };

    factory.getAllUserDetails = function (eventId) {
        return $http.get('/api/' + eventId + '/userdetails').then(function (result) {
            return result.data;
        });
    };

    factory.getUserDetails = function (eventId, email) {
        return $http.get('/api/' + eventId + '/userdetails/' + encodeURIComponent(email) + '/').then(function (result) {
            return result.data;
        });
    };

    return factory;
}]);
///#source 1 1 /App/services/whiteListService.js
app.factory('whiteListService', ['$http', function ($http) {

    var factory = {};

    factory.getWhiteList = function () {
        return $http.get('/api/itcongress2015/whiteList').then(function (result) {
            return result.data;
        });
    };

    factory.delete = function (eventId, email) {
        return $http.delete('/api/' + eventId + '/whiteList/' + encodeURIComponent(email) + '/');
    };

    factory.add = function (eventId, email) {
        return $http.post('/api/' + eventId + '/whiteList/' + encodeURIComponent(email) + '/');
    };

    factory.get = function (eventId, email) {
        return $http.get('/api/' + eventId + '/whiteList/' + encodeURIComponent(email) + '/').then(function (result) {
            return result.data;
        });
    };

    return factory;
}]);
///#source 1 1 /App/services/dialogService.js
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
///#source 1 1 /App/services/speakerService.js
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


///#source 1 1 /App/services/authInterceptor.js
// https://auth0.com/blog/2014/01/07/angularjs-authentication-with-cookies-vs-token/
app.factory('authInterceptor', ['$rootScope', '$q', '$window', function ($rootScope, $q, $window) {
    return {
        request: function (config) {
            config.headers = config.headers || {};

            //if ($window.sessionStorage.token) {
            //    config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
            //}

            if ($window.localStorage.token) {
                config.headers.Authorization = 'Bearer ' + $window.localStorage.token;
            }

            return config;
        },
        response: function (response) {
            if (response.status === 401 || response.status === 403) {
                // handle the case where the user is not authenticated
                $location.path('/Account/Login');
            }
            
            return response || $q.when(response);
        }
    };
}]);
///#source 1 1 /App/directives/ngMatch.js
// http://ngmodules.org/modules/angular-input-match
app.directive('match', function () {
    return {
        require: 'ngModel',
        restrict: 'A',
        scope: {
            match: '='
        },
        link: function (scope, elem, attrs, ctrl) {
            scope.$watch(function () {
                return (ctrl.$pristine && angular.isUndefined(ctrl.$modelValue)) || scope.match === ctrl.$modelValue;
            }, function (currentValue) {
                ctrl.$setValidity('match', currentValue);
            });
        }
    };
});

