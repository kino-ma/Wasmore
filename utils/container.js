const Docker = require('dockerode');
const dockerSocket = "/var/run/docker.sock";
const docker = new Docker(dockerSocket);

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
    Cmd: ["date"],
    name: containers.date,
    AttachStdout: true,
  })
  .catch((err) => {
    console.error("could not creat container: ", err);
    process.exit(1);
  });

const callContainer = () => {
  return docker.run("ubuntu", ["date"], process.stdout, { AutoRemove: true });
};

console.debug({ dateRunner });

module.exports = { docker, callContainer, dateRunner, removeContainers };