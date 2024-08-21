'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var objectToUrlEncoded = function objectToUrlEncoded(element, key, list) {
  list = list || [];
  if ((typeof element === 'undefined' ? 'undefined' : _typeof(element)) === 'object') {
    for (var idx in element) {
      objectToUrlEncoded(element[idx], key ? key + '[' + idx + ']' : idx, list);
    }
  } else {
    list.push(key + '=' + encodeURIComponent(element));
  }
  return list.join('&');
};

module.exports = objectToUrlEncoded;

