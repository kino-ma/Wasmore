const Docker = require('dockerode');
const streams = require("memory-streams");

const dockerSocket = "/var/run/docker.sock";
const docker = new Docker(dockerSocket);

class Container {
  constructor(options) {
    this._stdout = new streams.WritableStream();

    this.container = docker
      .createContainer(options)
      .then((container) => {
        console.log({ container });

        // To get stdout in memory stream
        container
          .attach({ stream: true, stdout: true, stderr: true })
          .then((stream) => {
            stream.pipe(this._stdout);
          });

        return container;
      })
  }

  async run() {
    const container = await this.container;
    await container.start();
    const callResult = await container.wait();

    const stdout = this._stdout.toString();
    const output = {
      stdout,
      callResult
    };

    return output;
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

const dateRunner = docker
  .createContainer({
    Image: "ubuntu",
    Cmd: ["date", "+%s"],
    AttachStdout: true,
  })

const callContainer = () => {
  return docker.run("ubuntu", ["date", "+%s"], process.stdout, { AutoRemove: true });
};

console.debug({ dateRunner });

console.debug({ started: dateRunner })

module.exports = { Container, docker, callContainer, dateRunner, removeContainers };