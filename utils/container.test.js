const { Container, callContainer, dateRunner } = require("./container");

describe("Test the container utility", () => {
  test("It can use Docker API", async () => {
    const [output, _container] = await callContainer();
    expect(output.StatusCode).toBe(0);
  });

  test("`Container` class works ok", async () => {
    const container = new Container({
      Image: "ubuntu",
      Cmd: ["date", "+%s"],
      AttachStdout: true,
    });

    const { stdout } = await container.run();

    expect(stdout).not.toBeFalsy()
  })

  test("It can start container with wrapper function", async () => {
    const container = dateRunner;
    const { stdout } = await container.run();
    expect(stdout).not.toBeFalsy()
  });

  test("It can run `exec` on a running Container", async () => {
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