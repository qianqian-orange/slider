import EventEmitter from './eventEmitter'
import eventType from './eventType'
// 用于匹配transfrom值
const regex = /matrix\((.*)\)/

class Slider {
  constructor({ el }) {
    // 这个的el传的是上面HTML文档结构中的div
    this.el = typeof el === 'string' ? document.querySelector(el) : el
    if (!this.el) {
        console.error('the el is not exist')
        return
    }
    // 记录开始触碰div的触点的clientX, 即touches[0].clientX
    this.clientX = 0
    // 记录ul的当前偏移位置
    this.startX = 0
    // 当前页的索引
    this.index = 0
    // 当滑动距离超过该值时就滚动到下一页或上一页
    this.interval = null
    // 判断是否正在过渡过程中
    this.pending = false
    // 过渡时间
    this.duration = 400
    this.eventEmitter = new EventEmitter()
    // 调用init方法进行初始化
    this.init()
  }
  
  to(x) {
    this.ul.style.transform = `translateX(${x}px)`
  }

  init() {
    if (this.el.children.length === 0) return
    this.ul = this.el.children[0]
    this.size = this.ul.children.length
    const children = this.ul.children
    // li的宽度
    this.width = children[0].offsetWidth
    this.el.style.width = `${this.width}px`
    if (this.size <= 1) return
    // 遍历li设置li的宽度，因为我们在设置li的宽度样式时可能不是使用px，
    // 而是使用width: 100%,那么需要设置成px, 因为我们接下在会修改ul的宽度
    // 如果li宽度样式依旧是100%的话那么不正确了
    for (let i = 0; i < children.length; i += 1) {
        children[i].style.width = `${this.width}px`
    }
    // 设置ul的宽度, 需要额外两个li宽度，因为需要复制首尾两个li
    this.ul.style.width = `${this.width * (this.size + 2)}px`
    const first = children[0]
    const last = children[children.length - 1]
    this.ul.appendChild(first.cloneNode(true))
    this.ul.insertBefore(last.cloneNode(true), first)
    // 设置ul过渡样式
    this.ul.style.transition = 'transform 0ms ease'
    // 第一个li的复制
    this.to(-this.width)
    // 修改属性值
    this.startX = -this.width
    this.interval = this.width * 0.2
    // 绑定事件
    this.addEventListener()
  }

  addEventListener() {
    this.bindStart = this.start.bind(this)
    this.bindMove = this.move.bind(this)
    this.bindEnd = this.end.bind(this)
    this.el.addEventListener(eventType.touchstart, this.bindStart, false)
    this.el.addEventListener(eventType.touchmove, this.bindMove, false)
    this.el.addEventListener(eventType.touchend, this.bindEnd, false)
    this.bindTransitionEnd = this.transitionEnd.bind(this)
    this.ul.addEventListener(eventType.transitionend, this.bindTransitionEnd, false)
  }

  start(e) {
    // 这个判断逻辑分支后面将
    if (this.pending) this.stop()
    this.clientX = e.touches[0].clientX
    this.eventEmitter.emit(eventType.beforeScrollStart)
  }

  move(e) {
    this.to(e.touches[0].clientX - this.clientX + this.startX)
  }

  end(e) {
    // 注意这里设置pending为true
    this.pending = true
    const interval = e.changedTouches[0].clientX - this.clientX
    this.ul.style.transitionDuration = `${this.duration}ms`
    // 由于过渡过程触发滑动会修改startX的值，可能改成-673之类的，
    // 所以这里需要规范化startX的值，比如li的宽度为300
    // 那么startX的值应该是300的整数倍，如-300, -600, -900
    // 现在不理解没关系，等讲解了stop函数的时候就知道了
    this.startX = -this.width * (this.index + 1)
    if (Math.abs(interval) < this.interval) {
      this.to(this.startX)
      return
    }
    // 左划
    if (interval < 0) {
      this.index += 1
      this.startX -= this.width
    } else {
      this.index -= 1
      this.startX += this.width
   }
    this.to(this.startX)
  }

  transitionEnd() {
    this.ul.style.transitionDuration = '0ms'
    this.pending = false
    if (this.index === -1) {
      this.index = this.size - 1
      this.startX = -this.width * this.size
    } else if (this.index === this.size) {
      this.index = 0
      this.startX = -this.width
    }
    this.to(this.startX)
    this.eventEmitter.emit(eventType.scrollEnd)
  }

  stop() {
    regex.test(window.getComputedStyle(this.ul, null).transform)
    const x = +RegExp.$1.split(', ')[4]
    const index = this.index
    // 这里手动派发transitionend事件
    const event = new Event(eventType.transitionend)
    this.ul.dispatchEvent(event)
    // 获取ul当前transfrom的值
    // 下面对startX值的设置三类情况，分别是左边界，右边界，正常情况
    if (index === -1) this.startX += x
    else if (index === this.size) this.startX += x + this.width * (this.size + 1)
    else this.startX = x
    this.to(this.startX)
  }
  
  destroy() {
    this.el.removeEventListener(eventType.touchstart, this.bindStart, false)
    this.el.removeEventListener(eventType.touchmove, this.bindMove, false)
    this.el.removeEventListener(eventType.touchend, this.bindEnd, false)
    this.ul.removeEventListener(eventType.transitionend, this.bindTransitionEnd, false)
  }

  on(type, fn) {
    this.eventEmitter.on(type, fn)
  }

  transition() {
    this.pending = true
    this.ul.style.transitionDuration = `${this.duration}ms`
    this.to(this.startX)
  }

  prev() {
    this.index -= 1
    this.startX += this.width
    this.transition()
  }

  next() {
    this.index += 1
    this.startX -= this.width
    this.transition()
  }

  getCurrentPage() {
    return this.index
  }
}

export default Slider