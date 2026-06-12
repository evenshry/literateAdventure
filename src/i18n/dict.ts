import type { Language } from '@/store/languageStore';

export type DictKey =
  // Home
  | 'home.title'
  | 'home.subtitle_zh'
  | 'home.subtitle_en'
  | 'home.stars'
  | 'home.learned'
  | 'home.wrongBook'
  | 'home.continue_zh'
  | 'home.continue_en'
  | 'home.wrongBookBtn'
  | 'home.dashboardBtn'
  | 'home.selectIsland_zh'
  | 'home.selectIsland_en'
  | 'home.islandIcon_zh'
  | 'home.islandIcon_en'
  | 'home.lockedHint_zh'
  | 'home.lockedHint_en'
  | 'home.footer_zh'
  | 'home.footer_en'
  // Map
  | 'map.backHome'
  | 'map.starsTag'
  | 'map.emptyTitle_zh'
  | 'map.emptySub_zh'
  | 'map.emptyTitle_en'
  | 'map.emptySub_en'
  // Learn
  | 'learn.backMap'
  | 'learn.charMeta_zh'
  | 'learn.charMeta_en'
  | 'learn.speakChar'
  | 'learn.steps.play'
  | 'learn.steps.recognize'
  | 'learn.steps.write'
  | 'learn.steps.practice'
  | 'learn.steps.read'
  | 'learn.allDone_zh'
  | 'learn.allDone_en'
  | 'learn.backMapBtn'
  | 'learn.notFound_zh'
  | 'learn.notFound_en'
  | 'learn.backHomeBtn'
  | 'learn.kudos'
  // StepRecognize
  | 'step.recognize.title_zh'
  | 'step.recognize.title_en'
  | 'step.recognize.listen'
  | 'step.recognize.explain'
  | 'step.recognize.examplesTitle_zh'
  | 'step.recognize.examplesTitle_en'
  | 'step.recognize.sentencesTitle_zh'
  | 'step.recognize.sentencesTitle_en'
  | 'step.recognize.listenHint_zh'
  | 'step.recognize.listenHint_en'
  | 'step.recognize.confirm_zh'
  | 'step.recognize.confirm_en'
  | 'step.recognize.done_zh'
  | 'step.recognize.done_en'
  // StepWrite
  | 'step.write.title_zh'
  | 'step.write.title_en'
  | 'step.write.subtitle_zh'
  | 'step.write.subtitle_en'
  | 'step.write.showStroke_zh'
  | 'step.write.showStroke_en'
  | 'step.write.tryQuiz_zh'
  | 'step.write.tryQuiz_en'
  | 'step.write.confirm_zh'
  | 'step.write.confirm_en'
  | 'step.write.done_zh'
  | 'step.write.done_en'
  | 'step.write.skipHint_zh'
  | 'step.write.skipHint_en'
  // StepPractice
  | 'step.practice.title_zh'
  | 'step.practice.title_en'
  | 'step.practice.confirm_zh'
  | 'step.practice.confirm_en'
  | 'step.practice.done_zh'
  | 'step.practice.done_en'
  | 'step.practice.hintLabel_zh'
  | 'step.practice.hintLabel_en'
  // StepRead
  | 'step.read.title_zh'
  | 'step.read.title_en'
  | 'step.read.subtitle_zh'
  | 'step.read.subtitle_en'
  | 'step.read.listen'
  | 'step.read.record_zh'
  | 'step.read.record_en'
  | 'step.read.stop'
  | 'step.read.confirm_zh'
  | 'step.read.confirm_en'
  | 'step.read.done_zh'
  | 'step.read.done_en'
  // StepPlay
  | 'step.play.title_zh'
  | 'step.play.title_en'
  | 'step.play.subtitle_zh'
  | 'step.play.subtitle_en'
  | 'step.play.start_zh'
  | 'step.play.start_en'
  | 'step.play.shoot_zh'
  | 'step.play.shoot_en'
  | 'step.play.score_zh'
  | 'step.play.score_en'
  | 'step.play.confirm_zh'
  | 'step.play.confirm_en'
  | 'step.play.done_zh'
  | 'step.play.done_en'
  // Dashboard
  | 'dashboard.backHome'
  | 'dashboard.title'
  | 'dashboard.summary_zh'
  | 'dashboard.summary_en'
  | 'dashboard.learnedCount_zh'
  | 'dashboard.learnedCount_en'
  | 'dashboard.totalLearned_zh'
  | 'dashboard.totalLearned_en'
  | 'dashboard.starsEarned_zh'
  | 'dashboard.starsEarned_en'
  | 'dashboard.completedSteps_zh'
  | 'dashboard.completedSteps_en'
  | 'dashboard.islandProgress_zh'
  | 'dashboard.islandProgress_en'
  | 'dashboard.recentTitle_zh'
  | 'dashboard.recentTitle_en'
  | 'dashboard.empty_zh'
  | 'dashboard.empty_en'
  | 'dashboard.goMap_zh'
  | 'dashboard.goMap_en'
  | 'dashboard.review_zh'
  | 'dashboard.review_en'
  | 'dashboard.footer_zh'
  | 'dashboard.footer_en'
  // WrongBook
  | 'wrong.backHome'
  | 'wrong.title_zh'
  | 'wrong.title_en'
  | 'wrong.learnedLabel_zh'
  | 'wrong.learnedLabel_en'
  | 'wrong.starsLabel_zh'
  | 'wrong.starsLabel_en'
  | 'wrong.pendingLabel_zh'
  | 'wrong.pendingLabel_en'
  | 'wrong.emptyTitle_zh'
  | 'wrong.emptyTitle_en'
  | 'wrong.emptySub_zh'
  | 'wrong.emptySub_en'
  | 'wrong.listHint_zh'
  | 'wrong.listHint_en'
  | 'wrong.reviewTag_zh'
  | 'wrong.reviewTag_en'
  | 'wrong.reset_zh'
  | 'wrong.reset_en'
  | 'wrong.resetConfirm_zh'
  | 'wrong.resetConfirm_en'
  | 'wrong.soundOn'
  | 'wrong.soundOff'
  // Language switcher
  | 'lang.zh'
  | 'lang.en'
  | 'lang.switchHint_zh'
  | 'lang.switchHint_en'
  // Map level titles
  | 'island.L1.name'
  | 'island.L1.subtitle'
  | 'island.L2.name'
  | 'island.L2.subtitle'
  | 'island.L3.name'
  | 'island.L3.subtitle'
  | 'island.L4.name'
  | 'island.L4.subtitle'
  | 'island.EN1.name'
  | 'island.EN1.subtitle'
  | 'island.EN2.name'
  | 'island.EN2.subtitle'
  | 'island.EN3.name'
  | 'island.EN3.subtitle'
  | 'island.EN4.name'
  | 'island.EN4.subtitle';

