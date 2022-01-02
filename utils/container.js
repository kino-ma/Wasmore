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
  }

  async startAttaching() {
    const container = await this.container;
    container
      .attach({ stream: true, stdout: true, stderr: true, stream: true })
      .then((stream) => {
        stream.pipe(this._stdout);
      });
    return container.start();
  }

  async start() {
    const container = await this.container;
    return container.start();
  }

  async run(wait = true) {
    await this.startAttaching();

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

class CachingContainer extends Container {
  constructor(command, customOptions = {}) {
    const defaultOptions = {
      Image: "ubuntu",
      Cmd: ["sleep", "300"],
      AttachStdout: true,
      AttachStderr: true,
      Tty: true,
    };

    const startOptions = {
      ...defaultOptions,
      ...customOptions
    }

    super(startOptions);

    this.startOptions = startOptions;
    this.running = false;
    this.command = command;
  }

  async manualStart() {
    if (this.container === null) {
      this.container = new Container(this.startOptions);
    }

    if (!this.running) {
      this.running = true;
      return super.start();
    }
  }

  async startAndExec() {
    if (!this.running) {
      await this.manualStart();
    }

    return this.exec(this.command);
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

module.exports = { Container, CachingContainer, docker, callContainer, dateRunner };