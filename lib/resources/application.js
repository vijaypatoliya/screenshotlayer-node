'use strict';

var sslayerResource = require('../Resource');
var sslayerMethod = sslayerResource.methods.sslayerMethod;

module.exports = sslayerResource.extend({

  captureSnapshot: sslayerMethod({
    method: 'GET',
    path: 'api/capture'
  })
});
