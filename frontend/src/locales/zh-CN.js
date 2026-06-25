export default {
  // 通用
  common: {
    loading: '加载中...',
    confirm: '确认',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    close: '关闭',
    submit: '提交',
    success: '成功',
    error: '失败',
    warning: '警告',
    login: '登录',
    logout: '退出登录',
    register: '注册',
    username: '用户名',
    password: '密码',
    confirmPassword: '确认密码',
  },

  // 导航
  nav: {
    home: '首页',
    emotion: '情绪',
    mindfulness: '正念',
    treehole: '树洞',
    knowledge: '知识',
    profile: '我的',
    profileShort: '我',
  },

  home: {
    title: '心灵疗愈站',
    subtitle: '让心灵像果园一样温暖地治愈',
    statusRecord: '状态记录',
    statusDesc: '记录今日情绪状态\n与压力水平',
    mindfulness: '正念练习',
    mindfulnessDesc: '冥想引导与\n放松小游戏',
    treehole: '树洞倾诉',
    treeholeDesc: '倾诉心声，获得\n情感支持',
    knowledge: '心理充电',
    knowledgeDesc: '轻松获取实用的\n心理学内容',
    dailyNote: '今日陪伴',
    dailyNoteDesc: '慢一点也没关系，你已经在认真照顾自己了。',
    streak: '柔软提醒',
    streakDesc: '打开一个小模块，给今天一点点温柔回应。',
  },

  // 情绪打卡
  emotion: {
    title: '今日心情打卡',
    weeklyReport: '本周报告',
    basicStatus: '基础状态',
    energyLevel: '能量水平',
    sleepQuality: '睡眠质量',
    stressSources: '压力来源',
    socialPreference: '社交意愿',
    happyMoment: '微光时刻',
    happyMomentPlaceholder: '记录今日一件小确幸...（最多50字）',
    getInspiration: '换一个灵感',
    submitCheckin: '完成打卡',

    // 心情类型
    mood: {
      anxious: '焦虑',
      sad: '丧',
      calm: '平静',
      happy: '开心',
      energetic: '元气',
    },

    // 压力来源
    stress: {
      work: '#工作',
      interpersonal: '#人际',
      family: '#家庭',
      money: '#金钱',
      health: '#健康',
      none: '#无原因',
    },

    // 社交意愿
    social: {
      alone: '想独处充电',
      social: '想找人贴贴',
    },

    // 周报
    report: {
      checkinDays: '打卡天数',
      avgEnergy: '平均能量',
      avgSleep: '平均睡眠',
      happyMoments: '微光时刻',
      topStressSources: '主要压力源',
      noData: '暂无本周数据',
    },
  },

  // 正念实验室
  mindfulness: {
    meditationTitle: '场景化冥想',
    breathingTitle: '4-7-8 呼吸训练',
    gamesTitle: '解压小游戏',
    selectDuration: '选择时长',
    volumeControl: '音量调节',
    voice: '人声',
    bgMusic: '背景音',
    bgMusicType: '背景音类型',
    startMeditation: '开始冥想',
    pauseMeditation: '暂停冥想',

    // 冥想类型
    meditation: {
      sleep: '睡眠助眠',
      sleepDesc: '帮助进入深度睡眠',
      wake: '晨间唤醒',
      wakeDesc: '开启元气满满的一天',
      stress: '抗压训练',
      stressDesc: '提升专注力和信心',
      emergency: '情绪急救',
      emergencyDesc: '快速平复情绪',
    },

    // 呼吸训练
    breathing: {
      inhale: '吸气...',
      hold: '屏息...',
      exhale: '呼气...',
      ready: '准备',
      startTraining: '开始训练',
      pauseTraining: '暂停训练',
      trainingComplete: '训练完成！',
      description: '4-7-8 呼吸法是一种简单但有效的放松技巧',
      step1: '用鼻子吸气 4 秒',
      step2: '屏住呼吸 7 秒',
      step3: '用嘴巴呼气 8 秒',
      step4: '重复 3-4 次',
    },

    // 游戏
    games: {
      bubble: '捏泡泡纸',
      bubbleDesc: '释放压力',
      soap: '切肥皂',
      soapDesc: '看着泡沫破裂',
      organize: '整理收纳',
      organizeDesc: '秩序感带来平静',
      mandala: '曼陀罗涂色',
      mandalaDesc: '专注当下',
      comingSoon: '即将推出',
    },
  },

  // 树洞
  treehole: {
    title: '倾诉你的心声',
    squareTitle: '树洞广场',
    latest: '最新',
    mine: '我的',

    // 内容类型
    contentType: {
      text: '文字',
      voice: '语音',
      image: '图片',
    },

    // 输入提示
    placeholder: '把这里当作树洞，说出你的烦恼、痛苦或心事...',
    voiceChange: '变声处理（保护隐私）',
    anonymous: '匿名发布',
    publishToSquare: '发布到广场',
    sendToTreehole: '发送到树洞',

    // 录音
    startRecording: '点击开始录音',
    stopRecording: '点击停止',
    recordingComplete: '录音完成',
    recordingTooShort: '录音时间太短，请重新录制',

    // AI 响应
    aiResponse: 'AI 倾听回应',
    caringReminder: '关心提醒',
    gentleReminder: '温馨提示',
    helpHotline: '全国心理援助热线',
    lifeHotline: '生命热线',

    // 背景音类型
    bgMusic: {
      whiteNoise: '白噪音',
      rain: '雨声',
      forest: '森林',
      alphaWave: '阿尔法波',
    },
  },

  // 知识充电站
  knowledge: {
    dailyQuote: '晨曦语录（每日金句）',
    video: '视频',
    test: '测试',
    article: '文章',
    topic: '专题',

    // 测试
    testQuestions: '问题',
    submitTest: '提交测试',
    testComplete: '测试完成',
    testResult: '测试结果分析',
    testSuggestion: '建议',

    // 测试类型
    tests: {
      mbti: 'MBTI 人格类型简化版',
      mbtiDesc: '探索你的性格类型，了解自己',
      stress: '压力自测表',
      stressDesc: '评估你当前的压力水平',
      attachment: '依恋类型测试',
      attachmentDesc: '了解你在亲密关系中的依恋模式',
    },

    // 专题状态
    topicStatus: {
      active: '进行中',
      pending: '即将开始',
      planned: '规划中',
    },

    // 其他
    contentCount: '个内容',
    favorite: '收藏',
    viewCount: '次浏览',
  },

  // 个人中心
  profile: {
    loginPrompt: '登录解锁更多功能',
    loginDesc: '登录后可以同步您的数据，跨设备使用',
    myData: '我的数据',
    checkinDays: '打卡天数',
    meditationMinutes: '冥想时长(分)',
    treeholeCount: '树洞倾诉',
    gameCount: '游戏次数',

    // 菜单
    myRecords: '我的记录',
    favorites: '收藏内容',
    settings: '设置',
    about: '关于我们',
    feedback: '意见反馈',
    privacy: '隐私政策',

    // 统计
    stats: {
      checkinDays: '打卡天数',
      meditationMinutes: '冥想时长(分)',
      treeholeCount: '树洞倾诉',
      gameCount: '游戏次数',
    },
  },

  // 认证
  auth: {
    loginTitle: '登录',
    registerTitle: '注册',
    noAccount: '没有账号？去注册',
    hasAccount: '已有账号？去登录',
    loginSuccess: '登录成功',
    registerSuccess: '注册成功',
    loginFailed: '登录失败',
    registerFailed: '注册失败',
    dataSynced: '游戏数据已同步',

    // 验证
    usernameRequired: '请输入用户名',
    usernameLength: '用户名长度为 3-20 个字符',
    passwordRequired: '请输入密码',
    passwordLength: '密码长度为 6-50 个字符',
    confirmPasswordRequired: '请确认密码',
    passwordMismatch: '两次输入密码不一致',
  },

  // 主题
  theme: {
    lightMode: '亮色模式',
    darkMode: '暗色模式',
    lightShort: '日',
    darkShort: '夜',
  },

  // 语言
  language: {
    zh: '中文',
    en: 'English',
  },
}
