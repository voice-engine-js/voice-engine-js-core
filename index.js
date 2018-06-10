module.exports = {
  recorder: require('./lib/Recorder').create,
  speachDetection: require('./lib/SpeechDetection').create,
  slice: require('./lib/Slice').create,
  wavFileWriter: require('./lib/wavFileWriter')
}
