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
          .attach({ stream: true, stdout: true, stderr: true })
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

    const callResult = await container.wait();

    const stdout = this._stdout.toString();
    const output = {
      stdout,
      callResult
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

    stream.on('unpipe', (src) => {
      console.debug('unpipe', { src: src.toString() })
    })

    stream.on('close', () => {
      console.debug('close', { src: stdout.toString() })
    })

    stream.on('finish', () => {
      console.debug('finish', { src: stdout.toString() })
    })

    return stdout.toString();
  }
}

class CachingContainer {
  constructor(command) {
    const container = new Container({
      Image: "ubuntu",
      Cmd: ["date", "+%s"],
      AttachStdout: true,
    })
  }
}

const containers = {
  date: "date-runner",
};

const removeContainers = () => {
  const containers = [dateRunner];
  const promises = containers.map((c) => {
    c.then((container) => {
      return container.remove();
    })
      .then((_) => {
        console.log("removed");
      })
      .catch((err) => {
        console.error("could not remove container:", err);
      });
  });

  return Promise.all(promises);
};

const dateRunner = new Container({
  Image: "ubuntu",
  Cmd: ["date", "+%s"],
  AttachStdout: true,
})

const callContainer = () => {
  return docker.run("ubuntu", ["date", "+%s"], process.stdout, { AutoRemove: true });
};

module.exports = { Container, docker, callContainer, dateRunner, removeContainers };