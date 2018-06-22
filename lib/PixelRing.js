class PixelRing {
  constructor (driver) {
    this.driver = driver

    this.running = true
    this.refreshRate = 25
  }

  init () {
    return this.driver.init().then(() => {
      this.length = this.driver.length
    })
  }

  stop () {
    this.running = false

    return Promise.resolve()
  }

  color (index, red, green, blue, brightness) {
    this.driver.color(index, red, green, blue, brightness)
  }

  push () {
    return this.driver.push()
  }

  animate (max, time, callback) {
    if (!this.running) {
      return
    }

    const f = ((new Date()).valueOf() % time) / (time - 1) * max

    Promise.resolve().then(() => {
      return callback(f)
    }).then(() => {
      return this.push()
    }).then(() => {
      setTimeout(() => {
        this.animate(max, time, callback)
      }, 1000 / this.refreshRate)
    }).catch(err => {
      console.error(err)
    })
  }

  static create (driver) {
    return new PixelRing(driver)
  }
}

module.exports = PixelRing
