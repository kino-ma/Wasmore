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
    // const stream = await container.start({ options: { isStream: true } });
    const stream = await container.start();

    if (!wait) {
      return;
    }

    // const closedStdout = new Promise((resolve, reject) => {
    // console.log({ stream: stream.toString("utf-8") });
    // stream.on('close', () => {
    //   const stdout = this._stdout.toString();
    //   resolve(stdout);
    // })

    // stream.on('finish', () => {
    //   const stdout = this._stdout.toString();
    //   resolve(stdout);
    // })

    // stream.on('unpipe', () => {
    //   const stdout = this._stdout.toString();
    //   resolve(stdout);
    // })

    // stream.on('error', reject);
    // })

    const callResult = await container.wait();
    console.log({ callRseult: callResult });
    console.log({ stream: [...stream] });

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
  Tty: true,
})

const callContainer = () => {
  return docker.run("ubuntu", ["date", "+%s"], process.stdout, { AutoRemove: true });
};

module.exports = { Container, docker, callContainer, dateRunner, removeContainers };