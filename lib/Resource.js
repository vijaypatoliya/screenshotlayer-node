'use strict';

var debug = require('debug')('sslayer:Resource');
var http = require('http');
var https = require('https');
var path = require('path');
var xml2js = require('xml2js');
var qs = require('qs');

var utils = require('./utils');
var Error = require('./Error');

var hasOwn = {}.hasOwnProperty;

var RESPONSE_CONTENT_TYPE = ['text/xml', 'text/xml;charset=utf-8', 'application/xml'];
// Provide extension mechanism for sslayer Resource Sub-Classes
sslayerResource.extend = utils.protoExtend;

// Expose method-creator & prepared (basic) methods
sslayerResource.methods = require('./ScreenShotLayerHttpClient');

/**
 * Encapsulates request logic for a sslayer Resource
 */
function sslayerResource(sslayer, urlData) {
  this._sslayer = sslayer;
  this._urlData = urlData || {};

  this.basePath = utils.makeURLInterpolator(sslayer.getApiField('basePath'));
  this.path = utils.makeURLInterpolator(this.path);

  if (this.includeBasic) {
    this.includeBasic.forEach(function (methodName) {
      this[methodName] = sslayerResource.methods[methodName];
    }, this);
  }

  this.initialize.apply(this, arguments);
}

sslayerResource.prototype = {

  path: '',
  requestBody: {},
  requestParamsJSON: {},
  initialize: function () {
  },

  // Function to override the default data processor. This allows full control
  // over how a sslayerResource's request data will get converted into an HTTP
  // body. This is useful for non-standard HTTP requests. The function should
  // take method name, data, and headers as arguments.
  requestDataProcessor: null,

  // String that overrides the base API endpoint. If `overrideHost` is not null
  // then all requests for a particular resource will be sent to a base API
  // endpoint as defined by `overrideHost`.
  overrideHost: null,

  createFullPath: function (commandPath, urlData) {
    return path.join(
      this.basePath(urlData),
      this.path(urlData),
      typeof commandPath === 'function' ?
        commandPath(urlData) : commandPath
    ).replace(/\\/g, '/'); // ugly workaround for Windows
  },

  createUrlData: function () {
    var urlData = {};
    // Merge in baseData
    for (var i in this._urlData) {
      if (hasOwn.call(this._urlData, i)) {
        urlData[i] = this._urlData[i];
      }
    }
    return urlData;
  },

  wrapTimeout: function (promise, callback) {
    if (callback) {
      // Ensure callback is called outside of promise stack.
      return promise.then(function (res) {
        setTimeout(function () {
          callback(null, res);
        }, 0);
      }, function (err) {
        setTimeout(function () {
          callback(err, null);
        }, 0);
      });
    }

    return promise;
  },

  _timeoutHandler: function (timeout, req, callback) {
    var self = this;
    return function () {
      var timeoutErr = new Error('ETIMEDOUT');
      timeoutErr.code = 'ETIMEDOUT';

      req._isAborted = true;
      req.abort();

      callback.call(self, new Error.sslayerConnectionError({
        message: 'Request aborted due to timeout being reached (' + timeout + 'ms)'
      }), null);
    };
  },

  _responseHandler: function (requestParamsJSONCopy, req, callback) {
    var self = this;

    function processResponseType(res, responseString, callback) {
      //debug('res %o ', res);
      //debug('res.headers %o ', res.headers);
      if (RESPONSE_CONTENT_TYPE.indexOf(res.headers['content-type'].toLowerCase()) > -1) {
        debug('It is XML Response');
        var parser = new xml2js.Parser({
          explicitArray: false,
          ignoreAttrs: true
        });

        parser.parseString(responseString, function (err, response) {
          // debug('response after parsing JSON %o ', response);
          return callback(null, response);
        });
      } else {
        debug('It is NON-XML Response');
        try {
          var response = JSON.parse(responseString);
          return callback(null, response);
        } catch (exception) {
          debug('exception ', exception);
          return callback(callback, responseString);
        }

      }
    }

    return function (res) {
      debug('----------- Received Response -------------');
      var dbgResponseBuffer = [];
      var headers = res.headers;
      var statusCode = res.statusCode;
      // debug('res ', res);
      try {
        statusCode = parseInt(statusCode, 10);
      } catch (Exception) {
        debug('Failed to parse statusCode as statusCode not provided in the response. ', statusCode);
      }
      var charset = '';
      var content_type = '';
      var responseString = '';
      if (headers['content-type']) {
        content_type = headers['content-type'].toLowerCase();
      }

      if (content_type && content_type.indexOf('charset') > -1 && content_type.split(';')[0] && content_type.split(';')[1]) {
        if (content_type.split(';')[1] && content_type.split(';')[1].trim().match(/^((\b[^\s=]+)=(([^=]|\\=)+))*$/)[3]) {
          charset = content_type.split(';')[1].trim().match(/^((\b[^\s=]+)=(([^=]|\\=)+))*$/)[3];
        }
        content_type = content_type.split(';')[0].toLowerCase();
      }

      var ResponseHeaders = headers;
      res.on('data', function (chunk) {
        dbgResponseBuffer.push(chunk);
      });
      res.on('end', function () {
        var bufferString = Buffer.concat(dbgResponseBuffer);
        responseString = bufferString.toString('utf8');

        // debug('responseString ', responseString);
        debug('content_type ', content_type);
        debug('statusCode ', statusCode);

        try {
          if (!responseString && statusCode < 400) {
            Object.defineProperty({}, 'lastResponse', {
              enumerable: false,
              writable: false,
              value: res
            });
            return callback.call(self, null, {});
          }
          var contentTypeSplit = content_type.split('/');
          if (contentTypeSplit[0] === 'image') {
            var responseJson = {
              imageBufferData: JSON.stringify(bufferString),
              imageType: contentTypeSplit[1]
            };
            responseString = JSON.stringify(responseJson);
          }
          processResponseType(res, responseString, function (error, response) {
            if (response.errors) {
              debug('It is ErrorResponse');
              var errorResponse = response.errors;
              errorResponse.Headers = ResponseHeaders;
              errorResponse.StatusCode = statusCode || 'unknown';
              return callback.call(self, null, errorResponse);
            } else if (response.error || response.Error) {
              debug('It is ErrorResponse have a single error');
              var errorDetail = response;
              errorDetail.Headers = ResponseHeaders;
              errorDetail.StatusCode = statusCode || 'unknown';
              return callback.call(self, null, errorDetail);
            } else if (error) {
              return callback.call(self, new Error.sslayerAPIError({
                message: 'Failed to parse response received from the sslayer API',
                StatusCode: statusCode || 'unknown'
              }), null);
            }
            debug('-----------------------------------------------------------------');
            // debug('final response %o ', response);
            // Expose res object
            Object.defineProperty(response, 'lastResponse', {
              enumerable: false,
              writable: false,
              value: res
            });
            return callback.call(self, null, response);
          });
        } catch (exception) {
          return callback.call(self, new Error.sslayerAPIError({
            message: 'Invalid response received from the sslayer API',
            StatusCode: statusCode || 'unknown'
          }), null);
        }
      });
    };
  },

  _errorHandler: function (req, callback) {
    var self = this;
    return function (error) {
      if (req._isAborted) {
        // already handled
        return;
      }
      callback.call(self, new Error.sslayerConnectionError({
        message: 'An error occurred with our connection to sslayer',
        error: error
      }), null);
    };
  },

  _request: function (method, path, data, auth, options, callback) {
    data.access_key = this._sslayer.getApiField('key');  // set secret key as common params
    var requestParamsJSONCopy = JSON.parse(JSON.stringify(data));
    var self = this;
    self.body = '';
    path = path.concat('?', qs.stringify(data));

    makeRequest();

    function makeRequest() {
      var timeout = self._sslayer.getApiField('timeout');
      var isInsecureConnection = self._sslayer.getApiField('protocol') === 'http';

      var host = self.overrideHost || self._sslayer.getApiField('host');
      var params = {
        hostname: host,
        port: self._sslayer.getApiField('port'),
        path: path,
        method: method
      };

      debug('path ', path);
      debug('params %o ', params);
      debug('self.body %o ', self.body);
      var req = (isInsecureConnection ? http : https).request(params);

      req.setTimeout(timeout, self._timeoutHandler(timeout, req, callback));
      req.on('response', self._responseHandler(requestParamsJSONCopy, req, callback));
      req.on('error', self._errorHandler(req, callback));

      req.on('socket', function (socket) {
        socket.on((isInsecureConnection ? 'connect' : 'secureConnect'), function () {
          // Send payload; we're safe:
          req.write(self.body);
          req.end();
        });
      });
    }
  }
};

module.exports = sslayerResource;
