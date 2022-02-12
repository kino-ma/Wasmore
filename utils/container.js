const Docker = require("dockerode");
const streams = require("./stream");

const wait = require("./wait");
const { measure } = require("./perf");

const dockerSocket = "/var/run/docker.sock";
const docker = new Docker(dockerSocket);

class Container {
  constructor(options) {
    this._stdout = new streams.WritableStream();

    this.container = docker.createContainer(options);

    this.elapsedTime = {
      start: null,
      attach: null,
      execCreate: null,
      execStart: null,
      userProgram: null,
    };
  }

  async startAttaching() {
    const container = await this.container;

    const { result: stream, elapsed } = await measure("attach", () =>
      container.attach({
        stream: true,
        stdout: true,
        stderr: true,
        stream: true,
      })
    );

    this.elapsedTime.attach = elapsed;

    stream.pipe(this._stdout);

    return this.start();
  }

  async start() {
    const container = await this.container;

    const { result: stream, elapsed } = await measure("start", () =>
      container.start().catch((err) => {
        if (err.statusCode === 304) {
          console.debug("container already started. continue");
          return;
        }
        return new Promise((_resolve, reject) => reject(err));
      })
    );

    this.elapsedTime.start = elapsed;

    return stream;
  }

  async run() {
    await this.startAttaching();

    // await container.wait();
    const stdout = this._stdout.toString();
    const output = {
      stdout,
    };

    return output;
  }

  async exec(command, stdin = new streams.ReadableStream(null)) {
    const stdout = new streams.WritableStream();

    const options = {
      Cmd: command,
      AttachStdout: true,
      AttachStderr: true,
      AttachStdin: true,
      Tty: true,
    };

    const container = await this.container;

    const { result: exe, elapsed: execCreateElapsed } = await measure(
      "exec create",
      () => container.exec(options)
    );

    const execStartOptions = {
      stdin: true,
    };
    const { result: stream, elapsed: execStartElapsed } = await measure(
      "exec start",
      () => exe.start(execStartOptions)
    );

    const { result: closedStream, elapsed: userProgramElapsed } = await measure(
      "user program",
      () => {
        const p = new Promise((resolve, reject) => {
          stream.on("end", () => {
            const output = stdout.toString();
            resolve(output);
          });

          stream.on("error", reject);
        });
        stream._output.pipe(stdout);
        stdin.pipe(stream);
        return p;
      }
    );

    this.elapsedTime.execCreate = execCreateElapsed;
    this.elapsedTime.execStart = execStartElapsed;
    this.elapsedTime.userProgram = userProgramElapsed;

    return closedStream;
  }
}

class CachingContainer extends Container {
  constructor(command, customOptions = {}) {
    const defaultOptions = {
      Image: "faas-bin",
      AttachStdout: true,
      AttachStderr: true,
      Tty: true,
    };

    const startOptions = {
      ...defaultOptions,
      ...customOptions,
    };

    super(startOptions);

    this.startOptions = startOptions;
    this.running = false;
    this.command = command;
    this.elapsedTime.execs = [];
  }

  async manualStart() {
    if (this.container === null) {
      this.container = new Container(this.startOptions);
    }

    if (!this.running) {
      const started = await super.start();
      this.running = true;
      return started;
    }
  }

  async startAndExec(input) {
    if (!this.running) {
      await this.manualStart();
    }

    if (typeof input === "object") {
      input = JSON.stringify(input) + "\n";
    } else if (typeof input === "undefined") {
      input = "";
    }

    const stdin = new streams.ReadableStream(input);

    const result = await this.exec(this.command, stdin);
    this.elapsedTime.execs.push({
      create: this.elapsedTime.execCreate,
      start: this.elapsedTime.execStart,
      userProgram: this.elapsedTime.userProgram,
    });

    return result;
  }
}

const containers = {
  date: "date-runner",
};

const dateRunner = new CachingContainer(["date", "+%s"]);

const helloContainer = new CachingContainer(["/root/faas_bin"]);
const lightContainer = new CachingContainer(["/root/faas_bin"]);
const heavyContainer = new CachingContainer(["/root/faas_bin"]);

const callContainer = () => {
  return docker.run("ubuntu", ["date", "+%s"], process.stdout, {
    AutoRemove: true,
  });
};

module.exports = {
  Container,
  CachingContainer,
  docker,
  callContainer,
  dateRunner,
  helloContainer,
  lightContainer,
  heavyContainer,
};
