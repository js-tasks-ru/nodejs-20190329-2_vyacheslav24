const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  constructor(options) {
    super(options);

    this.options = options;
    this.size = 0;
  }

  _transform(chunk, encoding, callback) {
    const { limit } = this.options;
    
    this.size += chunk.length;

    const error = this.size >= limit ? new LimitExceededError() : null;

    callback(error, chunk);
  }
}

module.exports = LimitSizeStream;
