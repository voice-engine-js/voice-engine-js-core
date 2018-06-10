const spawn = require('child_process').spawn
const which = require('which')
const Readable = require('stream').Readable
const WavReader = require('wav').Reader

class Recorder extends Readable {
  constructor (options) {
    options = options || {}

    super({
      read: () => {
        this.startProgram().catch(err => {
          this.emit('error', err)
        })
      }
    })

    this.program = options.program
    this.device = options.device
    this.sampleRate = options.sampleRate || 16000
    this.channels = options.channels || 1
  }

  stop () {
    if (!this.process) {
      return
    }

    this.process.kill()
  }

  startProgram () {
    if (this.process) {
      return Promise.resolve()
    }

    return this.detectProgram().then(() => {
      const options = {}

      if (this.device) {
        options.env = Object.assign({}, process.env, { AUDIODEV: this.device })
      }

      this.process = spawn(this.program, this.programArgs(), options)

      this.reader = new WavReader()

      this.process.stdout.pipe(this.reader)

      this.reader.once('format', format => this.emit('format', format))

      this.reader.once('data', () => this.emit('start'))

      this.reader.on('data', chunk => this.push(chunk))

      this.process.on('close', () => {
        this.process = null

        this.push(null)
      })
    })
  }

  programArgs () {
    if (this.program === 'arecord') {
      const deviceArgs = []

      if (this.device) {
        deviceArgs.push('-D', this.device)
      }

      return deviceArgs.concat([
        '-q',
        '-r', this.sampleRate,
        '-c', this.channels,
        '-t', 'wav',
        '-f', 'S16_LE',
        '-'
      ])
    }

    if (this.program === 'rec' || this.program === 'sox') {
      return [
        '-q',
        '-r', this.sampleRate,
        '-c', this.channels,
        '-e', 'signed-integer',
        '-b', '16',
        '-t', 'wav',
        '-'
      ]
    }

    return null
  }

  detectProgram () {
    if (this.program) {
      return Promise.resolve()
    }

    const isAvailable = (program) => {
      return new Promise(resolve => {
        which(program, {nothrow: true}, (err, resolved) => {
          resolve(resolved ? program : null)
        })
      })
    }

    return Promise.all(['arecord', 'rec', 'sox'].map(program => isAvailable(program))).then(availablePrograms => {
      return availablePrograms.filter(program => program).shift()
    }).then(program => {
      this.program = program
    })
  }

  static create (options) {
    return new Recorder(options)
  }
}

module.exports = Recorder
