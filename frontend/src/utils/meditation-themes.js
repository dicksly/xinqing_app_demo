export const MONTHLY_BACKGROUND_THEMES = [
  { month: 1, key: 'jan-snow', zh: '一月 雪夜白噪音', en: 'January Snow Night', audio: '/audio/meditation/months/01-snow.mp3' },
  { month: 2, key: 'feb-fire', zh: '二月 暖炉低语', en: 'February Hearth', audio: '/audio/meditation/months/02-hearth.mp3' },
  { month: 3, key: 'mar-rain', zh: '三月 春雨', en: 'March Spring Rain', audio: '/audio/meditation/months/03-rain.mp3' },
  { month: 4, key: 'apr-breeze', zh: '四月 微风', en: 'April Breeze', audio: '/audio/meditation/months/04-breeze.mp3' },
  { month: 5, key: 'may-forest', zh: '五月 森林', en: 'May Forest', audio: '/audio/meditation/months/05-forest.mp3' },
  { month: 6, key: 'jun-stream', zh: '六月 小溪', en: 'June Stream', audio: '/audio/meditation/months/06-stream.mp3' },
  { month: 7, key: 'jul-cicada', zh: '七月 夏夜', en: 'July Summer Night', audio: '/audio/meditation/months/07-summer.mp3' },
  { month: 8, key: 'aug-ocean', zh: '八月 海浪', en: 'August Ocean', audio: '/audio/meditation/months/08-ocean.mp3' },
  { month: 9, key: 'sep-library', zh: '九月 图书馆', en: 'September Library', audio: '/audio/meditation/months/09-library.mp3' },
  { month: 10, key: 'oct-leaves', zh: '十月 落叶', en: 'October Leaves', audio: '/audio/meditation/months/10-leaves.mp3' },
  { month: 11, key: 'nov-blanket', zh: '十一月 毛毯雨声', en: 'November Blanket Rain', audio: '/audio/meditation/months/11-blanket.mp3' },
  { month: 12, key: 'dec-bells', zh: '十二月 远处铃声', en: 'December Soft Bells', audio: '/audio/meditation/months/12-bells.mp3' },
]

export function getMonthlyTheme(month, themes = MONTHLY_BACKGROUND_THEMES) {
  return themes.find((theme) => theme.month === month) || themes[0]
}
