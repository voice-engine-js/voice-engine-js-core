const recorder = require('..').recorder
const slice = require('..').slice
const wavFileWriter = require('..').wavFileWriter
const EventEmitter = require('events').EventEmitter

const input = recorder({
  channels: 1
})

const trigger = new EventEmitter()

input.pipe(slice({trigger})).pipe(wavFileWriter('test.wav'))

input.once('start', () => {
  console.log('Recording started...')

  setTimeout(() => {
    console.log('start')

    trigger.emit('start')

    setTimeout(() => {
      console.log('end')

      trigger.emit('end')
    }, 2000)
  }, 2000)

  setTimeout(() => {
    input.stop()
  }, 6000)
})

console.log('Takes a slice of audio after 2 second with the length of 2 seconds after the program was started.')
console.log('The result is stored in "test.wav".')
console.log('The program will exit after 6 seconds')
