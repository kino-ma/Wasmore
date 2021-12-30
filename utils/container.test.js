const { Container, callContainer, dateRunner } = require("./container");

describe("Test the container utility", () => {
  test("Run `date` on ubuntu", async () => {
    const [output, _container] = await callContainer();
    expect(output.StatusCode).toBe(0);
  });

  test("start container", async () => {
    const container = await dateRunner;
    const started = await container.start();
    console.debug({ started: started.toString() });
  });

  test("use Container class without", async () => {
    const container = new Container({
      Image: "ubuntu",
      Cmd: ["date", "+%s"],
      AttachStdout: true,
    });

    const { stdout } = await container.run();

    expect(stdout).not.toBeFalsy()
  })
});