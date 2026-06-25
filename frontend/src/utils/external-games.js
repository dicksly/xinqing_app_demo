export const EXTERNAL_MINI_GAMES = [
  {
    key: 'goose',
    title: '抓大鹅',
    enTitle: 'Goose Catch',
    desc: '外部小游戏链接待补充',
    enDesc: 'External mini-game link pending',
    url: '',
    needsProvidedLink: true,
  },
  {
    key: 'match3',
    title: '消消乐',
    enTitle: 'Match-3 Link',
    desc: '外部小游戏链接待补充',
    enDesc: 'External mini-game link pending',
    url: '',
    needsProvidedLink: true,
  },
  {
    key: 'fruitSlice',
    title: '切水果',
    enTitle: 'Fruit Slice Link',
    desc: '外部小游戏链接待补充',
    enDesc: 'External mini-game link pending',
    url: '',
    needsProvidedLink: true,
  },
]

export function getExternalGameLinks(overrides = {}) {
  return EXTERNAL_MINI_GAMES.map((game) => {
    const overrideUrl = overrides[game.key] || ''
    return {
      ...game,
      url: overrideUrl || game.url,
      needsProvidedLink: !(overrideUrl || game.url),
    }
  })
}
