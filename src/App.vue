<template>
  <div ref="slider" style="overflow: hidden">
    <ul class="list">
      <li class="item">
        <img src="https://aecpm.alicdn.com/simba/img/TB15tIjGVXXXXcoapXXSutbFXXX.jpg" alt="">
      </li>
      <li class="item">
        <img src="https://aecpm.alicdn.com/simba/img/TB1CWf9KpXXXXbuXpXXSutbFXXX.jpg_q50.jpg" alt="">
      </li>
      <li class="item">
        <img src="https://picasso.alicdn.com/imgextra/i3/345515/O1CNA1NPhT1q100d8b76c37c0b832c11000c_!!345515-0-picassobanner.jpg" alt="">
      </li>
    </ul>
  </div>
</template>

<script>
import Slider from '../lib'

export default {
  data() {
    return {
      current: 0,
      id: null
    }
  },
  beforeDestory() {
    clearTimeout(this.id)
    if (this.slider) this.slider.destroy()
  },
  mounted() {
    this.$nextTick(() => {
      this.slider = new Slider({ el: this.$refs.slider })
      this.slider.on('beforeScrollStart', () => {
        clearTimeout(this.id)
      })
      this.slider.on('scrollEnd', () => {
        this.current = this.slider.getCurrentPage()
        console.log(this.current)
        this.autoGoNext()
      })
      this.autoGoNext()
    })
  },
  methods: {
    autoGoNext() {
      clearTimeout(this.id)
      this.id = setTimeout(() => {
        this.slider.next()
      }, 1000)
    }
  },
}
</script>

<style lang="css">
  body, html {
    padding: 0;
    margin: 0;
  }
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .list {
    overflow: hidden;
  }
  .item {
    float: left;
    width: 100%;
    height: 120px;
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>