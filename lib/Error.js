'use strict';

var debug = require('debug')('sslayer:Error');
var utils = require('./utils');

module.exports = _Error;

/**
 * Generic Error Class to wrap any errors returned by screenshotlayer-node
 */
function _Error() {
  this.populate.apply(this, arguments);
  var stack = (new Error(this.message)).stack;
  debug('stack ', stack);
}

// Extend Native Error
_Error.prototype = Object.create(Error.prototype);

_Error.prototype.type = 'GenericError';
_Error.prototype.populate = function (type, message) {
  this.Type = type;
  this.Message = message;
};

_Error.extend = utils.protoExtend;

/**
 * Create subclass of internal Error class
 * (Specifically for errors returned from sslayer's REST API)
 */
var sslayerError = _Error.sslayerError = _Error.extend({
  Type: 'sslayerError',
  Message: '',
  populate: function (raw) {
    this.Type = this.type || 'unknown';
    this.Code = raw.Code || 'GenericError';
    this.Message = raw.message || raw.error || 'unknown';
    this.StatusCode = raw.StatusCode || 'unknown';
  }
});

/**
 * Helper factory which takes raw sslayer errors and outputs wrapping instances
 */
sslayerError.generate = function () {
  return new _Error('Generic', 'Unknown Error');
};

// Specific sslayer Error types:
_Error.sslayerInvalidRequestError = sslayerError.extend({ type: 'sslayerInvalidRequestError' });
_Error.sslayerAPIError = sslayerError.extend({ type: 'sslayerAPIError' });
_Error.sslayerPermissionError = sslayerError.extend({ type: 'sslayerPermissionError' });
_Error.sslayerRateLimitError = sslayerError.extend({ type: 'sslayerRateLimitError' });
_Error.sslayerConnectionError = sslayerError.extend({ type: 'sslayerConnectionError' });
