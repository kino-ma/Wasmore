const { Request } = require('./socket');

const dockerSocket = "/var/run/docker.sock";

const listContainers = async () => {
  const resp = await Request.get("/containers/json", socketPath = dockerSocket);
  const json = JSON.parse(resp);
  return json;
}

listContainers().then(console.log)