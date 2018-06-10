const recorder = require('..').recorder
const wavFileWriter = require('..').wavFileWriter

const input = recorder({
  channels: 1
})

const output = wavFileWriter('test.wav')

input.pipe(output)

input.once('start', () => {
  console.log('Recording started...')

  setTimeout(() => {
    input.stop()
  }, 3000)
})

console.log('Records mono audio and saves it into the file "test.wav".')
console.log('The program will exit after 3 seconds.')
