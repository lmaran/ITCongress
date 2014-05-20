///#source 1 1 /Scripts/angular-translate.js
/**
 * angular-translate - v2.0.1 - 2014-02-25
 * http://github.com/PascalPrecht/angular-translate
 * Copyright (c) 2014 ; Licensed 
 */
angular.module('pascalprecht.translate', ['ng']).run([
  '$translate',
  function ($translate) {
    var key = $translate.storageKey(), storage = $translate.storage();
    if (storage) {
      if (!storage.get(key)) {
        if (angular.isString($translate.preferredLanguage())) {
          $translate.use($translate.preferredLanguage());
        } else {
          storage.set(key, $translate.use());
        }
      } else {
        $translate.use(storage.get(key));
      }
    } else if (angular.isString($translate.preferredLanguage())) {
      $translate.use($translate.preferredLanguage());
    }
  }
]);
angular.module('pascalprecht.translate').provider('$translate', [
  '$STORAGE_KEY',
  function ($STORAGE_KEY) {
    var $translationTable = {}, $preferredLanguage, $availableLanguageKeys = [], $languageKeyAliases, $fallbackLanguage, $fallbackWasString, $uses, $nextLang, $storageFactory, $storageKey = $STORAGE_KEY, $storagePrefix, $missingTranslationHandlerFactory, $interpolationFactory, $interpolatorFactories = [], $interpolationSanitizationStrategy = false, $loaderFactory, $cloakClassName = 'translate-cloak', $loaderOptions, $notFoundIndicatorLeft, $notFoundIndicatorRight, $postCompilingEnabled = false, NESTED_OBJECT_DELIMITER = '.';
    var getLocale = function () {
      var nav = window.navigator;
      return (nav.language || nav.browserLanguage || nav.systemLanguage || nav.userLanguage || '').split('-').join('_');
    };
    var negotiateLocale = function (preferred) {
      var avail = [], locale = angular.lowercase(preferred), i = 0, n = $availableLanguageKeys.length;
      for (; i < n; i++) {
        avail.push(angular.lowercase($availableLanguageKeys[i]));
      }
      if (avail.indexOf(locale) > -1) {
        return locale;
      }
      if ($languageKeyAliases) {
        if ($languageKeyAliases[preferred]) {
          var alias = $languageKeyAliases[preferred];
          if (avail.indexOf(angular.lowercase(alias)) > -1) {
            return alias;
          }
        }
      }
      var parts = preferred.split('_');
      if (parts.length > 1 && avail.indexOf(angular.lowercase(parts[0])) > 1) {
        return parts[0];
      }
    };
    var translations = function (langKey, translationTable) {
      if (!langKey && !translationTable) {
        return $translationTable;
      }
      if (langKey && !translationTable) {
        if (angular.isString(langKey)) {
          return $translationTable[langKey];
        }
      } else {
        if (!angular.isObject($translationTable[langKey])) {
          $translationTable[langKey] = {};
        }
        angular.extend($translationTable[langKey], flatObject(translationTable));
      }
      return this;
    };
    this.translations = translations;
    this.cloakClassName = function (name) {
      if (!name) {
        return $cloakClassName;
      }
      $cloakClassName = name;
      return this;
    };
    var flatObject = function (data, path, result, prevKey) {
      var key, keyWithPath, keyWithShortPath, val;
      if (!path) {
        path = [];
      }
      if (!result) {
        result = {};
      }
      for (key in data) {
        if (!data.hasOwnProperty(key)) {
          continue;
        }
        val = data[key];
        if (angular.isObject(val)) {
          flatObject(val, path.concat(key), result, key);
        } else {
          keyWithPath = path.length ? '' + path.join(NESTED_OBJECT_DELIMITER) + NESTED_OBJECT_DELIMITER + key : key;
          if (path.length && key === prevKey) {
            keyWithShortPath = '' + path.join(NESTED_OBJECT_DELIMITER);
            result[keyWithShortPath] = '@:' + keyWithPath;
          }
          result[keyWithPath] = val;
        }
      }
      return result;
    };
    this.addInterpolation = function (factory) {
      $interpolatorFactories.push(factory);
      return this;
    };
    this.useMessageFormatInterpolation = function () {
      return this.useInterpolation('$translateMessageFormatInterpolation');
    };
    this.useInterpolation = function (factory) {
      $interpolationFactory = factory;
      return this;
    };
    this.useSanitizeValueStrategy = function (value) {
      $interpolationSanitizationStrategy = value;
      return this;
    };
    this.preferredLanguage = function (langKey) {
      if (langKey) {
        $preferredLanguage = langKey;
        return this;
      }
      return $preferredLanguage;
    };
    this.translationNotFoundIndicator = function (indicator) {
      this.translationNotFoundIndicatorLeft(indicator);
      this.translationNotFoundIndicatorRight(indicator);
      return this;
    };
    this.translationNotFoundIndicatorLeft = function (indicator) {
      if (!indicator) {
        return $notFoundIndicatorLeft;
      }
      $notFoundIndicatorLeft = indicator;
      return this;
    };
    this.translationNotFoundIndicatorRight = function (indicator) {
      if (!indicator) {
        return $notFoundIndicatorRight;
      }
      $notFoundIndicatorRight = indicator;
      return this;
    };
    this.fallbackLanguage = function (langKey) {
      fallbackStack(langKey);
      return this;
    };
    var fallbackStack = function (langKey) {
      if (langKey) {
        if (angular.isString(langKey)) {
          $fallbackWasString = true;
          $fallbackLanguage = [langKey];
        } else if (angular.isArray(langKey)) {
          $fallbackWasString = false;
          $fallbackLanguage = langKey;
        }
        if (angular.isString($preferredLanguage)) {
          $fallbackLanguage.push($preferredLanguage);
        }
        return this;
      } else {
        if ($fallbackWasString) {
          return $fallbackLanguage[0];
        } else {
          return $fallbackLanguage;
        }
      }
    };
    this.use = function (langKey) {
      if (langKey) {
        if (!$translationTable[langKey] && !$loaderFactory) {
          throw new Error('$translateProvider couldn\'t find translationTable for langKey: \'' + langKey + '\'');
        }
        $uses = langKey;
        return this;
      }
      return $uses;
    };
    var storageKey = function (key) {
      if (!key) {
        if ($storagePrefix) {
          return $storagePrefix + $storageKey;
        }
        return $storageKey;
      }
      $storageKey = key;
    };
    this.storageKey = storageKey;
    this.useUrlLoader = function (url) {
      return this.useLoader('$translateUrlLoader', { url: url });
    };
    this.useStaticFilesLoader = function (options) {
      return this.useLoader('$translateStaticFilesLoader', options);
    };
    this.useLoader = function (loaderFactory, options) {
      $loaderFactory = loaderFactory;
      $loaderOptions = options || {};
      return this;
    };
    this.useLocalStorage = function () {
      return this.useStorage('$translateLocalStorage');
    };
    this.useCookieStorage = function () {
      return this.useStorage('$translateCookieStorage');
    };
    this.useStorage = function (storageFactory) {
      $storageFactory = storageFactory;
      return this;
    };
    this.storagePrefix = function (prefix) {
      if (!prefix) {
        return prefix;
      }
      $storagePrefix = prefix;
      return this;
    };
    this.useMissingTranslationHandlerLog = function () {
      return this.useMissingTranslationHandler('$translateMissingTranslationHandlerLog');
    };
    this.useMissingTranslationHandler = function (factory) {
      $missingTranslationHandlerFactory = factory;
      return this;
    };
    this.usePostCompiling = function (value) {
      $postCompilingEnabled = !!value;
      return this;
    };
    this.determinePreferredLanguage = function (fn) {
      var locale = fn && angular.isFunction(fn) ? fn() : getLocale();
      if (!$availableLanguageKeys.length) {
        $preferredLanguage = locale;
        return this;
      } else {
        $preferredLanguage = negotiateLocale(locale);
      }
    };
    this.registerAvailableLanguageKeys = function (languageKeys, aliases) {
      if (languageKeys) {
        $availableLanguageKeys = languageKeys;
        if (aliases) {
          $languageKeyAliases = aliases;
        }
        return this;
      }
      return $availableLanguageKeys;
    };
    this.$get = [
      '$log',
      '$injector',
      '$rootScope',
      '$q',
      function ($log, $injector, $rootScope, $q) {
        var Storage, defaultInterpolator = $injector.get($interpolationFactory || '$translateDefaultInterpolation'), pendingLoader = false, interpolatorHashMap = {}, langPromises = {}, fallbackIndex, startFallbackIteration;
        var $translate = function (translationId, interpolateParams, interpolationId) {
          var deferred = $q.defer();
          translationId = translationId.trim();
          var promiseToWaitFor = function () {
              var promise = $preferredLanguage ? langPromises[$preferredLanguage] : langPromises[$uses];
              fallbackIndex = 0;
              if ($storageFactory && !promise) {
                var langKey = Storage.get($storageKey);
                promise = langPromises[langKey];
                if ($fallbackLanguage && $fallbackLanguage.length) {
                  var index = indexOf($fallbackLanguage, langKey);
                  fallbackIndex = index > -1 ? index += 1 : 0;
                  $fallbackLanguage.push($preferredLanguage);
                }
              }
              return promise;
            }();
          if (!promiseToWaitFor) {
            determineTranslation(translationId, interpolateParams, interpolationId).then(deferred.resolve, deferred.reject);
          } else {
            promiseToWaitFor.then(function () {
              determineTranslation(translationId, interpolateParams, interpolationId).then(deferred.resolve, deferred.reject);
            }, deferred.reject);
          }
          return deferred.promise;
        };
        var indexOf = function (array, searchElement) {
          for (var i = 0, len = array.length; i < len; i++) {
            if (array[i] === searchElement) {
              return i;
            }
          }
          return -1;
        };
        var applyNotFoundIndicators = function (translationId) {
          if ($notFoundIndicatorLeft) {
            translationId = [
              $notFoundIndicatorLeft,
              translationId
            ].join(' ');
          }
          if ($notFoundIndicatorRight) {
            translationId = [
              translationId,
              $notFoundIndicatorRight
            ].join(' ');
          }
          return translationId;
        };
        var useLanguage = function (key) {
          $uses = key;
          $rootScope.$emit('$translateChangeSuccess');
          if ($storageFactory) {
            Storage.set($translate.storageKey(), $uses);
          }
          defaultInterpolator.setLocale($uses);
          angular.forEach(interpolatorHashMap, function (interpolator, id) {
            interpolatorHashMap[id].setLocale($uses);
          });
          $rootScope.$emit('$translateChangeEnd');
        };
        var loadAsync = function (key) {
          if (!key) {
            throw 'No language key specified for loading.';
          }
          var deferred = $q.defer();
          $rootScope.$emit('$translateLoadingStart');
          pendingLoader = true;
          $injector.get($loaderFactory)(angular.extend($loaderOptions, { key: key })).then(function (data) {
            var translationTable = {};
            $rootScope.$emit('$translateLoadingSuccess');
            if (angular.isArray(data)) {
              angular.forEach(data, function (table) {
                angular.extend(translationTable, flatObject(table));
              });
            } else {
              angular.extend(translationTable, flatObject(data));
            }
            pendingLoader = false;
            deferred.resolve({
              key: key,
              table: translationTable
            });
            $rootScope.$emit('$translateLoadingEnd');
          }, function (key) {
            $rootScope.$emit('$translateLoadingError');
            deferred.reject(key);
            $rootScope.$emit('$translateLoadingEnd');
          });
          return deferred.promise;
        };
        if ($storageFactory) {
          Storage = $injector.get($storageFactory);
          if (!Storage.get || !Storage.set) {
            throw new Error('Couldn\'t use storage \'' + $storageFactory + '\', missing get() or set() method!');
          }
        }
        if (angular.isFunction(defaultInterpolator.useSanitizeValueStrategy)) {
          defaultInterpolator.useSanitizeValueStrategy($interpolationSanitizationStrategy);
        }
        if ($interpolatorFactories.length) {
          angular.forEach($interpolatorFactories, function (interpolatorFactory) {
            var interpolator = $injector.get(interpolatorFactory);
            interpolator.setLocale($preferredLanguage || $uses);
            if (angular.isFunction(interpolator.useSanitizeValueStrategy)) {
              interpolator.useSanitizeValueStrategy($interpolationSanitizationStrategy);
            }
            interpolatorHashMap[interpolator.getInterpolationIdentifier()] = interpolator;
          });
        }
        var getTranslationTable = function (langKey) {
          var deferred = $q.defer();
          if ($translationTable.hasOwnProperty(langKey)) {
            deferred.resolve($translationTable[langKey]);
            return deferred.promise;
          } else {
            langPromises[langKey].then(function (data) {
              translations(data.key, data.table);
              deferred.resolve(data.table);
            }, deferred.reject);
          }
          return deferred.promise;
        };
        var getFallbackTranslation = function (langKey, translationId, interpolateParams, Interpolator) {
          var deferred = $q.defer();
          getTranslationTable(langKey).then(function (translationTable) {
            if (translationTable.hasOwnProperty(translationId)) {
              Interpolator.setLocale(langKey);
              deferred.resolve(Interpolator.interpolate(translationTable[translationId], interpolateParams));
              Interpolator.setLocale($uses);
            } else {
              deferred.reject();
            }
          }, deferred.reject);
          return deferred.promise;
        };
        var getFallbackTranslationInstant = function (langKey, translationId, interpolateParams, Interpolator) {
          var result, translationTable = $translationTable[langKey];
          if (translationTable.hasOwnProperty(translationId)) {
            Interpolator.setLocale(langKey);
            result = Interpolator.interpolate(translationTable[translationId], interpolateParams);
            Interpolator.setLocale($uses);
          }
          return result;
        };
        var resolveForFallbackLanguage = function (fallbackLanguageIndex, translationId, interpolateParams, Interpolator) {
          var deferred = $q.defer();
          if (fallbackLanguageIndex < $fallbackLanguage.length) {
            var langKey = $fallbackLanguage[fallbackLanguageIndex];
            getFallbackTranslation(langKey, translationId, interpolateParams, Interpolator).then(function (translation) {
              deferred.resolve(translation);
            }, function () {
              var nextFallbackLanguagePromise = resolveForFallbackLanguage(fallbackLanguageIndex + 1, translationId, interpolateParams, Interpolator);
              deferred.resolve(nextFallbackLanguagePromise);
            });
          } else {
            deferred.resolve(translationId);
          }
          return deferred.promise;
        };
        var resolveForFallbackLanguageInstant = function (fallbackLanguageIndex, translationId, interpolateParams, Interpolator) {
          var result;
          if (fallbackLanguageIndex < $fallbackLanguage.length) {
            var langKey = $fallbackLanguage[fallbackLanguageIndex];
            result = getFallbackTranslationInstant(langKey, translationId, interpolateParams, Interpolator);
            if (!result) {
              result = resolveForFallbackLanguageInstant(fallbackLanguageIndex + 1, translationId, interpolateParams, Interpolator);
            }
          }
          return result;
        };
        var fallbackTranslation = function (translationId, interpolateParams, Interpolator) {
          return resolveForFallbackLanguage(startFallbackIteration > 0 ? startFallbackIteration : fallbackIndex, translationId, interpolateParams, Interpolator);
        };
        var fallbackTranslationInstant = function (translationId, interpolateParams, Interpolator) {
          return resolveForFallbackLanguageInstant(startFallbackIteration > 0 ? startFallbackIteration : fallbackIndex, translationId, interpolateParams, Interpolator);
        };
        var determineTranslation = function (translationId, interpolateParams, interpolationId) {
          var deferred = $q.defer();
          var table = $uses ? $translationTable[$uses] : $translationTable, Interpolator = interpolationId ? interpolatorHashMap[interpolationId] : defaultInterpolator;
          if (table && table.hasOwnProperty(translationId)) {
            var translation = table[translationId];
            if (translation.substr(0, 2) === '@:') {
              $translate(translation.substr(2), interpolateParams, interpolationId).then(deferred.resolve, deferred.reject);
            } else {
              deferred.resolve(Interpolator.interpolate(translation, interpolateParams));
            }
          } else {
            if ($missingTranslationHandlerFactory && !pendingLoader) {
              $injector.get($missingTranslationHandlerFactory)(translationId, $uses);
            }
            if ($uses && $fallbackLanguage && $fallbackLanguage.length) {
              fallbackTranslation(translationId, interpolateParams, Interpolator).then(function (translation) {
                deferred.resolve(translation);
              }, function (_translationId) {
                deferred.reject(applyNotFoundIndicators(_translationId));
              });
            } else {
              deferred.reject(applyNotFoundIndicators(translationId));
            }
          }
          return deferred.promise;
        };
        var determineTranslationInstant = function (translationId, interpolateParams, interpolationId) {
          var result, table = $uses ? $translationTable[$uses] : $translationTable, Interpolator = interpolationId ? interpolatorHashMap[interpolationId] : defaultInterpolator;
          if (table && table.hasOwnProperty(translationId)) {
            var translation = table[translationId];
            if (translation.substr(0, 2) === '@:') {
              result = determineTranslationInstant(translation.substr(2), interpolateParams, interpolationId);
            } else {
              result = Interpolator.interpolate(translation, interpolateParams);
            }
          } else {
            if ($missingTranslationHandlerFactory && !pendingLoader) {
              $injector.get($missingTranslationHandlerFactory)(translationId, $uses);
            }
            if ($uses && $fallbackLanguage && $fallbackLanguage.length) {
              fallbackIndex = 0;
              result = fallbackTranslationInstant(translationId, interpolateParams, Interpolator);
            } else {
              result = applyNotFoundIndicators(translationId);
            }
          }
          return result;
        };
        $translate.preferredLanguage = function () {
          return $preferredLanguage;
        };
        $translate.cloakClassName = function () {
          return $cloakClassName;
        };
        $translate.fallbackLanguage = function (langKey) {
          if (langKey !== undefined && langKey !== null) {
            fallbackStack(langKey);
            if ($loaderFactory) {
              if ($fallbackLanguage && $fallbackLanguage.length) {
                for (var i = 0, len = $fallbackLanguage.length; i < len; i++) {
                  if (!langPromises[$fallbackLanguage[i]]) {
                    langPromises[$fallbackLanguage[i]] = loadAsync($fallbackLanguage[i]);
                  }
                }
              }
            }
            $translate.use($translate.use());
          }
          if ($fallbackWasString) {
            return $fallbackLanguage[0];
          } else {
            return $fallbackLanguage;
          }
        };
        $translate.useFallbackLanguage = function (langKey) {
          if (langKey !== undefined && langKey !== null) {
            if (!langKey) {
              startFallbackIteration = 0;
            } else {
              var langKeyPosition = indexOf($fallbackLanguage, langKey);
              if (langKeyPosition > -1) {
                startFallbackIteration = langKeyPosition;
              }
            }
          }
        };
        $translate.proposedLanguage = function () {
          return $nextLang;
        };
        $translate.storage = function () {
          return Storage;
        };
        $translate.use = function (key) {
          if (!key) {
            return $uses;
          }
          var deferred = $q.defer();
          $rootScope.$emit('$translateChangeStart');
          if (!$translationTable[key] && $loaderFactory) {
            $nextLang = key;
            langPromises[key] = loadAsync(key).then(function (translation) {
              translations(translation.key, translation.table);
              deferred.resolve(translation.key);
              if ($nextLang === key) {
                useLanguage(translation.key);
                $nextLang = undefined;
              }
            }, function (key) {
              $nextLang = undefined;
              $rootScope.$emit('$translateChangeError');
              deferred.reject(key);
              $rootScope.$emit('$translateChangeEnd');
            });
          } else {
            deferred.resolve(key);
            useLanguage(key);
          }
          return deferred.promise;
        };
        $translate.storageKey = function () {
          return storageKey();
        };
        $translate.isPostCompilingEnabled = function () {
          return $postCompilingEnabled;
        };
        $translate.refresh = function (langKey) {
          if (!$loaderFactory) {
            throw new Error('Couldn\'t refresh translation table, no loader registered!');
          }
          var deferred = $q.defer();
          function resolve() {
            deferred.resolve();
            $rootScope.$emit('$translateRefreshEnd');
          }
          function reject() {
            deferred.reject();
            $rootScope.$emit('$translateRefreshEnd');
          }
          $rootScope.$emit('$translateRefreshStart');
          if (!langKey) {
            var tables = [];
            if ($fallbackLanguage && $fallbackLanguage.length) {
              for (var i = 0, len = $fallbackLanguage.length; i < len; i++) {
                tables.push(loadAsync($fallbackLanguage[i]));
              }
            }
            if ($uses) {
              tables.push(loadAsync($uses));
            }
            $q.all(tables).then(function (tableData) {
              angular.forEach(tableData, function (data) {
                if ($translationTable[data.key]) {
                  delete $translationTable[data.key];
                }
                translations(data.key, data.table);
              });
              if ($uses) {
                useLanguage($uses);
              }
              resolve();
            });
          } else if ($translationTable[langKey]) {
            loadAsync(langKey).then(function (data) {
              translations(data.key, data.table);
              if (langKey === $uses) {
                useLanguage($uses);
              }
              resolve();
            }, reject);
          } else {
            reject();
          }
          return deferred.promise;
        };
        $translate.instant = function (translationId, interpolateParams, interpolationId) {
          if (typeof translationId === 'undefined' || translationId === '') {
            return translationId;
          }
          translationId = translationId.trim();
          var result, possibleLangKeys = [];
          if ($preferredLanguage) {
            possibleLangKeys.push($preferredLanguage);
          }
          if ($uses) {
            possibleLangKeys.push($uses);
          }
          if ($fallbackLanguage && $fallbackLanguage.length) {
            possibleLangKeys = possibleLangKeys.concat($fallbackLanguage);
          }
          for (var i = 0, c = possibleLangKeys.length; i < c; i++) {
            var possibleLangKey = possibleLangKeys[i];
            if ($translationTable[possibleLangKey]) {
              if ($translationTable[possibleLangKey][translationId]) {
                result = determineTranslationInstant(translationId, interpolateParams, interpolationId);
              }
            }
            if (typeof result !== 'undefined') {
              break;
            }
          }
          if (!result) {
            result = translationId;
            if ($missingTranslationHandlerFactory && !pendingLoader) {
              $injector.get($missingTranslationHandlerFactory)(translationId, $uses);
            }
          }
          return result;
        };
        if ($loaderFactory) {
          if (angular.equals($translationTable, {})) {
            $translate.use($translate.use());
          }
          if ($fallbackLanguage && $fallbackLanguage.length) {
            for (var i = 0, len = $fallbackLanguage.length; i < len; i++) {
              langPromises[$fallbackLanguage[i]] = loadAsync($fallbackLanguage[i]);
            }
          }
        }
        return $translate;
      }
    ];
  }
]);
angular.module('pascalprecht.translate').factory('$translateDefaultInterpolation', [
  '$interpolate',
  function ($interpolate) {
    var $translateInterpolator = {}, $locale, $identifier = 'default', $sanitizeValueStrategy = null, sanitizeValueStrategies = {
        escaped: function (params) {
          var result = {};
          for (var key in params) {
            if (params.hasOwnProperty(key)) {
              result[key] = angular.element('<div></div>').text(params[key]).html();
            }
          }
          return result;
        }
      };
    var sanitizeParams = function (params) {
      var result;
      if (angular.isFunction(sanitizeValueStrategies[$sanitizeValueStrategy])) {
        result = sanitizeValueStrategies[$sanitizeValueStrategy](params);
      } else {
        result = params;
      }
      return result;
    };
    $translateInterpolator.setLocale = function (locale) {
      $locale = locale;
    };
    $translateInterpolator.getInterpolationIdentifier = function () {
      return $identifier;
    };
    $translateInterpolator.useSanitizeValueStrategy = function (value) {
      $sanitizeValueStrategy = value;
      return this;
    };
    $translateInterpolator.interpolate = function (string, interpolateParams) {
      if ($sanitizeValueStrategy) {
        interpolateParams = sanitizeParams(interpolateParams);
      }
      return $interpolate(string)(interpolateParams);
    };
    return $translateInterpolator;
  }
]);
angular.module('pascalprecht.translate').constant('$STORAGE_KEY', 'NG_TRANSLATE_LANG_KEY');
angular.module('pascalprecht.translate').directive('translate', [
  '$translate',
  '$q',
  '$interpolate',
  '$compile',
  '$parse',
  '$rootScope',
  function ($translate, $q, $interpolate, $compile, $parse, $rootScope) {
    return {
      restrict: 'AE',
      scope: true,
      compile: function (tElement, tAttr) {
        var translateValuesExist = tAttr.translateValues ? tAttr.translateValues : undefined;
        var translateInterpolation = tAttr.translateInterpolation ? tAttr.translateInterpolation : undefined;
        var translateValueExist = tElement[0].outerHTML.match(/translate-value-+/i);
        return function linkFn(scope, iElement, iAttr) {
          scope.interpolateParams = {};
          iAttr.$observe('translate', function (translationId) {
            if (angular.equals(translationId, '') || !angular.isDefined(translationId)) {
              scope.translationId = $interpolate(iElement.text().replace(/^\s+|\s+$/g, ''))(scope.$parent);
            } else {
              scope.translationId = translationId;
            }
          });
          if (translateValuesExist) {
            iAttr.$observe('translateValues', function (interpolateParams) {
              if (interpolateParams) {
                scope.$parent.$watch(function () {
                  angular.extend(scope.interpolateParams, $parse(interpolateParams)(scope.$parent));
                });
              }
            });
          }
          if (translateValueExist) {
            var fn = function (attrName) {
              iAttr.$observe(attrName, function (value) {
                scope.interpolateParams[angular.lowercase(attrName.substr(14))] = value;
              });
            };
            for (var attr in iAttr) {
              if (iAttr.hasOwnProperty(attr) && attr.substr(0, 14) === 'translateValue' && attr !== 'translateValues') {
                fn(attr);
              }
            }
          }
          var applyElementContent = function (value, scope) {
            iElement.html(value);
            var globallyEnabled = $translate.isPostCompilingEnabled();
            var locallyDefined = typeof tAttr.translateCompile !== 'undefined';
            var locallyEnabled = locallyDefined && tAttr.translateCompile !== 'false';
            if (globallyEnabled && !locallyDefined || locallyEnabled) {
              $compile(iElement.contents())(scope);
            }
          };
          var updateTranslationFn = function () {
              if (!translateValuesExist && !translateValueExist) {
                return function () {
                  var unwatch = scope.$watch('translationId', function (value) {
                      if (scope.translationId && value) {
                        $translate(value, {}, translateInterpolation).then(function (translation) {
                          applyElementContent(translation, scope);
                          unwatch();
                        }, function (translationId) {
                          applyElementContent(translationId, scope);
                          unwatch();
                        });
                      }
                    }, true);
                };
              } else {
                return function () {
                  scope.$watch('interpolateParams', function (value) {
                    if (scope.translationId && value) {
                      $translate(scope.translationId, value, translateInterpolation).then(function (translation) {
                        applyElementContent(translation, scope);
                      }, function (translationId) {
                        applyElementContent(translationId, scope);
                      });
                    }
                  }, true);
                };
              }
            }();
          var unbind = $rootScope.$on('$translateChangeSuccess', updateTranslationFn);
          updateTranslationFn();
          scope.$on('$destroy', unbind);
        };
      }
    };
  }
]);
angular.module('pascalprecht.translate').directive('translateCloak', [
  '$rootScope',
  '$translate',
  function ($rootScope, $translate) {
    return {
      compile: function (tElement) {
        $rootScope.$on('$translateLoadingSuccess', function () {
          tElement.removeClass($translate.cloakClassName());
        });
        tElement.addClass($translate.cloakClassName());
      }
    };
  }
]);
angular.module('pascalprecht.translate').filter('translate', [
  '$parse',
  '$translate',
  function ($parse, $translate) {
    return function (translationId, interpolateParams, interpolation) {
      if (!angular.isObject(interpolateParams)) {
        interpolateParams = $parse(interpolateParams)();
      }
      return $translate.instant(translationId, interpolateParams, interpolation);
    };
  }
]);
///#source 1 1 /Scripts/angular-translate-loader-static-files.js
/*!
 * angular-translate - v2.1.0 - 2014-04-02
 * http://github.com/PascalPrecht/angular-translate
 * Copyright (c) 2014 ; Licensed MIT
 */
