export let collection = ['Optional', (Optional) => {

    /**
     * Returns the value of an object path
     * @param item {Object} Object with optional objects in it
     * @param fields {Array<String>} path of the required fields
     * @returns {*} Value of the field path (could be undefined)
     */
    let getNestedFieldValue = function (item, fields, value) {
        if (item !== undefined && item !== null) {
            if (fields.length > 1) {
                let innerObject = item[fields[0]];
                if (angular.isArray(innerObject)) {
                    let ind = 0;
                    do {
                        let result = getNestedFieldValue(innerObject[ind], fields.slice(1), value);
                        if (angular.isDefined(result)) {
                            return result;
                        }
                        ind++;
                    } while (ind < innerObject.length);
                    return undefined;
                } else {
                    return getNestedFieldValue(innerObject, fields.slice(1), value);
                }
            } else {
                return (item[fields[0]]) === value ? item : undefined;
            }
        } else {
            return undefined;
        }
    };

    let getFieldValueByObjectPath = function (obj, fields) {
        if (angular.isDefined(obj[fields[0]]) && angular.isDefined(fields[1])) {
            let key = fields.splice(0, 1);
            return getFieldValueByObjectPath(obj[key], fields);
        } else if (angular.isUndefined(fields[1])) {
            return obj[fields[0]];
        } else {
            return undefined;
        }
    };

    function isMapFalsyOrMapsValueFalsy(model, field) {
        return !model || !model[field];
    }

    function sortCompareFn(left, right, sortByField, defaultField) {
        if (isMapFalsyOrMapsValueFalsy(left, sortByField) && isMapFalsyOrMapsValueFalsy(right, sortByField)) {
            return 0;
        } else if (isMapFalsyOrMapsValueFalsy(right, sortByField)) {
            return left[sortByField] ? 1 : 0;
        } else if (isMapFalsyOrMapsValueFalsy(left, sortByField)) {
            return right[sortByField] ? -1 : 0;
        } else if (left[sortByField] === right[sortByField]) {
            if (defaultField) {
                return sortCompareFn(left, right, defaultField);
            } else {
                return 0;
            }
        }
        return (left[sortByField] > right[sortByField]) ? 1 : -1;
    }

    return {

        /**
         * Determines if a set is a subset of another set, based on a fieldname
         * Looks through every item in subset  and return true only if they can be found in baseSet with findByField based on field
         *
         * @example
         * // returns true
         * baseSet = [{a:1}, {a:2}, {a:3}]
         * subset = [{a:1}, {a:2}]
         * field = 'a'
         *
         * @example
         * // returns true
         * baseSet = [{a:1}, {a:2}, {a:3}]
         * subset = [{a:1}, {a:2}, {a:3}]
         * field = 'a'
         *
         * @example
         * // returns false
         * baseSet = [{a:1}, {a:2}, {a:3}]
         * subset = [{a:1}, {a:4}]
         * field = 'a'
         *
         * @example
         * // returns false
         * baseSet = [{a:1}, {a:2}]
         * subset = [{a:1}, {a:2}, {a:3}]
         * field = 'a'
         *
         *
         * @param {Array<object>} baseSet
         * @param {Array<object>} subset
         * @param {string} field field name by which the lists will be compared
         * @returns {boolean}
         */
        isSubsetByField: function (baseSet, subset, field) {
            if (!(angular.isArray(baseSet) && angular.isArray(subset)) || (baseSet.length < subset.length)) {
                return false;
            }
            let isSubset = true,
                i = 0;
            while (isSubset && angular.isDefined(subset[i])) {
                let fields = field.split('.'),
                    itemValue;
                if (fields.length === 1) {
                    itemValue = subset[i][field];
                } else {
                    itemValue = getFieldValueByObjectPath(subset[i], fields);
                }

                isSubset = isSubset && this.findByField(baseSet, field, itemValue).isDefined();
                i++;
            }

            return isSubset;
        },

        /**
         * Looks through each value in the list, returning the first one that passes a truth test.
         * Stops at the first match.
         * @param {Array} list
         * @param {Function} predicate predicate function
         * @param {Boolean|} [reverseArg] optional flag if you would like to find the last element of the list
         * @returns {Option} Optional.None or Optional.Some of the found value
         */
        find: function (list, predicate, reverseArg) {
            if (!angular.isArray(list) || (angular.isArray(list) && list.length === 0)) {
                return Optional.None;
            }
            let reverse = angular.isDefined(reverseArg) ? reverseArg : false,
                i = reverse ? (list.length - 1) : 0,
                predicateResult;

            do {
                predicateResult = predicate(list[i], i);
                if (predicateResult === true) {
                    return Optional.Some(list[i]);
                } else if (predicateResult !== false && angular.isDefined(predicateResult)) {
                    return Optional.Some(predicateResult);
                }
            } while ((reverse && i-- > 0) || (!reverse && i++ < list.length - 1));
            return Optional.None;
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

            let res = [],
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
         * Iterates trough an array and returns it without duplication;
         * @param {Array} list
         * @param {Function|string} uniqueBy factory function for returning the value of an item which is the unique by field
         * or the field name
         * @returns {Array}
         */
        unique: function (list, uniqueBy) {
            let i = 0,
                uniqueItemIds = [],
                uniqueList = [],
                uniqueByFn = angular.isFunction(uniqueBy) ? uniqueBy : function (item) {
                    if (uniqueBy) {
                        return item[uniqueBy];
                    } else {
                        return item;
                    }
                };

            if (!angular.isArray(list) || (angular.isArray(list) && list.length === 0)) {
                return uniqueList;
            }

            do {
                let uniqueItem = uniqueByFn(list[i]);

                if (uniqueItemIds.indexOf(uniqueItem) === -1) {
                    uniqueItemIds.push(uniqueItem);
                    uniqueList.push(list[i]);
                }
            } while (++i < list.length);

            return uniqueList;
        },

        /**
         * Looks through each value in the list, returning an array of all the items where the item's field is equal to value
         * @param list {Array} list
         * @param {String} field checked field in list item. It can be a fully specifed path in objects, like 'gene.mutant.id'
         * @param {String|Number|Boolean} value target value we are looking for
         * @returns {Array}
         */
        filterByField: function (list, field, value) {
            let fields = field.split('.');

            if (fields.length === 1) {
                return this.filter(list, function (item) {
                    return item[field] === value;
                });
            } else {
                return this.filter(list, function (item) {
                    return getNestedFieldValue(item, fields, value);
                });
            }
        },

        /**
         * Looks through each value in the list, and checking for every item's field checking if it's equal to
         * value
         * @param {Array} list
         * @param {String} field checked field in list item. It can be a fully specifed path in objects, like 'gene.mutant.id',
         * where fields could be additional arrays as well
         * @param {String|Number|Boolean} value target value we are looking for
         * @param {Boolean} [reverse] find the last element which matches the criteria
         * @returns {Option}
         */
        findByField: function (list, field, value, reverse) {
            let fields = field.split('.');

            if (fields.length === 1) {
                return this.find(list, function (item) {
                    return item && item.hasOwnProperty(field) && item[field] === value;
                }, reverse);
            } else {
                return this.find(list, function (item) {
                    return getNestedFieldValue(item, fields, value);
                }, reverse);
            }
        },

        /**
         * Returns the index of an object from a list by the field name and value
         * @param {Array} list
         * @param {String} key field name
         * @param {*} value field value
         * @param {Boolean} [reverse]
         * @returns {Optional} the index of the item in the list
         */
        findIndexByFieldAndValue: function (list, key, value, reverse) {
            return this.findByField(list, key, value, reverse).match(function (item) {
                return Optional.Some(list.indexOf(item));
            }, function () {
                return Optional.None;
            });
        },

        /**
         * Returns the first element of a list wrapped in an option
         * @param {Array} list
         * @returns {Option}
         */
        first: function (list) {
            if (angular.isDefined(list) && list.length > 0) {
                return Optional.Some(list[0]);
            }
            return Optional.None;
        },

        /**
         * Returns the last element of a list wrapped in an option
         * @param {Array} list
         * @returns {Option}
         */
        last: function (list) {
            if (angular.isDefined(list) && list.length > 0) {
                return Optional.Some(list[list.length - 1]);
            }
            return Optional.None;
        },

        /**
         * Converts a key value map into an array
         * @param obj {Object} any object which has at least one property
         * @returns {Array} array of the values
         */
        toArray: function (obj) {
            let result = [];
            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    result.push(obj[key]);
                }
            }
            return result;
        },

        /**
         * Pushes every item from source to destination
         * @param destination {Array}
         * @param source {Array}
         * @return {Array}
         */
        pushAll: function (destination, source) {
            if (angular.isDefined(source)) {
                source.forEach(function (item) {
                    destination.push(item);
                });
            }
            return destination;
        },

        /**
         * Sorts an object list by a field
         * @param list {Array<Object>} the input list, which will be transformed, it should be a mutable list
         * @param sortByField {string} the name of the field
         * @param [ascendingDirection] {boolean} is the sort direction ascending (default is true)
         * @param [defaultField] {string} if the sortByField values are matching, that will be a fallback field, like an id
         */
        sortByField: function (list, sortByField, ascendingDirection, defaultField) {
            let ord = (ascendingDirection === undefined || ascendingDirection === true) ? 1 : -1;
            list.sort((left, right) => {
                return sortCompareFn(left, right, sortByField, defaultField) * ord;
            });
            return list;
        },

        sortCompareFn: sortCompareFn
    };
}];
