const Stream = require('readable-stream');
const util = require('util');

class ReadableStream extends Stream.Readable {
  constructor(data) {
    super();
    this._data = data;
  }
  _read(n) {
    this.push(this._data);
    this._data = '';
    this.destroy()
  }
}

class WritableStream extends Stream.Writable {
  constructor(options) {
    super(options);
  }
  write(chunk, encoding, callback) {
    var ret = Stream.Writable.prototype.write.apply(this, arguments);
    if (!ret)
      this.emit('drain');
    return ret;
  }
  _write(chunk, encoding, callback) {
    this.write(chunk, encoding, callback);
  }
  toString() {
    return this.toBuffer().toString();
  }
  toBuffer() {
    var buffers = [];
    this._writableState.buffer.forEach(function (data) {
      buffers.push(data.chunk);
    });

    return Buffer.concat(buffers);
  }
  end(chunk, encoding, callback) {
    var ret = Stream.Writable.prototype.end.apply(this, arguments);
    // In memory stream doesn't need to flush anything so emit `finish` right away
    // base implementation in Stream.Writable doesn't emit finish
    this.emit('finish');
    return ret;
  }
}

module.exports = { WritableStream, ReadableStream };