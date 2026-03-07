/**
 * 震动工具 - 封装浏览器 Vibration API
 */

class VibrationHelper {
  constructor() {
    this.enabled = true
    this.isSupported = 'vibrate' in navigator
  }

  // 设置启用状态
  setEnabled(enabled) {
    this.enabled = enabled
  }

  // 检查是否支持震动
  checkSupport() {
    return this.isSupported
  }

  // 短震动（点击反馈）
  short() {
    if (!this.enabled || !this.isSupported) return
    navigator.vibrate(30)
  }

  // 中等震动（爆破反馈）
  medium() {
    if (!this.enabled || !this.isSupported) return
    navigator.vibrate(50)
  }

  // 长震动（完成反馈）
  long() {
    if (!this.enabled || !this.isSupported) return
    navigator.vibrate(100)
  }

  // 双震动（成功反馈）
  double() {
    if (!this.enabled || !this.isSupported) return
    navigator.vibrate([50, 30, 50])
  }

  // 自定义震动模式
  pattern(pattern) {
    if (!this.enabled || !this.isSupported) return
    navigator.vibrate(pattern)
  }

  // 停止震动
  stop() {
    if (this.isSupported) {
      navigator.vibrate(0)
    }
  }
}

// 单例导出
export const vibrationHelper = new VibrationHelper()
export default vibrationHelper
