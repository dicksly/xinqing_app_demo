export const MOOD_INSIGHTS = {
  anxious: {
    tag: '警报器有点敏感',
    comfort: '先不用把所有事都解决，给身体一分钟，把肩膀放下来。',
  },
  sad: {
    tag: '低电量保护中',
    comfort: '今天可以慢一点。你不是没用，只是需要被好好接住。',
  },
  calm: {
    tag: '湖面很稳',
    comfort: '这种平静值得被记下来，它也是一种力量。',
  },
  happy: {
    tag: '小太阳上线',
    comfort: '把这份轻快收进今天，它会成为之后的小燃料。',
  },
  energetic: {
    tag: '发芽加速中',
    comfort: '能量很好，也记得给自己留一点缓冲。',
  },
}

export function getMoodInsight(mood) {
  return MOOD_INSIGHTS[mood] || {
    tag: '正在校准',
    comfort: '不确定也没关系，先诚实地看见自己。',
  }
}
