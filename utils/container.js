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
      AttachStdin: true,
      Tty: true,
    };

    const container = await this.container;

    // let before = performance.now();
    const exe = await container.exec(options);
    // let after = performance.now();
    // console.log(`exec create took: ${after - before} ms`);

    // const buf = new streams.ReadableStream("hello");

    // before = performance.now();
    console.log("exec start");
    const execStartOptions = {
      // hijack: true,
      stdin: true,
    }
    const stream = await exe.start(execStartOptions);
    console.log("exec start end");
    console.log({ execStream: stream });
    // after = performance.now();
    // console.log(`exec start took: ${after - before} ms`);

    // stream.on('readable', () => {
    //   console.log("readable", stream.read());
    // })

    // before = performance.now();
    const closedStream = new Promise((resolve, reject) => {
      stream.on('close', () => {
        // after = performance.now();
        // console.log(`stream close took: ${after - before} ms`);
        console.log("close event")
        const output = stdout.toString();
        resolve(output)
      })
      stream.on('end', () => {
        // after = performance.now();
        // console.log(`stream close took: ${after - before} ms`);
        console.log("end event")
        const output = stdout.toString();
        resolve(output)
      })

      stream.on('error', reject);
    })

    // const res = stream.write("nodejs writing\r\n second line");
    // stream.write("nodejs writing\r\n second line");
    // stream.write("nodejs writing\r\n second line");
    // stream.write("nodejs writing\r\n second line");
    // stream.write("nodejs writing\r\n second line");
    // stream.write("nodejs writing\r\n second line");
    // console.log({ writtenStream: stream, writeResult: res });
    // const ended = stream.end();
    // console.log("ended writing", { ended })

    process.stdin.setRawMode(true)
    stream._output.pipe(process.stdout);
    const input = new streams.ReadableStream("date\n");
    input.pipe(stream);
    // process.stdin.pipe(stream);
    // input.write("date")

    // stream.write("echo hello; ls /");
    console.log("piped")
    process.stdin.setRawMode(false)
    process.stdin.resume()


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

const dateRunner = new CachingContainer(["date", "+%s"]);

// const helloContainer = new CachingContainer(["/root/faas_bin", "hello"]);
// const helloContainer = new CachingContainer(["timeout", "4", "head", "-n", "1"]);
const helloContainer = new CachingContainer(["sh"]);

const callContainer = () => {
  return docker.run("ubuntu", ["date", "+%s"], process.stdout, { AutoRemove: true });
};

module.exports = { Container, CachingContainer, docker, callContainer, dateRunner, helloContainer };