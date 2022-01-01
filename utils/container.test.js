const { Container, callContainer, dateRunner } = require("./container");

describe("Test the container utility", () => {
  test("Run `date` on ubuntu", async () => {
    const [output, _container] = await callContainer();
    expect(output.StatusCode).toBe(0);
  });

  test("start container", async () => {
    const container = dateRunner;
    const { stdout } = await container.run();
    expect(stdout).not.toBeFalsy()
  });

  test("use Container class", async () => {
    const container = new Container({
      Image: "ubuntu",
      Cmd: ["date", "+%s"],
      AttachStdout: true,
    });

    const { stdout } = await container.run();

    expect(stdout).not.toBeFalsy()
  })

  test("exec on running Container", async () => {
    const container = new Container({
      Image: "ubuntu",
      Cmd: ["sleep", "1"],
      AttachStdout: true,
    });

    await container.run(wait = false);
    const output = await container.exec(["bash", "-c", "uname -a && sleep 0.1 && echo next"]);

    expect(output).not.toBeFalsy();
  })
});