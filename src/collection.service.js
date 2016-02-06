(function () {
    'use strict';

    /**
     * @ngdoc service
     * @name Collection utils
     * @description
     * Useful collection methods
     */
    angular
        .module('tiborbotos.lib')
        .service('Collection', ['Option', function (Option) {

            return {

                /**
                 * Looks through each value in the list, returning the first one that passes a truth test.
                 * Stops at the first match.
                 * @param {Array} list
                 * @param {Function} predicate predicate function
                 * @param {Boolean|} [reverseArg] optional flag if you would like to find the last element of the list
                 * @returns {Option} Option.None or Option.Some of the found value
                 */
                find: function (list, predicate, reverseArg) {
                    if (!angular.isArray(list) || (angular.isArray(list) && list.length === 0)) {
                        return Option.None;
                    }
                    var reverse = angular.isDefined(reverseArg) ? reverseArg : false,
                        i = reverse ? (list.length - 1) : 0,
                        predicateResult;

                    do {
                        predicateResult = predicate(list[i]);
                        if (predicateResult === true) {
                            return Option.Some(list[i]);
                        } else if (predicateResult !== false && angular.isDefined(predicateResult)) {
                            return Option.Some(predicateResult);
                        }
                    } while ((reverse && i-- > 0) || (!reverse && i++ < list.length - 1));
                    return Option.None;
                },

                /**
                 * Looks through each value in the list, returning an array of all the values that pass a truth test (predicate).
                 * @param {Array} list
                 * @param {Function} predicate predicate function
                 * @returns {Array}
                 */
                filter: function (list, predicate) {
                    if (!angular.isArray(list) || (angular.isArray(list) && list.length === 0)) {
                        return [];
                    }

                    var res = [],
                        i = 0,
                        predicateResult;

                    do {
                        predicateResult = predicate(list[i]);
                        if (predicateResult === true) {
                            res.push(list[i]);
                        } else if (predicateResult !== false && angular.isDefined(predicateResult)) {
                            res.push(list[i]);
                        }
                    } while (++i < list.length);
                    return res;
                },

                /**
                 * Looks through each value in the list, returning an array of all the items where the item's field is equal to value
                 * @param list {Array} list
                 * @param {String} field checked field in list item
                 * @param {String|Number|Boolean} value target value we are looking for
                 * @returns {Array}
                 */
                filterByField: function (list, field, value) {
                    return this.filter(list, function (item) {
                        return item[field] === value;
                    });
                },

                /**
                 * Looks through each value in the list, and checking for every item's field checking if it's equal to
                 * value
                 * @param {Array} list
                 * @param {String} field checked field in list item
                 * @param {String|Number|Boolean} value target value we are looking for
                 * @param {Boolean} [reverse] find the last element which matches the criteria
                 * @returns {Option}
                 */
                findByField: function (list, field, value, reverse) {
                    return this.find(list, function (item) {
                        return item && item.hasOwnProperty(field) && item[field] === value;
                    }, reverse);
                },

                /**
                 * Returns the first element of a list wrapped in an option
                 * @param {Array} list
                 * @returns {Option}
                 */
                first: function (list) {
                    if (angular.isDefined(list) && list.length > 0) {
                        return Option.Some(list[0]);
                    }
                    return Option.None;
                },

                /**
                 * Returns the last element of a list wrapped in an option
                 * @param {Array} list
                 * @returns {Option}
                 */
                last: function (list) {
                    if (angular.isDefined(list) && list.length > 0) {
                        return Option.Some(list[list.length - 1]);
                    }
                    return Option.None;
                }
            };
        }]);
})();
