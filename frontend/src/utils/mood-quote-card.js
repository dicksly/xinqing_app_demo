export const MOOD_QUOTE_CARDS = {
  anxious: {
    mood: 'anxious',
    title: '安稳日签',
    quote: '先把呼吸放慢一点，今天不需要一次解决所有事。',
    caption: '给紧绷的身体一点安全感',
    tone: 'rose',
    symbol: '∿',
    gradient: ['#F7D8E1', '#FFF7F2'],
  },
  sad: {
    mood: 'sad',
    title: '陪伴日签',
    quote: '低电量也值得被温柔对待，你可以慢慢回来。',
    caption: '给低落的自己留一盏小灯',
    tone: 'blue',
    symbol: '☾',
    gradient: ['#E2ECF8', '#F8F4FF'],
  },
  calm: {
    mood: 'calm',
    title: '平静日签',
    quote: '这份安静不是空白，是你正在好好安放自己。',
    caption: '把稳定感轻轻收好',
    tone: 'sage',
    symbol: '⌁',
    gradient: ['#DDEFE5', '#FFF9ED'],
  },
  happy: {
    mood: 'happy',
    title: '小太阳日签',
    quote: '把今天的亮光记下来，它会成为之后的小燃料。',
    caption: '让好心情多停留一会儿',
    tone: 'gold',
    symbol: '✦',
    gradient: ['#FFF0C8', '#FFF7E8'],
  },
  energetic: {
    mood: 'energetic',
    title: '发芽日签',
    quote: '能量正在发芽，也记得给自己留一点缓冲。',
    caption: '把活力用在真正重要的地方',
    tone: 'coral',
    symbol: '✺',
    gradient: ['#F8DFD2', '#FFF4ED'],
  },
}

export function getMoodQuoteCard(mood) {
  return MOOD_QUOTE_CARDS[mood] || {
    mood: mood || 'unknown',
    title: '日签语录',
    quote: '不确定也没关系，诚实看见自己就是今天的开始。',
    caption: '给此刻的自己一点空间',
    tone: 'sage',
    symbol: '•',
    gradient: ['#DDEFE5', '#FFF9ED'],
  }
}

export function buildMoodQuoteShareText(card) {
  return `${card.title}：${card.quote} —— 心情疗愈`
}
