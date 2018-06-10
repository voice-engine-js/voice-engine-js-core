const recorder = require('..').recorder
const slice = require('..').slice
const speechDetection = require('..').speachDetection
const wavFileWriter = require('..').wavFileWriter

const input = recorder({
  channels: 1
})

const detection = speechDetection()

input.pipe(detection)
input.pipe(slice({
  trigger: detection,
  start: 'speech-start',
  end: 'speech-end'
})).pipe(wavFileWriter('test.wav'))

input.once('start', () => {
  console.log('Recording started...')
})

detection.on('speech-start', () => console.log('start of speech detected'))
detection.on('speech-end', () => console.log('end of speech detected'))

console.log('Records mono audio and detects speech by volume changes.')
console.log('Last speech is written to "test.wav".')
console.log('Exit program with Ctrl-C.')
