'use strict';

const clientAccessKey = process.env.SSLAYER_CLIENT_ACCESS_KEY;

import * as ScreenShotLayerAPI from 'screenshotlayer-node';

const sslayer = new ScreenShotLayerAPI();

const applicationRequest = async function () {
  sslayer.setApiKey(clientAccessKey);

  const data = {
    url: 'https://www.google.com'
  };
  const response = await sslayer.application.captureSnapshot(data).catch(error => {
    if (error) {
      return;
    }
  });
};

applicationRequest();