type Dict = Record<DictKey, string>;

const zhDict: Dict = {
  'home.title': '识字冒险',
  'home.subtitle_zh': '点亮汉字，成为汉字勇士',
  'home.subtitle_en': '点亮汉字，成为汉字勇士',
  'home.stars': '星星',
  'home.learned': '学会',
  'home.wrongBook': '错字',
  'home.continue_zh': '继续冒险（{count} 字）',
  'home.continue_en': '继续冒险（{count} 字）',
  'home.wrongBookBtn': '错字本',
  'home.dashboardBtn': '家长看板',
  'home.selectIsland_zh': '选择岛屿',
  'home.selectIsland_en': '选择岛屿',
  'home.islandIcon_zh': '🏝️',
  'home.islandIcon_en': '🏝️',
  'home.lockedHint_zh': '🔒 累积 {stars} ⭐ 解锁',
  'home.lockedHint_en': '🔒 累积 {stars} ⭐ 解锁',
  'home.footer_zh': '每天学几个，汉字勇士就是你！',
  'home.footer_en': '每天学几个，汉字勇士就是你！',

  'map.backHome': '← 回家',
  'map.starsTag': '⭐ {stars}',
  'map.emptyTitle_zh': '🌱 字灵们还在沉睡中…',
  'map.emptySub_zh': '这片区域正在等待探索，请先挑战前面的岛屿吧！',
  'map.emptyTitle_en': '🌱 Words are still sleeping…',
  'map.emptySub_en': 'This area is waiting to be explored — try the earlier islands first!',

  'learn.backMap': '← 回地图',
  'learn.charMeta_zh': '听一听、看一看',
  'learn.charMeta_en': 'Listen & Look',
  'learn.speakChar': '点我发音',
  'learn.allDone_zh': '🎉 这个字已经全部学会啦！回地图继续冒险吧～',
  'learn.allDone_en': '🎉 All steps done! Head back to the map for more adventure～',
  'learn.backMapBtn': '回地图',
  'learn.notFound_zh': '找不到这个字，回到地图看看吧～',
  'learn.notFound_en': 'Hmm, can’t find this one — try the map?',
  'learn.backHomeBtn': '回首页',
  'learn.kudos': '真棒！',

  'learn.steps.play': '玩',
  'learn.steps.recognize': '认',
  'learn.steps.write': '写',
  'learn.steps.practice': '练',
  'learn.steps.read': '读',

  'step.recognize.title_zh': '👀 认一认这个字',
  'step.recognize.title_en': '👀 Meet the letter / word',
  'step.recognize.listen': '🔊 听一听',
  'step.recognize.explain': '💡 讲解',
  'step.recognize.examplesTitle_zh': '可以组词：',
  'step.recognize.examplesTitle_en': 'Words it can make:',
  'step.recognize.sentencesTitle_zh': '在句子里看一看：',
  'step.recognize.sentencesTitle_en': 'See it in a sentence:',
  'step.recognize.listenHint_zh': '（点一下听）',
  'step.recognize.listenHint_en': '(tap to listen)',
  'step.recognize.confirm_zh': '我认识啦！',
  'step.recognize.confirm_en': 'I know it!',
  'step.recognize.done_zh': '✓ 已经认识啦！',
  'step.recognize.done_en': '✓ Got it!',

  'step.write.title_zh': '✍️ 写一写',
  'step.write.title_en': '✍️ Trace & Write',
  'step.write.subtitle_zh': '先看笔顺，再自己写写看',
  'step.write.subtitle_en': 'Watch the strokes, then have a try',
  'step.write.showStroke_zh': '👁 演示笔顺',
  'step.write.showStroke_en': '👁 Show strokes',
  'step.write.tryQuiz_zh': '✏️ 我来写写看',
  'step.write.tryQuiz_en': '✏️ Trace it!',
  'step.write.confirm_zh': '我写好啦！',
  'step.write.confirm_en': 'I did it!',
  'step.write.done_zh': '✓ 已经写过啦',
  'step.write.done_en': '✓ Traced',
  'step.write.skipHint_zh': '（字母/单词暂不支持笔顺，点一下发音后继续吧）',
  'step.write.skipHint_en': '(Strokes are not available for letters — tap to listen, then continue)',

  'step.practice.title_zh': '🎯 练一练',
  'step.practice.title_en': '🎯 Practice',
  'step.practice.confirm_zh': '继续冒险！',
  'step.practice.confirm_en': 'Keep going!',
  'step.practice.done_zh': '✓ 已经练过啦',
  'step.practice.done_en': '✓ Practiced',
  'step.practice.hintLabel_zh': '💡 小提示：',
  'step.practice.hintLabel_en': '💡 Hint:',

  'step.read.title_zh': '🔊 读一读',
  'step.read.title_en': '🔊 Read it out',
  'step.read.subtitle_zh': '听一听，再自己读一读',
  'step.read.subtitle_en': 'Listen, then say it out loud',
  'step.read.listen': '🔊 听示范',
  'step.read.record_zh': '🎙 录一下',
  'step.read.record_en': '🎙 Record',
  'step.read.stop': '⏹ 停止',
  'step.read.confirm_zh': '读完啦！',
  'step.read.confirm_en': 'All read!',
  'step.read.done_zh': '✓ 读过啦',
  'step.read.done_en': '✓ Read',

  'step.play.title_zh': '🎮 玩一玩',
  'step.play.title_en': '🎮 Play a game',
  'step.play.subtitle_zh': '射击带这个字的气球吧！',
  'step.play.subtitle_en': 'Pop the balloons with this letter / word!',
  'step.play.start_zh': '▶ 开始游戏',
  'step.play.start_en': '▶ Start',
  'step.play.shoot_zh': '🎯 点击气球射击！',
  'step.play.shoot_en': '🎯 Tap the balloons to shoot!',
  'step.play.score_zh': '得分：{score}',
  'step.play.score_en': 'Score: {score}',
  'step.play.confirm_zh': '玩够啦！',
  'step.play.confirm_en': 'All done!',
  'step.play.done_zh': '✓ 玩过啦',
  'step.play.done_en': '✓ Played',

  'dashboard.backHome': '← 回首页',
  'dashboard.title': '📊 家长看板',
  'dashboard.summary_zh': '学习概况',
  'dashboard.summary_en': 'Learning summary',
  'dashboard.learnedCount_zh': '已学会的字',
  'dashboard.learnedCount_en': 'Learned',
  'dashboard.totalLearned_zh': '累计学习过',
  'dashboard.totalLearned_en': 'Total touched',
  'dashboard.starsEarned_zh': '获得星星',
  'dashboard.starsEarned_en': 'Stars earned',
  'dashboard.completedSteps_zh': '完成的小环节',
  'dashboard.completedSteps_en': 'Steps completed',
  'dashboard.islandProgress_zh': '各岛屿进度',
  'dashboard.islandProgress_en': 'Progress by island',
  'dashboard.recentTitle_zh': '最近学习的字',
  'dashboard.recentTitle_en': 'Recently studied',
  'dashboard.empty_zh': '还没有学习记录，去冒险地图开始吧！',
  'dashboard.empty_en': 'No study records yet — start from the adventure map!',
  'dashboard.goMap_zh': '去冒险地图',
  'dashboard.goMap_en': 'Go to map',
  'dashboard.review_zh': '复习',
  'dashboard.review_en': 'Review',
  'dashboard.footer_zh': '数据全部保存在本地浏览器（IndexedDB），清除浏览器数据会丢失进度哦。',
  'dashboard.footer_en': 'All data is saved locally in your browser (IndexedDB) — clearing browser data will erase progress.',

  'wrong.backHome': '← 回首页',
  'wrong.title_zh': '📚 错字本',
  'wrong.title_en': '📚 Review list',
  'wrong.learnedLabel_zh': '学会的字',
  'wrong.learnedLabel_en': 'Learned',
  'wrong.starsLabel_zh': '总星星',
  'wrong.starsLabel_en': 'Total stars',
  'wrong.pendingLabel_zh': '待复习',
  'wrong.pendingLabel_en': 'To review',
  'wrong.emptyTitle_zh': '错字本空空如也！',
  'wrong.emptyTitle_en': 'Nothing to review!',
  'wrong.emptySub_zh': '太棒了，现在没有需要复习的字。继续加油！',
  'wrong.emptySub_en': 'Great — everything is fresh. Keep it up!',
  'wrong.listHint_zh': '点一点，再认一次：',
  'wrong.listHint_en': 'Tap to review again:',
  'wrong.reviewTag_zh': '复习',
  'wrong.reviewTag_en': 'Review',
  'wrong.reset_zh': '重置学习进度',
  'wrong.reset_en': 'Reset progress',
  'wrong.resetConfirm_zh': '确定要重置所有学习进度吗？此操作不可撤销。',
  'wrong.resetConfirm_en': 'Reset ALL progress? This can’t be undone.',
  'wrong.soundOn': '🔊 声音已开启',
  'wrong.soundOff': '🔈 声音已关闭',

  'lang.zh': '中文',
  'lang.en': 'English',
  'lang.switchHint_zh': '切换为英文学习模式',
  'lang.switchHint_en': 'Switch to Chinese mode',

  'island.L1.name': '启蒙岛',
  'island.L1.subtitle': '认识最基础的汉字',
  'island.L2.name': '基础岛',
  'island.L2.subtitle': '日常生活常用字',
  'island.L3.name': '成长岛',
  'island.L3.subtitle': '动物花草好伙伴',
  'island.L4.name': '进阶岛',
  'island.L4.subtitle': '动作情感真丰富',
  'island.EN1.name': 'ABC Island',
  'island.EN1.subtitle': 'Meet the 26 letters',
  'island.EN2.name': 'Word Garden',
  'island.EN2.subtitle': 'Easy 3-letter words',
  'island.EN3.name': 'Sight-World',
  'island.EN3.subtitle': 'Common sight words',
  'island.EN4.name': 'Story Cove',
  'island.EN4.subtitle': 'Short phrases & sentences',
};

