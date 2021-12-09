const http = require('http');

const dockerSocket = "/var/run/docker.sock";

class Request {
  constructor(options) {
    this._promise = new Promise((resolve, reject) => {
      const clientRequest = http.request(options, (res) => {
        console.log("start");
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        })

        res.on('end', () => {
          const json = JSON.parse(data);
          resolve(json);
        })

        res.on('error', (err) => {
          reject(err);
        })

        console.log(`code: ${res.statusCode}`);
      })
      clientRequest.end();
    })
  }

  static get(path, socketPath = dockerSocket) {
    const options = {
      method: "GET",
      path,
      socketPath,
    };
    const clientRequest = new Request(options);

    return clientRequest._promise;
  }
}

module.exports = {
  Request
}