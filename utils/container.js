const { Request } = require('./socket');

const dockerSocket = "/var/run/docker.sock";

const listContainers = async () => {
  const resp = await Request.get("/containers/json", socketPath = dockerSocket);
  const json = JSON.parse(resp);
  return json;
}

const createContainer = async ({ command, image, ...config }) => {
  const data = {
    Cmd: command,
    Image: image,
    ...config
  }

  const body = JSON.stringify(data)

  const resp = await Request.post("/containers/create", body, { headers: { "Content-Type": "application/json" } });
  const json = JSON.parse(resp);
  return json;
}

createContainer({ command: ["date"], image: "ubuntu" }).then(console.log)