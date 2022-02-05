const Docker = require("dockerode");
const streams = require("./stream");

const wait = require("./wait");

const dockerSocket = "/var/run/docker.sock";
const docker = new Docker(dockerSocket);

class Container {
  constructor(options) {
    this._stdout = new streams.WritableStream();

    this.container = docker.createContainer(options);

    this.elapsedTime = {
      start: null,
      attach: null,
      exec: null,
      userProgram: null,
    };
  }

  async startAttaching() {
    const container = await this.container;
    const before = performance.now();

    const stream = await container.attach({
      stream: true,
      stdout: true,
      stderr: true,
      stream: true,
    });
    const after = performance.now();
    const elapsed = after - before;
    console.log(`[ELAPSED] attach: ${elapsed} ms`);
    this.elapsedTime.attach = elapsed;

    stream.pipe(this._stdout);

    return this.start();
  }

  async start() {
    const container = await this.container;

    const before = performance.now();
    const res = await container.start();
    const after = performance.now();
    const elapsed = after - before;
    console.log(`[ELAPSED] start: ${elapsed} ms`);
    this.elapsedTime.start = elapsed;

    return res;
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

    // let before = performance.now();
    const exe = await container.exec(options);
    // let after = performance.now();
    // console.log(`exec create took: ${after - before} ms`);

    // before = performance.now();
    const execStartOptions = {
      stdin: true,
    };
    const stream = await exe.start(execStartOptions);
    // after = performance.now();
    // console.log(`exec start took: ${after - before} ms`);

    // before = performance.now();
    const closedStream = new Promise((resolve, reject) => {
      stream.on("end", () => {
        // after = performance.now();
        // console.log(`stream close took: ${after - before} ms`);
        const output = stdout.toString();
        resolve(output);
      });

      stream.on("error", reject);
    });

    stream._output.pipe(stdout);
    stdin.pipe(stream);

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
    console.log({ input });

    const stdin = new streams.ReadableStream(input);

    return this.exec(this.command, stdin);
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
