const Docker = require('dockerode');
const dockerSocket = "/var/run/docker.sock";
const docker = new Docker(dockerSocket);

const containers = {
  date: "date-runner",
};

const dateRunner = docker.createContainer({
  Image: "ubuntu",
  Cmd: ["date"],
  name: containers.date,
  AttachStdout: true,
});

const callContainer = () => {
  return docker
    .run('ubuntu', ["date"], process.stdout, { AutoRemove: true });
}

console.log({ dateRunner })

module.exports = { docker, callContainer, dateRunner };