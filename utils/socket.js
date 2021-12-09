const http = require('http');

const dockerSocket = "/var/run/docker.sock";

class Request {
  constructor(options, body = null) {
    this._promise = new Promise((resolve, reject) => {
      const clientRequest = http.request(options, (res) => {
        console.log("start");
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        })

        res.on('end', () => resolve(data));
        res.on('error', reject);

        console.log(`code: ${res.statusCode}`);
      })

      if (body && typeof body === "string") {
        clientRequest.write(body);
      }

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

  static post(path, body, option = {}, socketPath = dockerSocket) {
    const options = {
      method: "POST",
      path,
      socketPath,
      ...option,
    };
    const clientRequest = new Request(options, body = body);

    return clientRequest._promise;
  }
}

module.exports = {
  Request
}