const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);

    this.currentLine = '';
  }
  
  _transform(chunk, encoding, callback) {
    const newChunk = chunk.toString();

    if (newChunk.indexOf(os.EOL) === -1) {
      this.currentLine += newChunk;

      return callback();
    } 
      
    newChunk.split(os.EOL).forEach(chunk => {
      if (this.currentLine.length) {
        this.push(this.currentLine + chunk);
        this.currentLine = '';
      } else {
        this.push(chunk);
      }
    });

    callback();
  }
  
  _flush(callback) {
    callback();
  }
}

module.exports = LineSplitStream;