angular.module('pascalprecht.translate').factory('$translateStaticFilesLoader', [
  '$q',
  '$http',
  function ($q, $http) {
      return function (options) {
          if (!options || (!angular.isString(options.prefix) || !angular.isString(options.suffix))) {
              throw new Error('Couldn\'t load static files, no prefix or suffix specified!');
          }
          var deferred = $q.defer();
          $http({
              url: [
                options.prefix,
                options.key,
                options.suffix
              ].join(''),
              method: 'GET',
              params: ''
          }).success(function (data) {
              deferred.resolve(data);
          }).error(function (data) {
              deferred.reject(options.key);
          });
          return deferred.promise;
      };
  }
]);
///#source 1 1 /Scripts/angular-translate-storage-cookie.js
/*!
 * angular-translate - v2.1.0 - 2014-04-02
 * http://github.com/PascalPrecht/angular-translate
 * Copyright (c) 2014 ; Licensed MIT
 */

/**
 * @requires $cookieStore
 * This service is used when telling angular-translate to use cookieStore as storage.
 *
 */

angular.module('pascalprecht.translate').factory('$translateCookieStorage', [
  '$cookieStore',
  function ($cookieStore) {
      var $translateCookieStorage = {
          get: function (name) {
              return $cookieStore.get(name);
          },
          set: function (name, value) {
              $cookieStore.put(name, value);
          }
      };
      return $translateCookieStorage;
  }
]);
///#source 1 1 /Scripts/angular-translate-storage-local.js
/*!
 * angular-translate - v2.1.0 - 2014-04-02
 * http://github.com/PascalPrecht/angular-translate
 * Copyright (c) 2014 ; Licensed MIT
 */
