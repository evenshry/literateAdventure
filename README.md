# Literate Adventure

一个基于 React + TypeScript 的汉字学习应用，通过互动式学习帮助用户掌握汉字书写、拼音和笔画。

## 🎮 在线演示

访问 [https://evenshry.github.io/literateAdventure/](https://evenshry.github.io/literateAdventure/) 体验完整功能。

## ✨ 功能特性

- **📝 汉字书写练习**：使用 hanzi-writer 实现笔画追踪和书写练习
- **📖 拼音学习**：支持拼音显示和发音
- **🎨 笔画动画**：动态展示汉字笔画顺序
- **📊 学习进度管理**：使用 Zustand 管理学习状态，IndexedDB 持久化存储
- **❌ 错题本**：记录和复习错误汉字
- **🗺️ 学习地图**：多关卡学习路径，逐步提升
- **⭐ 成就系统**：完成学习任务获得星星奖励
- **🔊 语音播放**：支持汉字发音和音效

## 🛠️ 技术栈

- **框架**：React 18.3.1 + TypeScript
- **构建工具**：Vite 5.0
- **路由**：React Router v6
- **状态管理**：Zustand
- **样式**：Sass + CSS Modules
- **汉字处理**：hanzi-writer + hanzi-writer-data
- **本地存储**：IndexedDB (idb)
- **代码规范**：ESLint + Prettier + Husky

## 📦 安装

```bash
# 克隆项目
git clone <repository-url>
cd literateAdventure

# 安装依赖
yarn install
```

## 🚀 运行

```bash
# 开发模式
yarn dev

# 预览生产构建
yarn preview
```

## 🏗️ 构建

```bash
# 生产构建
yarn build

# 部署构建
yarn deploy
```

## 📁 项目结构

```
src/
├── components/          # 通用组件
│   ├── StarCelebration/ # 星星庆祝动画
│   ├── StepPractice/    # 练习步骤
│   ├── StepRead/        # 阅读步骤
│   ├── StepRecognize/   # 识别步骤
│   ├── StepWrite/       # 书写步骤
│   └── StrokeAnimation/ # 笔画动画
├── data/                # 数据文件
│   ├── levels/          # 关卡数据 (L1-L4)
│   └── hanziData.ts     # 汉字数据
├── hooks/               # 自定义 Hooks
│   └── useSound.ts      # 音效 Hook
├── pages/               # 页面组件
│   ├── Dashboard/       # 仪表盘
│   ├── Home/            # 首页
│   ├── Learn/           # 学习页面
│   ├── Map/             # 学习地图
│   ├── TestStroke/      # 笔画测试
│   └── WrongBook/       # 错题本
├── routes/              # 路由配置
├── store/               # 状态管理
│   └── progressStore.ts # 进度状态
├── styles/              # 全局样式
│   ├── global.scss      # 全局样式
│   ├── mixins.scss      # Sass 混入
│   └── variables.scss   # Sass 变量
├── types/               # TypeScript 类型定义
├── utils/               # 工具函数
│   ├── db.ts            # IndexedDB 操作
│   ├── helpers.ts       # 辅助函数
│   ├── pinyin.ts        # 拼音处理
│   ├── sound.ts         # 音频处理
│   └── speech.ts        # 语音合成
├── App.tsx              # 应用主组件
└── main.tsx             # 应用入口
```

## 🎯 开发指南

### 代码规范

项目使用 ESLint + Prettier + Husky 保证代码质量：

```bash
# 运行 ESLint
yarn lint

# 格式化代码
yarn format
```

### 提交规范

项目使用 Husky + lint-staged 在提交前自动检查和格式化代码。

### 组件开发

- 使用函数组件 + Hooks
- 每个组件独立文件夹，包含 `.tsx`、`.module.scss`、`types.ts`
- 使用 CSS Modules 避免样式冲突
- Props 必须明确定义 TypeScript 类型

### 状态管理

使用 Zustand 管理全局状态，支持持久化存储到 IndexedDB。

## 🌐 浏览器支持

- Chrome >= 80
- Firefox >= 75
- Safari >= 13
- Edge >= 80

## 📄 License

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**开发核心原则**：类型优先、样式隔离、组件复用、状态可控、性能意识、规范落地
