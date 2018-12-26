/**
 * @ngdoc service
 * @name Optional (maybe) monad
 * @description
 * This class represents the Optional monad, which basically wraps a value, stating that a variable could be defined
 * with a value OR empty, for example null.
 * Usage:
 *
 * var person = Optional.None();
 * if (person.isDefined()) {
     *     console.log(person.get().name);
     * }
 *
 * or
 *
 * var personOpt = Optional.Some(person);
 * personOpt.getOrElse(throw new Error('Person is not existing!'));
 *
 *
 * @example
 * <example module="exampleModule">
 *     <file name="index.js">
 *          // old, procedural approach
 *         var sheet = null;
 *         for(var i = 0; i < list.length; i++) {
 *             if (list[i].id === 'sheet-01') {
 *                 sheet = list[i];
 *                 break;
 *             }
 *         }
 *         if (sheet !== null) {
 *             sheet.close();
 *         }
 *
 *         // better, functional approach
 *         var sheetOption = collection.findByField(list, 'id', 'sheet-01');
 *         sheetOption.flatMap(function(sheet) {
 *             sheet.close();
 *         });
 *
 *     </file>
 * </example>
 */
export let Optional = function () {

    /**
     * Creates an optional value, use Some() or None if you can instead
     * @param {Object} [value] could be undefined
     * @constructor {Option}
     * @private
     */
    let Option = function (value) {
            this.value = value;
        },
        /**
         * Empty optional
         * @type {Option}
         */
        None = new Option(),
        /**
         * Creates a defined option
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
     * @returns {Optional} always returns an optional
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
     * If the option is defined returns the matchFn branch, otherwise the emptyFn branch
     * @param {Function} matchFn function that gets the option value as parameter
     * @param {Function} emptyFn function without parameters
     * @returns {*} matchFn or emptyFn return value
     */
    Option.prototype.match = function (matchFn, emptyFn) {
        if (this.isDefined()) {
            return matchFn(this.value);
        }
        return emptyFn(undefined);
    };

    /**
     * Is the value defined or empty
     * @returns {boolean}
     */
    Option.prototype.isDefined = function () {
        return (this.value !== undefined);
    };

    /**
     * Returns the Optional wrapped in an array if defined or an empty array
     * @returns {Array}
     */
    Option.prototype.toArray = function () {
        if (this.isDefined()) {
            return [this.value];
        }
        return [];
    };

    return {
        Some: Some,
        None: None
    };
}; 
