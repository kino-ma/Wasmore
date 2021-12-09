/*
**
**  Example of Interprocess communication in Node.js through a UNIX domain socket
**
**  Usage:
**   server>  MODE=server node ipc.example.js
**   client>  MODE=client node ipc.example.js
**
*/

const net = require('net');

const http = require('http');

class SocketWriter {
  constructor(socket) {
    this.socket = socket;
  }

  write(data) {
    this.socket.write(data)
  }
}

const connect = (socketPath) => {
  const options = {
    socketPath,
    method: "GET",
    path: "/containers/json",
  };

  return new Promise((resolve, reject) => {
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

module.exports = {
  SocketWriter,
  connect,
}

connect("/var/run/docker.sock").then(console.log).catch(console.error);