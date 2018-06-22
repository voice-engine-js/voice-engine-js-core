const exec = require('child_process').exec

class Gpio {
  constructor (pin) {
    this.pin = pin
  }

  init () {
    return Gpio.exec(`echo ${this.pin} > /sys/class/gpio/export`)
  }

  mode (direction) {
    return this.init().then(() => {
      return Gpio.exec(`echo ${direction} > /sys/class/gpio/gpio${this.pin}/direction`)
    })
  }

  write (value) {
    return Gpio.exec(`echo ${value ? 1 : 0} > /sys/class/gpio/gpio${this.pin}/value`)
  }

  static exec (cmd) {
    return new Promise(resolve => {
      exec(cmd, null, () => {
        resolve()
      })
    })
  }

  static create (pin) {
    return new Gpio(pin)
  }
}

Gpio.IN = Gpio.create.IN = 'in'
Gpio.OUT = Gpio.create.OUT = 'out'

module.exports = Gpio
