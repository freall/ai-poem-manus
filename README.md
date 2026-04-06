# 趣学诗词 - Poetry Learning App

一个游戏化、互动性强的少儿诗词学习网页应用，包含24节气和8个传统节日的78首经典诗词。

## 🎯 核心功能

- **78首诗词**：24节气（春夏秋冬各12首）+ 8个传统节日（共30首）
- **游戏化学习**：分类导航、诗词列表、详情展示、互动问答
- **AI配图**：每首诗都有高质量AI生成的儿童插画配图
- **成就系统**：8个可解锁徽章，学习进度追踪
- **互动问答**：每首诗3道题，答对显示庆祝动画，答错提示解释
- **完整诗词信息**：作者介绍、创作背景、白话文翻译
- **儿童友好设计**：大字体、明亮色彩、卡通图标、流畅动画

## 📋 诗词分类

### 24节气（48首）
- **春季**：立春、雨水、惊蛰、春分、清明、谷雨（各2首）
- **夏季**：立夏、小满、芒种、夏至、小暑、大暑（各2首）
- **秋季**：立秋、处暑、白露、秋分、寒露、霜降（各2首）
- **冬季**：立冬、小雪、大雪、冬至、小寒、大寒（各2首）

### 传统节日（30首）
- 春节、元宵节、寒食节、清明节、端午节、七夕节、中秋节、重阳节、除夕

## 🛠 技术栈

- **前端**：React 19 + Tailwind CSS 4 + Framer Motion
- **后端**：Express 4 + tRPC 11
- **数据库**：MySQL/TiDB
- **认证**：Manus OAuth
- **部署**：GitHub Pages + GitHub Actions

## 📦 项目结构

```
poetry-learning-app/
├── client/                    # 前端应用
│   ├── src/
│   │   ├── pages/            # 页面组件
│   │   ├── components/       # 可复用组件
│   │   ├── lib/              # 工具库
│   │   └── App.tsx           # 主应用
│   └── public/               # 静态资源
├── server/                    # 后端应用
│   ├── routers.ts            # API路由
│   ├── db.ts                 # 数据库查询
│   └── _core/                # 核心框架
├── drizzle/                  # 数据库schema
├── .github/workflows/        # GitHub Actions
└── package.json
```

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start

# 运行测试
pnpm test
```

### 环境变量

创建 `.env.local` 文件：

```env
DATABASE_URL=mysql://user:password@host:port/database
JWT_SECRET=your-secret-key
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
```

## 📚 API 端点

### 诗词管理
- `GET /api/trpc/poems.list` - 获取诗词列表
- `GET /api/trpc/poems.getByCategory` - 按分类获取诗词
- `GET /api/trpc/poems.getById` - 获取单首诗词详情

### 学习记录
- `POST /api/trpc/learning.recordAnswer` - 记录答题
- `GET /api/trpc/learning.getProgress` - 获取学习进度
- `GET /api/trpc/learning.getAchievements` - 获取成就

## 🎨 设计特色

- **儿童友好**：大字体（16px+）、明亮色彩、卡通风格图标
- **游戏化**：渐变紫粉蓝配色、流畅动画、成就徽章系统
- **响应式**：完美适配桌面、平板、手机
- **无障碍**：高对比度、键盘导航、屏幕阅读器支持

## 🔄 自动部署

项目配置了GitHub Actions自动部署流程：

1. **触发条件**：推送到 `main` 或 `master` 分支
2. **构建步骤**：
   - 检查TypeScript类型
   - 构建前端和后端
   - 生成生产版本
3. **部署**：自动部署到GitHub Pages

### 配置自定义域名

编辑 `.github/workflows/deploy.yml` 中的 `cname` 字段：

```yaml
- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./dist
    cname: your-domain.com  # 替换为您的域名
```

## 📊 学习数据

- **总诗词数**：78首
- **总问答题**：234道（每首3道）
- **成就徽章**：8个
- **学习分类**：32个（24节气 + 8节日）

## 🎓 教育价值

- 帮助儿童了解中国传统文化
- 学习古代诗词的意境和韵律
- 理解节气和传统节日的文化内涵
- 通过游戏化方式提高学习兴趣

## 📝 许可证

MIT License

## 👨‍💻 作者

Created with ❤️ by Manus AI

## 🤝 贡献

欢迎提交Issue和Pull Request！

---

**访问应用**：[GitHub Pages](https://freall.github.io/ai-poem-manus)

**GitHub仓库**：[ai-poem-manus](https://github.com/freall/ai-poem-manus)