const enDict: Dict = {
  'home.title': 'Literate Adventure',
  'home.subtitle_zh': 'Light up characters, become a word hero',
  'home.subtitle_en': 'Light up letters & words, become a word hero',
  'home.stars': 'Stars',
  'home.learned': 'Learned',
  'home.wrongBook': 'Review',
  'home.continue_zh': 'Continue ({count} chars)',
  'home.continue_en': 'Continue ({count} words)',
  'home.wrongBookBtn': 'Review Book',
  'home.dashboardBtn': 'Parent Dashboard',
  'home.selectIsland_zh': 'Choose an island',
  'home.selectIsland_en': 'Choose an island',
  'home.islandIcon_zh': '🏝️',
  'home.islandIcon_en': '🏝️',
  'home.lockedHint_zh': '🔒 Earn {stars} ⭐ to unlock',
  'home.lockedHint_en': '🔒 Earn {stars} ⭐ to unlock',
  'home.footer_zh': 'Learn a few every day, and you’ll be a word hero!',
  'home.footer_en': 'Learn a few every day, and you’ll be a word hero!',

  'map.backHome': '← Home',
  'map.starsTag': '⭐ {stars}',
  'map.emptyTitle_zh': '🌱 Characters are still sleeping…',
  'map.emptySub_zh': 'This area waits to be explored — try earlier islands first!',
  'map.emptyTitle_en': '🌱 Words are still sleeping…',
  'map.emptySub_en': 'This area waits to be explored — try earlier islands first!',

  'learn.backMap': '← Back to map',
  'learn.charMeta_zh': 'Listen & look',
  'learn.charMeta_en': 'Listen & look',
  'learn.speakChar': 'Tap to hear',
  'learn.allDone_zh': '🎉 All steps done! Head back to the map for more～',
  'learn.allDone_en': '🎉 All steps done! Head back to the map for more～',
  'learn.backMapBtn': 'Back to map',
  'learn.notFound_zh': "Can't find this character — try the map?",
  'learn.notFound_en': "Can't find this word — try the map?",
  'learn.backHomeBtn': 'Back home',
  'learn.kudos': 'Great job!',

  'learn.steps.play': 'Play',
  'learn.steps.recognize': 'Meet',
  'learn.steps.write': 'Write',
  'learn.steps.practice': 'Practice',
  'learn.steps.read': 'Read',

  'step.recognize.title_zh': '👀 Meet the character',
  'step.recognize.title_en': '👀 Meet the letter / word',
  'step.recognize.listen': '🔊 Listen',
  'step.recognize.explain': '💡 Explain',
  'step.recognize.examplesTitle_zh': 'Words it makes:',
  'step.recognize.examplesTitle_en': 'Words it can make:',
  'step.recognize.sentencesTitle_zh': 'See it in a sentence:',
  'step.recognize.sentencesTitle_en': 'See it in a sentence:',
  'step.recognize.listenHint_zh': '(tap to listen)',
  'step.recognize.listenHint_en': '(tap to listen)',
  'step.recognize.confirm_zh': 'I know it!',
  'step.recognize.confirm_en': 'I know it!',
  'step.recognize.done_zh': '✓ Got it!',
  'step.recognize.done_en': '✓ Got it!',

  'step.write.title_zh': '✍️ Trace & Write',
  'step.write.title_en': '✍️ Trace & Write',
  'step.write.subtitle_zh': 'Watch the strokes, then try yourself',
  'step.write.subtitle_en': 'Watch the strokes, then try yourself',
  'step.write.showStroke_zh': '👁 Show strokes',
  'step.write.showStroke_en': '👁 Show strokes',
  'step.write.tryQuiz_zh': '✏️ Trace it!',
  'step.write.tryQuiz_en': '✏️ Trace it!',
  'step.write.confirm_zh': 'I did it!',
  'step.write.confirm_en': 'I did it!',
  'step.write.done_zh': '✓ Traced',
  'step.write.done_en': '✓ Traced',
  'step.write.skipHint_zh': '(Strokes are not available for letters — tap to listen, then keep going!)',
  'step.write.skipHint_en': '(Strokes are not available for letters — tap to listen, then keep going!)',

  'step.practice.title_zh': '🎯 Practice',
  'step.practice.title_en': '🎯 Practice',
  'step.practice.confirm_zh': 'Keep going!',
  'step.practice.confirm_en': 'Keep going!',
  'step.practice.done_zh': '✓ Practiced',
  'step.practice.done_en': '✓ Practiced',
  'step.practice.hintLabel_zh': '💡 Hint:',
  'step.practice.hintLabel_en': '💡 Hint:',

  'step.read.title_zh': '🔊 Read it out',
  'step.read.title_en': '🔊 Read it out',
  'step.read.subtitle_zh': 'Listen, then say it out loud',
  'step.read.subtitle_en': 'Listen, then say it out loud',
  'step.read.listen': '🔊 Listen',
  'step.read.record_zh': '🎙 Record',
  'step.read.record_en': '🎙 Record',
  'step.read.stop': '⏹ Stop',
  'step.read.confirm_zh': 'All read!',
  'step.read.confirm_en': 'All read!',
  'step.read.done_zh': '✓ Read',
  'step.read.done_en': '✓ Read',

  'step.play.title_zh': '🎮 Play a game',
  'step.play.title_en': '🎮 Play a game',
  'step.play.subtitle_zh': 'Pop balloons with this character!',
  'step.play.subtitle_en': 'Pop balloons with this letter / word!',
  'step.play.start_zh': '▶ Start',
  'step.play.start_en': '▶ Start',
  'step.play.shoot_zh': '🎯 Tap balloons to shoot!',
  'step.play.shoot_en': '🎯 Tap balloons to shoot!',
  'step.play.score_zh': 'Score: {score}',
  'step.play.score_en': 'Score: {score}',
  'step.play.confirm_zh': 'All done!',
  'step.play.confirm_en': 'All done!',
  'step.play.done_zh': '✓ Played',
  'step.play.done_en': '✓ Played',

  'dashboard.backHome': '← Home',
  'dashboard.title': '📊 Parent Dashboard',
  'dashboard.summary_zh': 'Learning summary',
  'dashboard.summary_en': 'Learning summary',
  'dashboard.learnedCount_zh': 'Characters learned',
  'dashboard.learnedCount_en': 'Words learned',
  'dashboard.totalLearned_zh': 'Total touched',
  'dashboard.totalLearned_en': 'Total touched',
  'dashboard.starsEarned_zh': 'Stars earned',
  'dashboard.starsEarned_en': 'Stars earned',
  'dashboard.completedSteps_zh': 'Steps completed',
  'dashboard.completedSteps_en': 'Steps completed',
  'dashboard.islandProgress_zh': 'Progress by island',
  'dashboard.islandProgress_en': 'Progress by island',
  'dashboard.recentTitle_zh': 'Recently studied',
  'dashboard.recentTitle_en': 'Recently studied',
  'dashboard.empty_zh': 'No study records yet — start from the adventure map!',
  'dashboard.empty_en': 'No study records yet — start from the adventure map!',
  'dashboard.goMap_zh': 'Go to map',
  'dashboard.goMap_en': 'Go to map',
  'dashboard.review_zh': 'Review',
  'dashboard.review_en': 'Review',
  'dashboard.footer_zh': 'All data is saved locally in your browser (IndexedDB) — clearing browser data will erase progress.',
  'dashboard.footer_en': 'All data is saved locally in your browser (IndexedDB) — clearing browser data will erase progress.',

  'wrong.backHome': '← Home',
  'wrong.title_zh': '📚 Review Book',
  'wrong.title_en': '📚 Review Book',
  'wrong.learnedLabel_zh': 'Learned',
  'wrong.learnedLabel_en': 'Learned',
  'wrong.starsLabel_zh': 'Total stars',
  'wrong.starsLabel_en': 'Total stars',
  'wrong.pendingLabel_zh': 'To review',
  'wrong.pendingLabel_en': 'To review',
  'wrong.emptyTitle_zh': 'Review book is empty!',
  'wrong.emptyTitle_en': 'Review book is empty!',
  'wrong.emptySub_zh': 'Awesome — nothing to review right now. Keep it up!',
  'wrong.emptySub_en': 'Awesome — nothing to review right now. Keep it up!',
  'wrong.listHint_zh': 'Tap to review again:',
  'wrong.listHint_en': 'Tap to review again:',
  'wrong.reviewTag_zh': 'Review',
  'wrong.reviewTag_en': 'Review',
  'wrong.reset_zh': 'Reset progress',
  'wrong.reset_en': 'Reset progress',
  'wrong.resetConfirm_zh': 'Reset ALL progress? This cannot be undone.',
  'wrong.resetConfirm_en': 'Reset ALL progress? This cannot be undone.',
  'wrong.soundOn': '🔊 Sound on',
  'wrong.soundOff': '🔈 Sound off',

  'lang.zh': '中文',
  'lang.en': 'English',
  'lang.switchHint_zh': 'Switch to English learning mode',
  'lang.switchHint_en': '切换到中文学习模式',

  'island.L1.name': '启蒙岛',
  'island.L1.subtitle': '认识最基础的汉字',
  'island.L2.name': '基础岛',
  'island.L2.subtitle': '日常生活常用字',
  'island.L3.name': '成长岛',
  'island.L3.subtitle': '动物花草好伙伴',
  'island.L4.name': '进阶岛',
  'island.L4.subtitle': '动作情感真丰富',
  'island.EN1.name': 'ABC Island',
  'island.EN1.subtitle': 'Meet the 26 letters',
  'island.EN2.name': 'Word Garden',
  'island.EN2.subtitle': 'Easy 3-letter words',
  'island.EN3.name': 'Sight-World',
  'island.EN3.subtitle': 'Common sight words',
  'island.EN4.name': 'Story Cove',
  'island.EN4.subtitle': 'Short phrases & sentences',
};

const DICTS: Record<Language, Dict> = {
  zh: zhDict,
  en: enDict,
};

export function t(language: Language, key: DictKey, vars?: Record<string, string | number>): string {
  const dict = DICTS[language] ?? DICTS.en;
  let text = dict[key] ?? zhDict[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return text;
}
