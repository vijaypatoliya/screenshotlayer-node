'use strict';

// var debug = require('debug')('sslayer:screenshotlayer-node-index');
sslayer.DEFAULT_HOST = 'api.screenshotlayer.com';
sslayer.DEFAULT_PORT = '443';
sslayer.DEFAULT_BASE_PATH = '/';
sslayer.DEFAULT_RESPONSE_FORMAT = '.json';
sslayer.DEFAULT_API_VERSION = null;

// Use node's default timeout:
sslayer.DEFAULT_TIMEOUT = require('http').createServer().timeout;

sslayer.PACKAGE_VERSION = require('../package.json').version;

var resources = {
  application: require('./resources/application')
};

sslayer.sslayerResource = require('./Resource');
sslayer.resources = resources;

function sslayer(clientAccessKey) {
  if (!(this instanceof sslayer)) {
    return new sslayer(clientAccessKey);
  }

  this._api = {
    auth: null,
    host: sslayer.DEFAULT_HOST,
    port: sslayer.DEFAULT_PORT,
    basePath: sslayer.DEFAULT_BASE_PATH,
    version: sslayer.DEFAULT_API_VERSION,
    timeout: sslayer.DEFAULT_TIMEOUT
  };

  this._prepResources();
  this.setApiKey(clientAccessKey);
  this.setResponseFormat(sslayer.DEFAULT_RESPONSE_FORMAT);
}

sslayer.prototype = {

  setHost: function (host, port, protocol) {
    this._setApiField('host', host);
    if (port) {
      this.setPort(port);
    }
    if (protocol) {
      this.setProtocol(protocol);
    }
  },

  setProtocol: function (protocol) {
    this._setApiField('protocol', protocol.toLowerCase());
  },

  setPort: function (port) {
    this._setApiField('port', port);
  },

  setResponseFormat: function (format) {
    this._setApiField('format', format);
  },

  setApiKey: function (accessKey) {
    if (accessKey) {
      this._setApiField('key', accessKey);
    }
  },

  setTimeout: function (timeout) {
    this._setApiField('timeout', timeout === null ? sslayer.DEFAULT_TIMEOUT : timeout);
  },

  _setApiField: function (key, value) {
    this._api[key] = value;
  },

  getApiField: function (key) {
    return this._api[key];
  },

  _prepResources: function () {
    for (var name in resources) {
      this[name[0].toLowerCase() + name.substring(1)] = new resources[name](this);
    }
  }
};

module.exports = sslayer;

module.exports.sslayer = sslayer;
