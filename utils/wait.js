const wait = (timeout) => {
  return new Promise((resolve, _reject) => {
    setTimeout(() => {
      console.log("wait end", Date.now())
      resolve()
    }, timeout);
  })
}

module.exports = wait;