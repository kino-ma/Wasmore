const Docker = require('dockerode');
const streams = require("memory-streams");

const wait = require("./wait");

const dockerSocket = "/var/run/docker.sock";
const docker = new Docker(dockerSocket);

class Container {
  constructor(options) {
    this._stdout = new streams.WritableStream();

    this.container = docker
      .createContainer(options)
      .then((container) => {
        // To get stdout in memory stream
        container
          .attach({ stream: true, stdout: true, stderr: true, stream: true })
          .then((stream) => {
            stream.pipe(this._stdout);
          });

        return container;
      })
  }

  async run(wait = true) {
    const container = await this.container;
    await container.start();

    if (!wait) {
      return;
    }

    // await container.wait();
    const stdout = this._stdout.toString();
    const output = {
      stdout,
    };

    return output;
  }

  async exec(command) {
    const stdout = new streams.WritableStream();

    const options = {
      Cmd: command,
      AttachStdout: true,
      AttachStderr: true,
      Tty: true,
    };

    const container = await this.container;
    const exe = await container.exec(options);
    const stream = await exe.start();
    stream.pipe(stdout);

    const closedStream = new Promise((resolve, reject) => {
      stream.on('close', () => {
        const output = stdout.toString();
        resolve(output)
      })

      stream.on('error', reject);
    })

    return closedStream;
  }
}

class CachingContainer {
  constructor(command) {
    const container = new Container({
      Image: "ubuntu",
      Cmd: ["date", "+%s"],
      AttachStdout: true,
      AttachStderr: true,
    })
  }
}

const containers = {
  date: "date-runner",
};

const dateRunner = new Container({
  Image: "ubuntu",
  Cmd: ["date", "+%s"],
  AttachStdout: true,
  Tty: true,
})

const callContainer = () => {
  return docker.run("ubuntu", ["date", "+%s"], process.stdout, { AutoRemove: true });
};

module.exports = { Container, docker, callContainer, dateRunner };