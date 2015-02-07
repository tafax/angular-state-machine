'use strict';

/**
 * Merges two objects in one
 * by adding the properties
 * in the result.
 *
 * @param {Object} obj1
 * @param {Object} obj2
 * @returns {Object}
 */
Object.merge = function(obj1, obj2) {
    var result = {};

    for(var i in obj1) {
        result[i] = obj1[i];

        if((i in obj2) && (typeof obj1[i] === "object") && (i !== null))
            result[i] = Object.merge(obj1[i],obj2[i]);
    }

    for(var j in obj2) {
        if(j in result)
            continue;

        result[j] = obj2[j];
    }

    return result;
};

var FSM = angular.module('FSM', []);