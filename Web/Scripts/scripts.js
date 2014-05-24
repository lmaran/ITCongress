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
///#source 1 1 /Scripts/custom-version/angular-cookies.js
/**
 * @license AngularJS v1.3.0-beta.5
 * (c) 2010-2014 Google, Inc. http://angularjs.org
 * License: MIT
 */
(function (window, angular, undefined) {
    'use strict';

    /**
     * @ngdoc module
     * @name ngCookies
     * @description
     *
     * # ngCookies
     *
     * The `ngCookies` module provides a convenient wrapper for reading and writing browser cookies.
     *
     *
     * <div doc-module-components="ngCookies"></div>
     *
     * See {@link ngCookies.$cookies `$cookies`} and
     * {@link ngCookies.$cookieStore `$cookieStore`} for usage.
     */


    angular.module('ngCookies', ['ng']).
      /**
       * @ngdoc service
       * @name $cookies
       *
       * @description
       * Provides read/write access to browser's cookies.
       *
       * Only a simple Object is exposed and by adding or removing properties to/from this object, new
       * cookies are created/deleted at the end of current $eval.
       * The object's properties can only be strings.
       *
       * Requires the {@link ngCookies `ngCookies`} module to be installed.
       *
       * @example
       <example>
         <file name="index.html">
           <script>
             function ExampleController($cookies) {
               // Retrieving a cookie
               var favoriteCookie = $cookies.myFavorite;
               // Setting a cookie
               $cookies.myFavorite = 'oatmeal';
             }
           </script>
         </file>
       </example>
       */
       factory('$cookies', ['$rootScope', '$browser', function ($rootScope, $browser) {
           var cookies = {},
               lastCookies = {},
               lastBrowserCookies,
               runEval = false,
               copy = angular.copy,
               isUndefined = angular.isUndefined;

           //creates a poller fn that copies all cookies from the $browser to service & inits the service
           $browser.addPollFn(function () {
               var currentCookies = $browser.cookies();
               if (lastBrowserCookies != currentCookies) { //relies on browser.cookies() impl
                   lastBrowserCookies = currentCookies;
                   copy(currentCookies, lastCookies);
                   copy(currentCookies, cookies);
                   if (runEval) $rootScope.$apply();
               }
           })();

           runEval = true;

           //at the end of each eval, push cookies
           //TODO: this should happen before the "delayed" watches fire, because if some cookies are not
           //      strings or browser refuses to store some cookies, we update the model in the push fn.
           $rootScope.$watch(push);

           return cookies;


           /**
            * Pushes all the cookies from the service to the browser and verifies if all cookies were
            * stored.
            */
           function push() {
               var name,
                   value,
                   browserCookies,
                   updated;

               //delete any cookies deleted in $cookies
               for (name in lastCookies) {
                   if (isUndefined(cookies[name])) {
                       $browser.cookies(name, undefined);
                   }
               }

               //update all cookies updated in $cookies
               for (name in cookies) {
                   value = cookies[name];
                   if (!angular.isString(value)) {
                       value = '' + value;
                       cookies[name] = value;
                   }
                   if (value !== lastCookies[name]) {
                       $browser.cookies(name, value);
                       updated = true;
                   }
               }

               //verify what was actually stored
               if (updated) {
                   updated = false;
                   browserCookies = $browser.cookies();

                   for (name in cookies) {
                       if (cookies[name] !== browserCookies[name]) {
                           //delete or reset all cookies that the browser dropped from $cookies
                           if (isUndefined(browserCookies[name])) {
                               delete cookies[name];
                           } else {
                               cookies[name] = browserCookies[name];
                           }
                           updated = true;
                       }
                   }
               }
           }
       }]).


      /**
       * @ngdoc service
       * @name $cookieStore
       * @requires $cookies
       *
       * @description
       * Provides a key-value (string-object) storage, that is backed by session cookies.
       * Objects put or retrieved from this storage are automatically serialized or
       * deserialized by angular's toJson/fromJson.
       *
       * Requires the {@link ngCookies `ngCookies`} module to be installed.
       *
       * @example
       */
       factory('$cookieStore', ['$cookies', function ($cookies) {

           return {
               /**
                * @ngdoc method
                * @name $cookieStore#get
                *
                * @description
                * Returns the value of given cookie key
                *
                * @param {string} key Id to use for lookup.
                * @returns {Object} Deserialized cookie value.
                */
               get: function (key) {
                   var value = $cookies[key];
                   return value ? angular.fromJson(value) : value;
               },

               /**
                * @ngdoc method
                * @name $cookieStore#put
                *
                * @description
                * Sets a value for given cookie key
                *
                * @param {string} key Id for the `value`.
                * @param {Object} value Value to be stored.
                */
               put: function (key, value) {
                   $cookies[key] = angular.toJson(value);
               },

               /**
                * @ngdoc method
                * @name $cookieStore#remove
                *
                * @description
                * Remove given cookie
                *
                * @param {string} key Id of the key-value pair to delete.
                */
               remove: function (key) {
                   delete $cookies[key];
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

