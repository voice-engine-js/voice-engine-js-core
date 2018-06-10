module.exports = {
  recorder: require('./lib/Recorder').create,
  speechDetection: require('./lib/SpeechDetection').create,
  slice: require('./lib/Slice').create,
  wavFileWriter: require('./lib/wavFileWriter')
}
