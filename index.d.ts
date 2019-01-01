// Type definitions for screenshotlayer-node

declare class BaseClient {

}

declare class Application extends BaseClient {

  captureSnapshot(params: any): Promise<any>;

}

declare class sslayerNodeClient {

  constructor()

  constructor(clientAccessKey: string);

  setApiKey(clientAccessKey: string): void;

  application: Application;
}

declare namespace sslayerNodeClient {

}
export = sslayerNodeClient;