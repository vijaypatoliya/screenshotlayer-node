'use strict';

var config = require('../../intialize/config');
var clientAccessKey = config.userAccessKey;

var fs = require('fs');
var chai = require('chai');
var expect = chai.expect;

var sslayer = require('../../../lib')(clientAccessKey);

describe('CaptureSnapshot', function () {
  it('It should capturing a snapshot', async function () {
    var data = {
      url: 'https://www.google.com',
      format: 'PNG'
    };
    try {
      var response = await sslayer.application.captureSnapshot(data).catch(error => {
        if (error) {
          console.log('error ', error);
          return;
        }
      });
      // console.log('response', response);
      expect(response).to.be.a('object');
      expect(response).to.have.property('imageBufferData').to.be.a('string');
      expect(response).to.have.property('imageType').to.be.a('string');

      var fileName = 'image.' + response.imageType;
      var wstream = fs.createWriteStream(fileName);
      var bufferString = Buffer.from(JSON.parse(response.imageBufferData).data);
      wstream.write(bufferString);
      wstream.on('error', (err) => {
        console.log(err);
        wstream.end();
      });
      console.log('created image: ', fileName);

    } catch (error) {
      console.log('error ', error);
      expect(response).to.be.a(undefined);
    }
  });
});
