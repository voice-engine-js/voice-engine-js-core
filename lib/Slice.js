const Transform = require('stream').Transform

class Slice extends Transform {
  constructor (options) {
    options = options || {}

    super({
      readableObjectMode: true
    })

    this.trigger = options.trigger
    this.startEvent = options.start || 'start'
    this.endEvent = options.end || 'end'
    this.active = false

    this.once('pipe', input => {
      this.trigger = this.trigger || input

      this.trigger.on(this.startEvent, () => {
        this.chunks = []

        this.active = true
      })

      this.trigger.on(this.endEvent, () => {
        this.push(Buffer.concat(this.chunks))

        this.active = false
      })

      input.once('format', format => {
        this.format = format

        this.emit('format', this.format)
      })
    })
  }

  _final (callback) {
    // delays closing the stream after end event so we can still push
    callback()
  }

  _transform (chunk, encoding, callback) {
    if (this.active) {
      this.chunks.push(chunk)
    }

    callback()
  }

  static create (options) {
    return new Slice(options)
  }
}

module.exports = Slice
