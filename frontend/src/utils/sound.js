/**
 * 音效工具 - 使用 Web Audio API 生成简单音效
 */

class SoundGenerator {
  constructor() {
    this.audioContext = null
    this.enabled = true
    this.volume = 0.5
  }

  // 初始化音频上下文（需要用户交互后调用）
  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    }
    return this.audioContext
  }

  // 设置启用状态
  setEnabled(enabled) {
    this.enabled = enabled
  }

  // 设置音量 (0-1)
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume))
  }

  // 播放泡泡破裂声
  playPop() {
    if (!this.enabled) return
    const ctx = this.init()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    // 随机频率让每次声音略有不同
    const baseFreq = 400 + Math.random() * 200
    oscillator.frequency.setValueAtTime(baseFreq, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1)

    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.1)
  }

  // 播放重置声（充气声）
  playReset() {
    if (!this.enabled) return
    const ctx = this.init()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.setValueAtTime(200, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.3)

    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.3)
  }

  // 播放点击声
  playClick() {
    if (!this.enabled) return
    const ctx = this.init()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.setValueAtTime(800, ctx.currentTime)
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.05)
  }

  // 播放成功声（上升音调）
  playSuccess() {
    if (!this.enabled) return
    const ctx = this.init()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.setValueAtTime(400, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.2)

    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.3)
  }

  // 播放解锁声（悦耳音效）
  playUnlock() {
    if (!this.enabled) return
    const ctx = this.init()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    // 播放两个连续音符
    const notes = [523.25, 659.25, 783.99] // C5, E5, G5 和弦

    notes.forEach((freq, index) => {
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      const startTime = ctx.currentTime + index * 0.1

      oscillator.frequency.setValueAtTime(freq, startTime)
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(this.volume * 0.2, startTime + 0.05)
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4)

      oscillator.start(startTime)
      oscillator.stop(startTime + 0.4)
    })
  }

  // 播放切肥皂声（嘶啦声）
  playSlice() {
    if (!this.enabled) return
    const ctx = this.init()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    // 使用白噪音模拟切割声
    const bufferSize = ctx.sampleRate * 0.15 // 150ms
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)

    // 生成带滤波的白噪音
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3))
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer

    // 高通滤波器让声音更脆
    const highpass = ctx.createBiquadFilter()
    highpass.type = 'highpass'
    highpass.frequency.value = 2000

    // 低通滤波器去除高频噪音
    const lowpass = ctx.createBiquadFilter()
    lowpass.type = 'lowpass'
    lowpass.frequency.value = 8000

    const gainNode = ctx.createGain()
    gainNode.gain.setValueAtTime(this.volume * 0.4, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)

    source.connect(highpass)
    highpass.connect(lowpass)
    lowpass.connect(gainNode)
    gainNode.connect(ctx.destination)

    source.start(ctx.currentTime)
  }

  // 播放肥皂掉落声
  playSoapFall() {
    if (!this.enabled) return
    const ctx = this.init()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.setValueAtTime(300, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.4)

    oscillator.type = 'triangle'

    gainNode.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.4)
  }

  // 播放肥皂生成声（轻柔的波波声）
  playSoapAppear() {
    if (!this.enabled) return
    const ctx = this.init()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.setValueAtTime(200, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.2)

    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(this.volume * 0.15, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.2)
  }

  // 播放物品放置成功声（清脆的叮声）
  playPlaceCorrect() {
    if (!this.enabled) return
    const ctx = this.init()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.setValueAtTime(880, ctx.currentTime) // A5
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(this.volume * 0.25, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.15)
  }

  // 播放物品放置错误声（低沉的提示音）
  playPlaceWrong() {
    if (!this.enabled) return
    const ctx = this.init()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.setValueAtTime(200, ctx.currentTime)
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(this.volume * 0.15, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.2)
  }

  // 播放整理完成声（欢快的音效）
  playOrganizeComplete() {
    if (!this.enabled) return
    const ctx = this.init()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    // 播放上升的琶音
    const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6

    notes.forEach((freq, index) => {
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      const startTime = ctx.currentTime + index * 0.1

      oscillator.frequency.setValueAtTime(freq, startTime)
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(this.volume * 0.2, startTime + 0.02)
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3)

      oscillator.start(startTime)
      oscillator.stop(startTime + 0.3)
    })
  }

  // 播放拖拽拾取声
  playPickup() {
    if (!this.enabled) return
    const ctx = this.init()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.setValueAtTime(600, ctx.currentTime)
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(this.volume * 0.1, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.05)
  }

  // 播放涂色声（轻柔的填充声）
  playColorFill() {
    if (!this.enabled) return
    const ctx = this.init()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    // 柔和的上升音调
    oscillator.frequency.setValueAtTime(300, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.1)

    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(this.volume * 0.15, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.15)
  }

  // 播放涂色完成声
  playColoringComplete() {
    if (!this.enabled) return
    const ctx = this.init()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    // 播放一个优美的琶音
    const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6

    notes.forEach((freq, index) => {
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      const startTime = ctx.currentTime + index * 0.12

      oscillator.frequency.setValueAtTime(freq, startTime)
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(this.volume * 0.2, startTime + 0.03)
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4)

      oscillator.start(startTime)
      oscillator.stop(startTime + 0.4)
    })
  }
}

// 单例导出
export const soundGenerator = new SoundGenerator()
export default soundGenerator
