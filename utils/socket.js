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

class SocketWriter {
  constructor(socket) {
    this.socket = socket;
  }

  write(data) {
    this.socket.write(data)
  }
}

const connect = (socketFile) => {
  return new Promise((resolve, reject) => {
    const client = net.createConnection(socketFile)
      .on('connect', () => {
        console.log("socket connected.");
      })
      // Messages are buffers. use toString
      .on('data', function (data) {
        data = data.toString();

        if (data === '__boop') {
          console.info('Server sent boop. Confirming our snoot is booped.');
          client.write('__snootbooped');
          return;
        }
        if (data === '__disconnect') {
          console.log('Server disconnected.')
          return cleanup();
        }

        // Generic message handler
        resolve(data);
      })
      .on('error', function (data) {
        reject(data)
      });
  })
}

module.exports = {
  SocketWriter,
  connect,
}