angular.module('pascalprecht.translate').factory('$translateLocalStorage', [
  '$window',
  '$translateCookieStorage',
  function ($window, $translateCookieStorage) {
      var localStorageAdapter = {
          get: function (name) {
              return $window.localStorage.getItem(name);
          },
          set: function (name, value) {
              $window.localStorage.setItem(name, value);
          }
      };
      var $translateLocalStorage = 'localStorage' in $window && $window.localStorage !== null ? localStorageAdapter : $translateCookieStorage;
      return $translateLocalStorage;
  }
]);
///#source 1 1 /App/app.js
var app = angular.module('itcongressApp', ['ngRoute', 'pascalprecht.translate', 'ngCookies', 'ui.bootstrap', 'ngSanitize']);

app.config(['$routeProvider', '$locationProvider', '$translateProvider', function ($routeProvider, $locationProvider, $translateProvider) {
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


    // Initialize the translate provider
    // Doc: http://angular-translate.github.io/docs/#/api
    $translateProvider
        //.translations('en', translations)
        .preferredLanguage('en')
        .fallbackLanguage('en') // maybe there are some translation ids, that are available in an english translation table, but not in other (ro) translation table
        .useLocalStorage() //to remember the chosen language; it use 'storage-cookie' as fallback; 'storage-cookie' depends on 'ngCookies'
        .useStaticFilesLoader({
            prefix: 'Content/translates/',
            suffix: '.json'
        });

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
app.controller('navbarController', ['$scope', '$location', '$translate', '$rootScope', '$window', function ($scope, $location, $translate, $rootScope, $window) {

    // Get currentToken from localStorage
    $rootScope.currentToken = $window.localStorage.token || null;
    $rootScope.userName = $window.localStorage.userName || null;
    $rootScope.role = $window.localStorage.role || null;
    $rootScope.status = $window.localStorage.status || null;
    
    $scope.menu = [{
        'title': 'Home',
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

    $scope.changeLanguage = function (langKey) {
        $translate.use(langKey);
    };

}]);

///#source 1 1 /App/controllers/registerController.js
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

            whiteListService.get("itcongress2014", $scope.user.email)
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
                                msg = 'Contul dvs este INACTIV. Deoarece aceasta adresa de email nu exista in baza noastra de date va rugam sa asteptati ca inregistrarea sa fie activata de catre echipa IT Congress 2014. Un email de confirmare a activarii contului va fi trimis pe aceasta adresa in urmatoarele 24 de ore.';
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
///#source 1 1 /App/controllers/loginController.js
app.controller('loginController', ['$scope', '$rootScope', '$http', '$window', '$location', 'authService', 'dialogService', function ($scope, $rootScope, $http, $window, $location, authService, dialogService) {
    //$scope.user = { userName: 'test2@outlook.com', password: 'Aa1111'};
    $scope.user = {};
    //$scope.errors = {};

    $scope.message = '';

    $scope.submit = function (userCredentials) {
        //authService.login($scope.user)
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
        eventId = "itcongress2014";
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
        eventId = "itcongress2014";
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

        speakerService.getSpeakers("itcongress2014").then(function (data) {
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

    return factory;
}]);
///#source 1 1 /App/services/whiteListService.js
app.factory('whiteListService', ['$http', function ($http) {

    var factory = {};

    factory.getWhiteList = function () {
        return $http.get('/api/itcongress2014/whiteList').then(function (result) {
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

