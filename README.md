# screenshotlayer-node (Screenshotlayer Node Rest API)
[![Build Status](https://travis-ci.org/vijaypatoliya/screenshotlayer-node.svg?branch=master)](https://travis-ci.org/vijaypatoliya/screenshotlayer-node) [![Stackoverflow Thread](https://img.shields.io/badge/stackoverflow-screenshotlayer--node--api-yellowgreen.svg)](https://stackoverflow.com/search?q=nodejs-screenshotlayer-node)

This API supported Screenshotlayer standard REST API that accepts/returns JSON requests. Here is the [API reference] (https://screenshotlayer.com/documentation)

You can find [examples of JavaScript and TypeScript](https://github.com/vijaypatoliya/screenshotlayer-node/tree/master/examples). This will help you for faster implementation of Screenshotlayer APIs.

##### It does supports EcmaScript 5, EcmaScript 6,  EcmaScript 8, TypeScript, async-await, Promises, Callback!!!
##### It does also supports for AWS Lambda like serverless cloud function call.
##### It supports pure JSON response.
##### A method support Promise and Callback both.

## Get started
Using the Screenshotlayer API wrapper for Node.js is really simple.
Given that you already have a Node.js project with NPM setup just follow these steps:

**Install the dependency**
```
npm install --save screenshotlayer-node
```

## Configuration Using JavaScript

```bash
export SSLAYER_CLIENT_ACCESS_KEY=API_ACCESS_KEY
```

```js
var screenshotlayer = require('screenshotlayer-node')('YOUR_ACCESS_KEY');
```

## Configuration Using TypeScript
```js
import * as ScreenShotLayerAPI from 'screenshotlayer-node';
const sslayer = new ScreenShotLayerAPI();
sslayer.setApiKey('YOUR_ACCESS_KEY');
```

## Test Cases
```bash
npm run test.mocha
```

## Debugging
```bash
export DEBUG=sslayer:*
```

```
Originally by [Vijay Patoliya](https://github.com/vijaypatoliya) (osi.vijay@gmail.com).
```
 
## Example

#### Capture a snapshot
```javascript
  sslayer.setApiKey(clientAccessKey);
  var data = {
    url: 'https://www.google.com'
  };
  try {
    var response = sslayer.application.captureSnapshot(data);
  } catch (error) {
    return;
  }
```

**following code define how to save image file using above response data**
```javascript
  var pathToSave = 'path/to/save';
  var imageName = 'image';
  var extension = response.imageType;
  var fileName = pathToSave + '/' + imageName + '.' + extension;
  var wstream = fs.createWriteStream(fileName);
  var bufferString = Buffer.from(JSON.parse(response.imageBufferData).data);
  wstream.write(bufferString);
  wstream.on('error', (err) => {
    console.log(err);
    wstream.end();
  });
  console.log('created image: ', fileName);
```