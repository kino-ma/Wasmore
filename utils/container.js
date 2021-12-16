const Docker = require('dockerode');
const dockerSocket = "/var/run/docker.sock";
const docker = new Docker(dockerSocket);

const callContainer = () => {
  return docker
    .run('ubuntu', ["date"], process.stdout, { AutoRemove: true });
}

module.exports = { docker, callContainer };