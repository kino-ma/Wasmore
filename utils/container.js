const Docker = require('dockerode');
const dockerSocket = "/var/run/docker.sock";
const docker = new Docker(dockerSocket);

module.exports = docker;