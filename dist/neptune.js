(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.neptune = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
 * VerbalExpressions JavaScript Library v0.1.2
 * https://github.com/VerbalExpressions/JSVerbalExpressions
 *
 *
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2013-07-19
 *
 */

// Define the collection class.
(function(){

	var root = this;

    // I am the constructor function.
    function VerbalExpression(){
        var verbalExpression = new RegExp();

        // Add all the class methods
        VerbalExpression.injectClassMethods( verbalExpression );

        // Return the new object.
        return verbalExpression;
    }


    // Define the static methods.
    VerbalExpression.injectClassMethods = function( verbalExpression ){

        // Loop over all the prototype methods
        for (var method in VerbalExpression.prototype){

            // Make sure this is a local method.
            if (VerbalExpression.prototype.hasOwnProperty( method )){

                // Add the method
                verbalExpression[ method ] = VerbalExpression.prototype[ method ];

            }

        }

        return verbalExpression;

    };

    // Define the class methods.
    VerbalExpression.prototype = {

        // Variables to hold the whole
        // expression construction in order
        _prefixes : "",
        _source : "",
        _suffixes : "",
        _modifiers : "gm", // default to global multiline matching


        // Sanitation function for adding
        // anything safely to the expression
        sanitize : function( value ) {
            if(value.source) return value.source;
            if(typeof value === "number") return value;
            return value.replace(/[^\w]/g, function(character) { return "\\" + character; });
        },

        // Function to add stuff to the
        // expression. Also compiles the
        // new expression so it's ready to
        // be used.
        add: function( value ) {
            this._source += value || "";
            this.compile(this._prefixes + this._source + this._suffixes, this._modifiers);
            return this;
        },

        // Start and end of line functions
        startOfLine: function( enable ) {
            enable = ( enable !== false );
            this._prefixes = enable ? "^" : "";
            this.add( "" );
            return this;
        },

        endOfLine : function( enable ) {
            enable = ( enable !== false );
            this._suffixes = enable ? "$" : "";
            this.add( "" );
            return this;
        },

        // We try to keep the syntax as
        // user-friendly as possible.
        // So we can use the "normal"
        // behaviour to split the "sentences"
        // naturally.
        then : function( value ) {
            value = this.sanitize( value );
            this.add( "(?:" + value + ")" );
            return this;
        },

        // And because we can't start with
        // "then" function, we create an alias
        // to be used as the first function
        // of the chain.
        find : function( value ) {
            return this.then( value );
        },

        // Maybe is used to add values with ?
        maybe : function( value ) {
            value = this.sanitize(value);
            this.add( "(?:" + value + ")?" );
            return this;
        },

        // Any character any number of times
        anything : function() {
            this.add( "(?:.*)" );
            return this;
        },

        // Anything but these characters
        anythingBut : function( value ) {
            value = this.sanitize( value );
            this.add( "(?:[^" + value + "]*)" );
            return this;
        },

        // Any character at least one time
        something : function() {
            this.add( "(?:.+)" );
            return this;
        },

        // Any character at least one time except for these characters
        somethingBut : function( value ) {
            value = this.sanitize( value );
            this.add( "(?:[^" + value + "]+)" );
            return this;
        },

        // Shorthand function for the
        // String.replace function to
        // give more logical flow if, for
        // example, we're doing multiple
        // replacements on one regexp.
        replace : function( source, value ) {
            source = source.toString();
            return source.replace( this, value );
        },


        /// Add regular expression special ///
        /// characters                     ///

        // Line break
        lineBreak : function() {
            this.add( "(?:\\r\\n|\\r|\\n)" ); // Unix + windows CLRF
            return this;
        },
        // And a shorthand for html-minded
        br : function() {
            return this.lineBreak();
        },

        // Tab (duh?)
        tab : function() {
            this.add( "\\t" );
            return this;
        },

        // Any alphanumeric
        word : function() {
            this.add( "\\w+" );
            return this;
        },

        // Any given character
        anyOf : function( value ) {
            value = this.sanitize(value);
            this.add( "["+ value +"]" );
            return this;
        },

        // Shorthand
        any : function( value ) {
            return this.anyOf( value );
        },

        // Usage: .range( from, to [, from, to ... ] )
        range : function() {
            var value = "[";

            for(var _to = 1; _to < arguments.length; _to += 2) {
                var from = this.sanitize( arguments[_to - 1] );
                var to = this.sanitize( arguments[_to] );

                value += from + "-" + to;
            }

            value += "]";

            this.add( value );
            return this;
        },


        /// Modifiers      ///

        // Modifier abstraction
        addModifier : function( modifier ) {
            if( this._modifiers.indexOf( modifier ) == -1 ) {
                this._modifiers += modifier;
            }
            this.add("");
            return this;
        },
        removeModifier : function( modifier ) {
            this._modifiers = this._modifiers.replace( modifier, "" );
            this.add("");
            return this;
        },

        // Case-insensitivity modifier
        withAnyCase : function( enable ) {

            if(enable !== false) this.addModifier( "i" );
            else this.removeModifier( "i" );

            this.add( "" );
            return this;

        },

        // Default behaviour is with "g" modifier,
        // so we can turn this another way around
        // than other modifiers
        stopAtFirst : function( enable ) {

            if(enable !== false) this.removeModifier( "g" );
            else this.addModifier( "g" );

            this.add( "" );
            return this;

        },

        // Multiline, also reversed
        searchOneLine : function( enable ) {

            if(enable !== false) this.removeModifier( "m" );
            else this.addModifier( "m" );

            this.add( "" );
            return this;

        },

        // Repeats the previous item
        // exactly n times or
        // between n and m times.
        repeatPrevious: function( ) {
            var value;
            if(arguments.length <= 1) {
                if(/\d+/.exec(arguments[0]) !== null) {
                    value = "{" + arguments[0] + "}";
                }
            } else {
                var values = [];
                for(var i=0; i< arguments.length; i++) {
                  if(/\d+/.exec(arguments[i]) !== null) {
                    values.push(arguments[i]);
                  }
                }

                value = "{" + values.join(",") + "}";
            }

            this.add( value || "" );
            return ( this );
        },



        /// Loops  ///

        multiple : function( value ) {
            // Use expression or string

            value = value.source ? value.source : this.sanitize(value);
            if (arguments.length === 1) {
                this.add("(?:" + value + ")*");
            }
            if (arguments.length > 1) {
                this.add("(?:" + value + ")");
                this.add("{" + arguments[1] + "}");
            }
            return this;
        },

        // Adds alternative expressions
        or : function( value ) {

            this._prefixes += "(?:";
            this._suffixes = ")" + this._suffixes;

            this.add( ")|(?:" );
            if(value) this.then( value );

            return this;
        },

        //starts a capturing group
        beginCapture : function() {
            //add the end of the capture group to the suffixes for now so compilation continues to work
            this._suffixes += ")";
            this.add( "(", false );

            return this;
        },

        //ends a capturing group
        endCapture : function() {
						//remove the last parentheses from the _suffixes and add to the regex itself
            this._suffixes = this._suffixes.substring(0, this._suffixes.length - 1 );
            this.add( ")", true );

            return this;
        },

        //convert to RegExp object
        toRegExp : function() {
            var arr = this.toString().match(/\/(.*)\/([a-z]+)?/);
            return new RegExp(arr[1],arr[2]);
        }

    };

    function createVerbalExpression() {
        return new VerbalExpression();
    }

    // support both browser and node.js
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = createVerbalExpression;
    }
    else if (typeof define === 'function' && define.amd) {
        define(function(){ return VerbalExpression; });
    }
    else {
        root.VerEx = createVerbalExpression;
    }

}).call();

},{}],2:[function(require,module,exports){
;(function() {

  'use strict';

  /**
     * Basic, right-associative composition function. Accepts two functions and returns the
     * composite function; this composite function represents the operation `var h = f(g(x))`,
     * where `f` is the first argument, `g` is the second argument, and `x` is whatever
     * argument(s) are passed to `h`.
     *
     * This function's main use is to build the more general `compose` function, which accepts
     * any number of functions.
     *
     * @private
     * @category Function
     * @param {Function} f A function.
     * @param {Function} g A function.
     * @return {Function} A new function that is the equivalent of `f(g(x))`.
     * @example
     *
     *      var double = function(x) { return x * 2; };
     *      var square = function(x) { return x * x; };
     *      var squareThenDouble = _compose(double, square);
     *
     *      squareThenDouble(5); //≅ double(square(5)) => 50
     */
    var _compose = function _compose(f, g) {
        return function () {
            return f.call(this, g.apply(this, arguments));
        };
    };

    /**
     * Private `concat` function to merge two array-like objects.
     *
     * @private
     * @param {Array|Arguments} [set1=[]] An array-like object.
     * @param {Array|Arguments} [set2=[]] An array-like object.
     * @return {Array} A new, merged array.
     * @example
     *
     *      _concat([4, 5, 6], [1, 2, 3]); //=> [4, 5, 6, 1, 2, 3]
     */
    var _concat = function _concat(set1, set2) {
        set1 = set1 || [];
        set2 = set2 || [];
        var idx;
        var len1 = set1.length;
        var len2 = set2.length;
        var result = [];
        idx = 0;
        while (idx < len1) {
            result[result.length] = set1[idx];
            idx += 1;
        }
        idx = 0;
        while (idx < len2) {
            result[result.length] = set2[idx];
            idx += 1;
        }
        return result;
    };

    var _containsWith = function _containsWith(pred, x, list) {
        var idx = 0, len = list.length;
        while (idx < len) {
            if (pred(x, list[idx])) {
                return true;
            }
            idx += 1;
        }
        return false;
    };

    /**
     * Optimized internal two-arity curry function.
     *
     * @private
     * @category Function
     * @param {Function} fn The function to curry.
     * @return {Function} The curried function.
     */
    var _curry1 = function _curry1(fn) {
        return function f1(a) {
            if (arguments.length === 0) {
                return f1;
            } else if (a != null && a['@@functional/placeholder'] === true) {
                return f1;
            } else {
                return fn(a);
            }
        };
    };

    /**
     * Optimized internal two-arity curry function.
     *
     * @private
     * @category Function
     * @param {Function} fn The function to curry.
     * @return {Function} The curried function.
     */
    var _curry2 = function _curry2(fn) {
        return function f2(a, b) {
            var n = arguments.length;
            if (n === 0) {
                return f2;
            } else if (n === 1 && a != null && a['@@functional/placeholder'] === true) {
                return f2;
            } else if (n === 1) {
                return _curry1(function (b) {
                    return fn(a, b);
                });
            } else if (n === 2 && a != null && a['@@functional/placeholder'] === true && b != null && b['@@functional/placeholder'] === true) {
                return f2;
            } else if (n === 2 && a != null && a['@@functional/placeholder'] === true) {
                return _curry1(function (a) {
                    return fn(a, b);
                });
            } else if (n === 2 && b != null && b['@@functional/placeholder'] === true) {
                return _curry1(function (b) {
                    return fn(a, b);
                });
            } else {
                return fn(a, b);
            }
        };
    };

    /**
     * Tests whether or not an object is an array.
     *
     * @private
     * @param {*} val The object to test.
     * @return {Boolean} `true` if `val` is an array, `false` otherwise.
     * @example
     *
     *      _isArray([]); //=> true
     *      _isArray(null); //=> false
     *      _isArray({}); //=> false
     */
    var _isArray = Array.isArray || function _isArray(val) {
        return val != null && val.length >= 0 && Object.prototype.toString.call(val) === '[object Array]';
    };

    var _isTransformer = function _isTransformer(obj) {
        return typeof obj['@@transducer/step'] === 'function';
    };

    var _map = function _map(fn, list) {
        var idx = 0, len = list.length, result = [];
        while (idx < len) {
            result[idx] = fn(list[idx]);
            idx += 1;
        }
        return result;
    };

    var _nth = function _nth(n, list) {
        return n < 0 ? list[list.length + n] : list[n];
    };

    /**
     * An optimized, private array `slice` implementation.
     *
     * @private
     * @param {Arguments|Array} args The array or arguments object to consider.
     * @param {Number} [from=0] The array index to slice from, inclusive.
     * @param {Number} [to=args.length] The array index to slice to, exclusive.
     * @return {Array} A new, sliced array.
     * @example
     *
     *      _slice([1, 2, 3, 4, 5], 1, 3); //=> [2, 3]
     *
     *      var firstThreeArgs = function(a, b, c, d) {
     *        return _slice(arguments, 0, 3);
     *      };
     *      firstThreeArgs(1, 2, 3, 4); //=> [1, 2, 3]
     */
    var _slice = function _slice(args, from, to) {
        switch (arguments.length) {
        case 1:
            return _slice(args, 0, args.length);
        case 2:
            return _slice(args, from, args.length);
        default:
            var list = [];
            var idx = 0;
            var len = Math.max(0, Math.min(args.length, to) - from);
            while (idx < len) {
                list[idx] = args[from + idx];
                idx += 1;
            }
            return list;
        }
    };

    var _xfBase = {
        init: function () {
            return this.xf['@@transducer/init']();
        },
        result: function (result) {
            return this.xf['@@transducer/result'](result);
        }
    };

    var _xmap = function () {
        function XMap(f, xf) {
            this.xf = xf;
            this.f = f;
        }
        XMap.prototype['@@transducer/init'] = _xfBase.init;
        XMap.prototype['@@transducer/result'] = _xfBase.result;
        XMap.prototype['@@transducer/step'] = function (result, input) {
            return this.xf['@@transducer/step'](result, this.f(input));
        };
        return _curry2(function _xmap(f, xf) {
            return new XMap(f, xf);
        });
    }();

    /**
     * Wraps a function of any arity (including nullary) in a function that accepts exactly `n`
     * parameters. Unlike `nAry`, which passes only `n` arguments to the wrapped function,
     * functions produced by `arity` will pass all provided arguments to the wrapped function.
     *
     * @func
     * @memberOf R
     * @sig (Number, (* -> *)) -> (* -> *)
     * @category Function
     * @param {Number} n The desired arity of the returned function.
     * @param {Function} fn The function to wrap.
     * @return {Function} A new function wrapping `fn`. The new function is
     *         guaranteed to be of arity `n`.
     * @deprecated since v0.15.0
     * @example
     *
     *      var takesTwoArgs = function(a, b) {
     *        return [a, b];
     *      };
     *      takesTwoArgs.length; //=> 2
     *      takesTwoArgs(1, 2); //=> [1, 2]
     *
     *      var takesOneArg = R.arity(1, takesTwoArgs);
     *      takesOneArg.length; //=> 1
     *      // All arguments are passed through to the wrapped function
     *      takesOneArg(1, 2); //=> [1, 2]
     */
    // jshint unused:vars
    var arity = _curry2(function (n, fn) {
        // jshint unused:vars
        switch (n) {
        case 0:
            return function () {
                return fn.apply(this, arguments);
            };
        case 1:
            return function (a0) {
                return fn.apply(this, arguments);
            };
        case 2:
            return function (a0, a1) {
                return fn.apply(this, arguments);
            };
        case 3:
            return function (a0, a1, a2) {
                return fn.apply(this, arguments);
            };
        case 4:
            return function (a0, a1, a2, a3) {
                return fn.apply(this, arguments);
            };
        case 5:
            return function (a0, a1, a2, a3, a4) {
                return fn.apply(this, arguments);
            };
        case 6:
            return function (a0, a1, a2, a3, a4, a5) {
                return fn.apply(this, arguments);
            };
        case 7:
            return function (a0, a1, a2, a3, a4, a5, a6) {
                return fn.apply(this, arguments);
            };
        case 8:
            return function (a0, a1, a2, a3, a4, a5, a6, a7) {
                return fn.apply(this, arguments);
            };
        case 9:
            return function (a0, a1, a2, a3, a4, a5, a6, a7, a8) {
                return fn.apply(this, arguments);
            };
        case 10:
            return function (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
                return fn.apply(this, arguments);
            };
        default:
            throw new Error('First argument to arity must be a non-negative integer no greater than ten');
        }
    });

    /**
     * Returns true if the first parameter is less than or equal to the second.
     *
     * @func
     * @memberOf R
     * @category Math
     * @sig Number -> Number -> Boolean
     * @param {Number} a
     * @param {Number} b
     * @return {Boolean} a <= b
     * @example
     *
     *      R.lte(2, 6); //=> true
     *      R.lte(2, 0); //=> false
     *      R.lte(2, 2); //=> true
     *      R.lte(R.__, 2)(1); //=> true
     *      R.lte(2)(10); //=> true
     */
    var lte = _curry2(function lte(a, b) {
        return a <= b;
    });

    /**
     * Returns the nth element in a list.
     * If n is negative the element at index length + n is returned.
     *
     * @func
     * @memberOf R
     * @category List
     * @sig Number -> [a] -> a
     * @param {Number} idx
     * @param {Array} list
     * @return {*} The nth element of the list.
     * @example
     *
     *      var list = ['foo', 'bar', 'baz', 'quux'];
     *      R.nth(1, list); //=> 'bar'
     *      R.nth(-1, list); //=> 'quux'
     *      R.nth(-99, list); //=> undefined
     */
    var nth = _curry2(_nth);

    /**
     * Returns a new list containing only one copy of each element in the original list, based
     * upon the value returned by applying the supplied predicate to two list elements. Prefers
     * the first item if two items compare equal based on the predicate.
     *
     * @func
     * @memberOf R
     * @category List
     * @sig (a, a -> Boolean) -> [a] -> [a]
     * @param {Function} pred A predicate used to test whether two items are equal.
     * @param {Array} list The array to consider.
     * @return {Array} The list of unique items.
     * @example
     *
     *      var strEq = function(a, b) { return String(a) === String(b); };
     *      R.uniqWith(strEq)([1, '1', 2, 1]); //=> [1, 2]
     *      R.uniqWith(strEq)([{}, {}]);       //=> [{}]
     *      R.uniqWith(strEq)([1, '1', 1]);    //=> [1]
     *      R.uniqWith(strEq)(['1', 1, 1]);    //=> ['1']
     */
    var uniqWith = _curry2(function uniqWith(pred, list) {
        var idx = 0, len = list.length;
        var result = [], item;
        while (idx < len) {
            item = list[idx];
            if (!_containsWith(pred, item, result)) {
                result[result.length] = item;
            }
            idx += 1;
        }
        return result;
    });

    /**
     * Similar to hasMethod, this checks whether a function has a [methodname]
     * function. If it isn't an array it will execute that function otherwise it will
     * default to the ramda implementation.
     *
     * @private
     * @param {Function} fn ramda implemtation
     * @param {String} methodname property to check for a custom implementation
     * @return {Object} Whatever the return value of the method is.
     */
    var _checkForMethod = function _checkForMethod(methodname, fn) {
        return function () {
            var length = arguments.length;
            if (length === 0) {
                return fn();
            }
            var obj = arguments[length - 1];
            return _isArray(obj) || typeof obj[methodname] !== 'function' ? fn.apply(this, arguments) : obj[methodname].apply(obj, _slice(arguments, 0, length - 1));
        };
    };

    /*
     * Returns a function that makes a multi-argument version of compose from
     * either _compose or _composeP.
     */
    var _createComposer = function _createComposer(composeFunction) {
        return function () {
            var fn = arguments[arguments.length - 1];
            var length = fn.length;
            var idx = arguments.length - 2;
            while (idx >= 0) {
                fn = composeFunction(arguments[idx], fn);
                idx -= 1;
            }
            return arity(length, fn);
        };
    };

    /**
     * Internal curryN function.
     *
     * @private
     * @category Function
     * @param {Number} length The arity of the curried function.
     * @return {array} An array of arguments received thus far.
     * @param {Function} fn The function to curry.
     */
    var _curryN = function _curryN(length, received, fn) {
        return function () {
            var combined = [];
            var argsIdx = 0;
            var left = length;
            var combinedIdx = 0;
            while (combinedIdx < received.length || argsIdx < arguments.length) {
                var result;
                if (combinedIdx < received.length && (received[combinedIdx] == null || received[combinedIdx]['@@functional/placeholder'] !== true || argsIdx >= arguments.length)) {
                    result = received[combinedIdx];
                } else {
                    result = arguments[argsIdx];
                    argsIdx += 1;
                }
                combined[combinedIdx] = result;
                if (result == null || result['@@functional/placeholder'] !== true) {
                    left -= 1;
                }
                combinedIdx += 1;
            }
            return left <= 0 ? fn.apply(this, combined) : arity(left, _curryN(length, combined, fn));
        };
    };

    /**
     * Returns a function that dispatches with different strategies based on the
     * object in list position (last argument). If it is an array, executes [fn].
     * Otherwise, if it has a  function with [methodname], it will execute that
     * function (functor case). Otherwise, if it is a transformer, uses transducer
     * [xf] to return a new transformer (transducer case). Otherwise, it will
     * default to executing [fn].
     *
     * @private
     * @param {String} methodname property to check for a custom implementation
     * @param {Function} xf transducer to initialize if object is transformer
     * @param {Function} fn default ramda implementation
     * @return {Function} A function that dispatches on object in list position
     */
    var _dispatchable = function _dispatchable(methodname, xf, fn) {
        return function () {
            var length = arguments.length;
            if (length === 0) {
                return fn();
            }
            var obj = arguments[length - 1];
            if (!_isArray(obj)) {
                var args = _slice(arguments, 0, length - 1);
                if (typeof obj[methodname] === 'function') {
                    return obj[methodname].apply(obj, args);
                }
                if (_isTransformer(obj)) {
                    var transducer = xf.apply(null, args);
                    return transducer(obj);
                }
            }
            return fn.apply(this, arguments);
        };
    };

    /**
     * Private function that determines whether or not a provided object has a given method.
     * Does not ignore methods stored on the object's prototype chain. Used for dynamically
     * dispatching Ramda methods to non-Array objects.
     *
     * @private
     * @param {String} methodName The name of the method to check for.
     * @param {Object} obj The object to test.
     * @return {Boolean} `true` has a given method, `false` otherwise.
     * @example
     *
     *      var person = { name: 'John' };
     *      person.shout = function() { alert(this.name); };
     *
     *      _hasMethod('shout', person); //=> true
     *      _hasMethod('foo', person); //=> false
     */
    var _hasMethod = function _hasMethod(methodName, obj) {
        return obj != null && !_isArray(obj) && typeof obj[methodName] === 'function';
    };

    /**
     * Creates a new function that runs each of the functions supplied as parameters in turn,
     * passing the return value of each function invocation to the next function invocation,
     * beginning with whatever arguments were passed to the initial invocation.
     *
     * Note that `compose` is a right-associative function, which means the functions provided
     * will be invoked in order from right to left. In the example `var h = compose(f, g)`,
     * the function `h` is equivalent to `f( g(x) )`, where `x` represents the arguments
     * originally passed to `h`.
     *
     * @func
     * @memberOf R
     * @category Function
     * @sig ((y -> z), (x -> y), ..., (b -> c), (a... -> b)) -> (a... -> z)
     * @param {...Function} functions A variable number of functions.
     * @return {Function} A new function which represents the result of calling each of the
     *         input `functions`, passing the result of each function call to the next, from
     *         right to left.
     * @example
     *
     *      var triple = function(x) { return x * 3; };
     *      var double = function(x) { return x * 2; };
     *      var square = function(x) { return x * x; };
     *      var squareThenDoubleThenTriple = R.compose(triple, double, square);
     *
     *      //≅ triple(double(square(5)))
     *      squareThenDoubleThenTriple(5); //=> 150
     */
    var compose = _createComposer(_compose);

    /**
     * Returns a new list consisting of the elements of the first list followed by the elements
     * of the second.
     *
     * @func
     * @memberOf R
     * @category List
     * @sig [a] -> [a] -> [a]
     * @param {Array} list1 The first list to merge.
     * @param {Array} list2 The second set to merge.
     * @return {Array} A new array consisting of the contents of `list1` followed by the
     *         contents of `list2`. If, instead of an Array for `list1`, you pass an
     *         object with a `concat` method on it, `concat` will call `list1.concat`
     *         and pass it the value of `list2`.
     *
     * @example
     *
     *      R.concat([], []); //=> []
     *      R.concat([4, 5, 6], [1, 2, 3]); //=> [4, 5, 6, 1, 2, 3]
     *      R.concat('ABC', 'DEF'); // 'ABCDEF'
     */
    var concat = _curry2(function (set1, set2) {
        if (_isArray(set2)) {
            return _concat(set1, set2);
        } else if (_hasMethod('concat', set1)) {
            return set1.concat(set2);
        } else {
            throw new TypeError('can\'t concat ' + typeof set1);
        }
    });

    /**
     * Returns a curried equivalent of the provided function, with the
     * specified arity. The curried function has two unusual capabilities.
     * First, its arguments needn't be provided one at a time. If `g` is
     * `R.curryN(3, f)`, the following are equivalent:
     *
     *   - `g(1)(2)(3)`
     *   - `g(1)(2, 3)`
     *   - `g(1, 2)(3)`
     *   - `g(1, 2, 3)`
     *
     * Secondly, the special placeholder value `R.__` may be used to specify
     * "gaps", allowing partial application of any combination of arguments,
     * regardless of their positions. If `g` is as above and `_` is `R.__`,
     * the following are equivalent:
     *
     *   - `g(1, 2, 3)`
     *   - `g(_, 2, 3)(1)`
     *   - `g(_, _, 3)(1)(2)`
     *   - `g(_, _, 3)(1, 2)`
     *   - `g(_, 2)(1)(3)`
     *   - `g(_, 2)(1, 3)`
     *   - `g(_, 2)(_, 3)(1)`
     *
     * @func
     * @memberOf R
     * @category Function
     * @sig Number -> (* -> a) -> (* -> a)
     * @param {Number} length The arity for the returned function.
     * @param {Function} fn The function to curry.
     * @return {Function} A new, curried function.
     * @see R.curry
     * @example
     *
     *      var addFourNumbers = function() {
     *        return R.sum([].slice.call(arguments, 0, 4));
     *      };
     *
     *      var curriedAddFourNumbers = R.curryN(4, addFourNumbers);
     *      var f = curriedAddFourNumbers(1, 2);
     *      var g = f(3);
     *      g(4); //=> 10
     */
    var curryN = _curry2(function curryN(length, fn) {
        return arity(length, _curryN(length, [], fn));
    });

    /**
     * Returns the first element in a list.
     * In some libraries this function is named `first`.
     *
     * @func
     * @memberOf R
     * @category List
     * @sig [a] -> a
     * @param {Array} list The array to consider.
     * @return {*} The first element of the list, or `undefined` if the list is empty.
     * @example
     *
     *      R.head(['fi', 'fo', 'fum']); //=> 'fi'
     */
    var head = nth(0);

    /**
     * Turns a named method with a specified arity into a function
     * that can be called directly supplied with arguments and a target object.
     *
     * The returned function is curried and accepts `arity + 1` parameters where
     * the final parameter is the target object.
     *
     * @func
     * @memberOf R
     * @category Function
     * @sig Number -> String -> (a -> b -> ... -> n -> Object -> *)
     * @param {Number} arity Number of arguments the returned function should take
     *        before the target object.
     * @param {Function} method Name of the method to call.
     * @return {Function} A new curried function.
     * @example
     *
     *      var sliceFrom = R.invoker(1, 'slice');
     *      sliceFrom(6, 'abcdefghijklm'); //=> 'ghijklm'
     *      var sliceFrom6 = R.invoker(2, 'slice')(6);
     *      sliceFrom6(8, 'abcdefghijklm'); //=> 'gh'
     */
    var invoker = _curry2(function invoker(arity, method) {
        return curryN(arity + 1, function () {
            var target = arguments[arity];
            return target[method].apply(target, _slice(arguments, 0, arity));
        });
    });

    /**
     * Returns the last element from a list.
     *
     * @func
     * @memberOf R
     * @category List
     * @sig [a] -> a
     * @param {Array} list The array to consider.
     * @return {*} The last element of the list, or `undefined` if the list is empty.
     * @example
     *
     *      R.last(['fi', 'fo', 'fum']); //=> 'fum'
     */
    var last = nth(-1);

    /**
     * Returns a new list, constructed by applying the supplied function to every element of the
     * supplied list.
     *
     * Note: `R.map` does not skip deleted or unassigned indices (sparse arrays), unlike the
     * native `Array.prototype.map` method. For more details on this behavior, see:
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map#Description
     *
     * Acts as a transducer if a transformer is given in list position.
     * @see R.transduce
     *
     * @func
     * @memberOf R
     * @category List
     * @sig (a -> b) -> [a] -> [b]
     * @param {Function} fn The function to be called on every element of the input `list`.
     * @param {Array} list The list to be iterated over.
     * @return {Array} The new list.
     * @example
     *
     *      var double = function(x) {
     *        return x * 2;
     *      };
     *
     *      R.map(double, [1, 2, 3]); //=> [2, 4, 6]
     */
    var map = _curry2(_dispatchable('map', _xmap, _map));

    /**
     * Splits a string into an array of strings based on the given
     * separator.
     *
     * @func
     * @memberOf R
     * @category String
     * @sig String -> String -> [String]
     * @param {String} sep The separator string.
     * @param {String} str The string to separate into an array.
     * @return {Array} The array of strings from `str` separated by `str`.
     * @example
     *
     *      var pathComponents = R.split('/');
     *      R.tail(pathComponents('/usr/local/bin/node')); //=> ['usr', 'local', 'bin', 'node']
     *
     *      R.split('.', 'a.b.c.xyz.d'); //=> ['a', 'b', 'c', 'xyz', 'd']
     */
    var split = invoker(1, 'split');

    /**
     * Returns all but the first element of a list. If the list provided has the `tail` method,
     * it will instead return `list.tail()`.
     *
     * @func
     * @memberOf R
     * @category List
     * @sig [a] -> [a]
     * @param {Array} list The array to consider.
     * @return {Array} A new array containing all but the first element of the input list, or an
     *         empty list if the input list is empty.
     * @example
     *
     *      R.tail(['fi', 'fo', 'fum']); //=> ['fo', 'fum']
     */
    var tail = _checkForMethod('tail', function (list) {
        return _slice(list, 1);
    });

    /**
     * Returns a curried equivalent of the provided function. The curried
     * function has two unusual capabilities. First, its arguments needn't
     * be provided one at a time. If `f` is a ternary function and `g` is
     * `R.curry(f)`, the following are equivalent:
     *
     *   - `g(1)(2)(3)`
     *   - `g(1)(2, 3)`
     *   - `g(1, 2)(3)`
     *   - `g(1, 2, 3)`
     *
     * Secondly, the special placeholder value `R.__` may be used to specify
     * "gaps", allowing partial application of any combination of arguments,
     * regardless of their positions. If `g` is as above and `_` is `R.__`,
     * the following are equivalent:
     *
     *   - `g(1, 2, 3)`
     *   - `g(_, 2, 3)(1)`
     *   - `g(_, _, 3)(1)(2)`
     *   - `g(_, _, 3)(1, 2)`
     *   - `g(_, 2)(1)(3)`
     *   - `g(_, 2)(1, 3)`
     *   - `g(_, 2)(_, 3)(1)`
     *
     * @func
     * @memberOf R
     * @category Function
     * @sig (* -> a) -> (* -> a)
     * @param {Function} fn The function to curry.
     * @return {Function} A new, curried function.
     * @see R.curryN
     * @example
     *
     *      var addFourNumbers = function(a, b, c, d) {
     *        return a + b + c + d;
     *      };
     *
     *      var curriedAddFourNumbers = R.curry(addFourNumbers);
     *      var f = curriedAddFourNumbers(1, 2);
     *      var g = f(3);
     *      g(4); //=> 10
     */
    var curry = _curry1(function curry(fn) {
        return curryN(fn.length, fn);
    });

    var R = {
        compose: compose,
        concat: concat,
        curry: curry,
        head: head,
        last: last,
        lte: lte,
        map: map,
        split: split,
        tail: tail,
        uniqWith: uniqWith
    };

  /* TEST_ENTRY_POINT */

  if (typeof exports === 'object') {
    module.exports = R;
  } else if (typeof define === 'function' && define.amd) {
    define(function() { return R; });
  } else {
    this.R = R;
  }

}.call(this));

},{}],3:[function(require,module,exports){
var VerEx  = require('verbal-expressions')
  , R      = require('../ramda.custom')

var buildBase = function (data) {
  if(!Array.isArray(data)) throw new Error("Base should be an Array.")

  return data.map(function (item, idx) {
    if(item === null || item === undefined) return
    var typeofItem = typeof item

    if(Array.isArray(item))    return buildBase(item)
    if(typeofItem == 'string') return normalize(item)
    if(typeofItem == 'object') return normalizeObject(item)
  })
  .filter(onlyValids)
}

var normalizeObject = function (data) {
  return Object.keys(data)
          .reduce(function (object, key) {
            var item = data[key]
            if(item === null || item === undefined) return object
            var typeofItem = typeof item
            var prop = null

            if(typeofItem == 'string') prop = normalize(item)
            if(Array.isArray(item))    prop = buildBase(item)
            if(typeofItem == 'object' && !Array.isArray(item)) prop = normalizeObject(item)

            if(onlyValids(prop)) object[key] = prop
            return object
          }, {})
}

var buildEngine = function (base) {
  return {
      search: search(base)
    , base: base
  }
}

var search = R.curry(function (base, query) {
  if(normalize(query).length == 0) return base // to avoid useless processing
  
  query = query.toLowerCase()

  var term       = VerEx().find(normalize(query))
  var markTerm   = replace(normalize(query))
  var markAndHighlight = R.compose(highlight, markTerm)

  return searchWithinArray(base, term, markAndHighlight)
})

var searchWithinArray = function (base, term, markAndHighlight) {
  return base.map(function (item) {
    var typeofItem = typeof item

    if(typeofItem == 'string' && test(term, item)) return markAndHighlight(item) 
    if(Array.isArray(item)) return searchWithinArray(item, term, markAndHighlight)
    if(typeofItem == 'object' && !Array.isArray(item)) return searchWithinObject(item, term, markAndHighlight)
  })
  .filter(onlyValids)
}

var searchWithinObject = function (base, term, markAndHighlight) {
  return Object.keys(base).reduce(function (object, key) {
    var item = base[key]
    var typeofItem = typeof item
    var prop = null

    if(typeofItem == 'string' && test(term, item)) prop = markAndHighlight(item) 
    if(Array.isArray(item)) prop = searchWithinArray(item, term, markAndHighlight)
    if(typeofItem == 'object' && !Array.isArray(item)) prop = searchWithinObject(item, term, markAndHighlight)

    if(onlyValids(prop)) object[key] = prop
    return object
  }, {})
}

var replace = R.curry(function (to, phrase) {
  return (R.compose(mark(phrase), markRanges(phrase))(to))
    .reduce(function (newPhrase, mark) {
      return VerEx().find(mark.term).replace(newPhrase, mark.marked)
    }, phrase)
})

var mark = R.curry(function (phrase, ranges) {
  return ranges.map(function (range) {
    var term = phrase.slice(R.head(range), R.last(range))
    return {
        marked: '<' + term + '>'
      , term: term
    }
  })
})

var markRanges = R.curry(function (phrase, to) {
  var inits = [].reduce.call(phrase, function (ranges, letter, idx) {
    return ranges.concat(phrase.toLowerCase().indexOf(to, idx)) 
  }, [])
  .filter(R.lte(0))

  return R.compose(R.map(genRange(to.length)), R.uniqWith(NumberEq)) (inits)
})

var genRange = R.curry(function (last, init) {
  return [init, init + last]
})

var NumberEq = function (a, b) {
  return Number(a) == Number(b)
}

var normalize = function (phrase) {
  return phrase.trim()
}

var onlyValids = function (item) {
  return item !== null && (typeof item != 'object' || Object.keys(item).length > 0)
}

var test = function (term, value) {
  value = value.toLowerCase()
  return term.test(value) || term.test(value)
}

var highlight = function(word) {
  var head = R.split('<', word)
  var tail = R.tail(head)
    .map(R.split('>'))
    .reduce(R.concat, [])

  return word.localeCompare(R.head(head)) === 0 ?
      [{
          chunk     : R.head(head)
        , highlight : false
      }]
    : R.concat([R.head(head)], tail).map(function (chunk, index){
        return {
            content     : chunk
          , highlight : index % 2 !== 0 
        }
      })
      .filter(function (chunk) {
        return chunk.content.length > 0
      })
}

module.exports = function (data) {
  return R.compose(buildEngine, buildBase)(data)
}
},{"../ramda.custom":2,"verbal-expressions":1}]},{},[3])(3)
});