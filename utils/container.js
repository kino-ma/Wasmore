import res from "express/lib/response";
import { Request } from "./socket"

const dockerSocket = "/var/run/docker.sock";

const listContainers = async () => {
  const resp = await Request.get("/containers/json", socketPath = dockerSocket);
  return JSON.stringify(nesp);
}