const Docker = require('dockerode');
const dockerSocket = "/var/run/docker.sock";
const docker = new Docker(dockerSocket);

module.exports = docker;

docker.run('ubuntu', ["date"], process.stdout, {}, function (err, data, container) {
  if (err) {
    return console.error(err);
  }
  console.log(data.StatusCode);
});