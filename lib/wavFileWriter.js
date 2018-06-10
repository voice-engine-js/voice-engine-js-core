const PassThrough = require('stream').PassThrough
const WavFileWriter = require('wav').FileWriter

function wavFileWriter (filename) {
  const stream = new PassThrough()

  stream.once('pipe', input => {
    input.once('format', format => {
      stream.pipe(new WavFileWriter(filename, format))
    })
  })

  return stream
}

module.exports = wavFileWriter
