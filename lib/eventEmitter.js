class EventEmitter {
  constructor() {
      this.events = {}
  }
  
  on(type, fn) {
      if (!this.events[type]) this.events[type] = []
      this.events[type].push(fn)
  }
  
  off(type, fn) {
      if (!this.events[type]) return
      const index = this.events[type].findIndex(f => f === fn)
      if (index === -1) return
      this.events[type].splice(index, 1)
  }
  
  emit(type) {
      if (!this.events[type]) return
      this.events[type].forEach((fn) => {
          fn()
      })
  }
}

export default EventEmitter