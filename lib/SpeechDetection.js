const Writable = require('stream').Writable

class SpeechDetection extends Writable {
  constructor (options) {
    options = options || {}

    super()

    this.frameLength = options.frameLength || 0.1
    this.volumeChange = options.volumeChange || 2
    this.silenceLength = options.silenceLength || 0.5
    this.debug = options.debug
    this.speech = options.speech || false

    this.format = null
    this.frameSize = null
    this.buffer = Buffer.alloc(0)
    this.volumeHistory = []
    this.silenceFrameCount = null
    this.silenceFrameNumber = this.silenceLength / this.frameLength

    this.on('pipe', input => {
      input.once('format', format => this.setFormat(format))
    })
  }

  setFormat (format) {
    this.format = format
    this.frameSize = this.frameLength * this.format.sampleRate * this.format.bitDepth / 8
  }

  detectStart () {
    if (this.volumeHistory.length < 2) {
      return
    }

    this.volumeHistory = this.volumeHistory.slice(-2)

    const diff = this.volumeHistory[1] - this.volumeHistory[0]

    if (diff > this.volumeChange) {
      this.speech = true
      this.silenceFrameCount = null
      this.emit('speech-start')
    }
  }

  detectEnd () {
    if (this.volumeHistory.length < 3) {
      return
    }

    this.volumeHistory = this.volumeHistory.slice(-3)

    const diff = this.volumeHistory[this.volumeHistory.length - 1] - this.volumeHistory[0]

    if (diff < -this.volumeChange) {
      this.silenceFrameCount = this.silenceFrameCount || 1
    } else if (diff > this.volumeChange) {
      this.silenceFrameCount = null
    } else if (this.silenceFrameCount) {
      this.silenceFrameCount++
    }

    if (this.silenceFrameCount > this.silenceFrameNumber) {
      this.speech = false
      this.silenceFrameCount = null
      this.emit('speech-end')
    }
  }

  _write (chunk, encoding, callback) {
    this.buffer = Buffer.concat([this.buffer, chunk])

    if (this.buffer.length >= this.frameSize) {
      this.volumeHistory.push(SpeechDetection.volumePeak(this.buffer.slice(0, this.frameSize)))

      this.buffer = this.buffer.slice(this.frameSize)

      if (this.speech) {
        this.detectEnd()
      } else {
        this.detectStart()
      }

      if (this.debug) {
        console.log(`${this.volumeHistory[this.volumeHistory.length - 1]}, ${this.silenceFrameCount}`)
      }
    }

    callback()
  }

  static volumePeak (buffer) {
    let max = 0

    for (let offset = 0; offset < buffer.length; offset += 2) {
      max = Math.max(max, Math.abs(buffer.readInt16LE(offset)))
    }

    return Math.log2(max)
  }

  static create (options) {
    return new SpeechDetection(options)
  }
}

module.exports = SpeechDetection
