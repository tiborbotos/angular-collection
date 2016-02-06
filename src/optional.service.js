(function () {
    'use strict';

    /**
     * @ngdoc service
     * @name Option class
     * @description
     * Option pattern angular implementation
     */
    angular
        .module('tiborbotos.lib')
        .service('Option', function () {

            /**
             * Creates an optional value, use Some() or None if you can instead
             * @param {Object} [value] could be undefined
             * @constructor {Option}
             * @private
             */
            var Option = function (value) {
                    this.value = value;
                },
                /**
                 * Empty optional
                 * @type {Option}
                 */
                None = new Option(),
                /**
                 * Constructor for a defined option
                 * @param {Object} [value]
                 * @returns {Option}
                 * @constructor
                 */
                Some = function (value) {
                    if (typeof value !== 'undefined') {
                        return new Option(value);
                    }
                    return None;
                };

            Option.prototype.toString = function () {
                if (this.isDefined()) {
                    return 'Some(' + this.value + ')';
                }
                return 'None';
            };

            /**
             * @returns {Object|*|string}
             */
            Option.prototype.get = function () {
                return this.value;
            };

            /**
             * @param {Object|Function} orElse
             * @returns {Object}
             */
            Option.prototype.getOrElse = function (orElse) {
                if (this.isDefined()) {
                    return this.value;
                } else {
                    if (typeof orElse === 'function') {
                        return orElse();
                    }
                    return orElse;
                }
            };

            /**
             * Maps the value with a function to another Optional if the value is defined
             * @param {Function} fn mapper function
             * @returns {Option} always returns an optional
             */
            Option.prototype.map = function (fn) {
                if (this.isDefined()) {
                    return new Some(fn(this.value));
                }
                return None;
            };

            /**
             * Flatmaps the value with a function if the value is defined
             * @param {Function} fn mapper function
             * @returns {Object} always returns the object
             */
            Option.prototype.flatMap = function (fn) {
                if (this.isDefined()) {
                    return fn(this.value);
                }
                return undefined;
            };

            /**
             * Is the value defined or empty
             * @returns {boolean}
             */
            Option.prototype.isDefined = function () {
                return (this.value !== undefined);
            };

            return {
                Some: Some,
                None: None
            };
        });

})();
