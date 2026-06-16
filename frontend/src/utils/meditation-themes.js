const REFERENCE_ASSET_SOURCE = 'docs/references.md'

function withReferenceCover(theme) {
  return {
    ...theme,
    cover_image: `/reference-assets/meditation/months/${String(theme.month).padStart(2, '0')}.jpg`,
    asset_source: REFERENCE_ASSET_SOURCE,
  }
}

export const MONTHLY_BACKGROUND_THEMES = [
  { month: 1, key: 'jan-snow', zh: '一月 雪夜白噪音', en: 'January Snow Night', audio: '/audio/meditation/months/01-snow.mp3', sourceUrl: 'https://www.youtube.com/watch?v=MbW8YIv28wg' },
  { month: 2, key: 'feb-fire', zh: '二月 暖炉低语', en: 'February Hearth', audio: '/audio/meditation/months/02-hearth.mp3', sourceUrl: 'https://www.youtube.com/watch?v=NSKxvLWqyOY' },
  { month: 3, key: 'mar-rain', zh: '三月 春雨', en: 'March Spring Rain', audio: '/audio/meditation/months/03-rain.mp3', sourceUrl: 'https://www.youtube.com/watch?v=QXHHoBhMNXA' },
  { month: 4, key: 'apr-breeze', zh: '四月 微风', en: 'April Breeze', audio: '/audio/meditation/months/04-breeze.mp3', sourceUrl: 'https://youtu.be/4wNk0cgm9sA?si=lKgVtueq06VMGpOr' },
  { month: 5, key: 'may-forest', zh: '五月 森林', en: 'May Forest', audio: '/audio/meditation/months/05-forest.mp3', sourceUrl: 'https://youtu.be/aRtrd-VD--g?si=lf3U7PALe_BqWxRe' },
  { month: 6, key: 'jun-stream', zh: '六月 小溪', en: 'June Stream', audio: '/audio/meditation/months/06-stream.mp3', sourceUrl: 'https://youtu.be/8G8ZEWd8-yI?si=FF73XldkOca5Mj4R' },
  { month: 7, key: 'jul-cicada', zh: '七月 夏夜', en: 'July Summer Night', audio: '/audio/meditation/months/07-summer.mp3', sourceUrl: 'https://www.youtube.com/watch?v=f-i_nJLG2Is' },
  { month: 8, key: 'aug-ocean', zh: '八月 海浪', en: 'August Ocean', audio: '/audio/meditation/months/08-ocean.mp3', sourceUrl: 'https://www.youtube.com/watch?v=vpL1oZnhLuI' },
  { month: 9, key: 'sep-library', zh: '九月 图书馆', en: 'September Library', audio: '/audio/meditation/months/09-library.mp3', sourceUrl: 'https://www.youtube.com/watch?v=j_3C0z96GE0&t=14s' },
  { month: 10, key: 'oct-leaves', zh: '十月 落叶', en: 'October Leaves', audio: '/audio/meditation/months/10-leaves.mp3', sourceUrl: 'https://www.youtube.com/watch?v=x3bEJKm519c' },
  { month: 11, key: 'nov-blanket', zh: '十一月 毛毯雨声', en: 'November Blanket Rain', audio: '/audio/meditation/months/11-blanket.mp3', sourceUrl: 'https://www.youtube.com/watch?v=YT96FuHuhzc' },
  { month: 12, key: 'dec-bells', zh: '十二月 远处铃声', en: 'December Soft Bells', audio: '/audio/meditation/months/12-bells.mp3', sourceUrl: 'https://www.youtube.com/watch?v=eNPG8jGfJRk' },
].map(withReferenceCover)

export function getMonthlyTheme(month, themes = MONTHLY_BACKGROUND_THEMES) {
  return themes.find((theme) => theme.month === month) || themes[0]
}
