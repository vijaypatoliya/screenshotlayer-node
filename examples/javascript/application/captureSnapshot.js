'use strict';

var clientAccessKey = process.env.SSLAYER_CLIENT_ACCESS_KEY;

var sslayer = require('../../../lib')(clientAccessKey);

var applicationRequest = async function () {
  /**
   * passing parameters 
   * -------------------
   * 
   * url (required)
   * 
   * (optional)
   * fullpage (set to "1" if you want to capture the full height of the target website)
   * width (specify your preferred thumbnail width in pixels, DEFAULT: 1:1)
   * viewport (specify your preferred viewport dimensions in pixels, DEFAULT: 1440x900)
   * format (set your preferred image output format, DEFAULT: PNG)
   * secret_key (your secret key, an md5 hash of the target URL and your secret word)
   * css_url (attach a URL containing a custom CSS stylesheet)
   * delay  (specify a delay before screenshot is captured (in seconds))
   * ttl (define the time (in seconds) your snapshot should be cached, DEFAULT: 2592000 (30 days))
   * force (set to "1" if you want to force the API to capture a fresh screenshot)
   * placeholder (attach a URL containing a custom placeholder image or set to "1" to use default placeholder)
   * user_agent (specify a custom User-Agent HTTP header to send with your request)
   * accept_lang (specify a custom Accept-Language HTTP header to send with your request)
   * export (export snapshot via custom ftp path or using your AWS S3 user details)
   */
  var data = {
    url: 'https://www.google.com'
  };
  try {
    var response = await sslayer.application.captureSnapshot(data);
  } catch (error) {
    return;
  }
};

applicationRequest();
