# FitPlan - 个性化健身方案制定系统

> 输入你的身体数据，一键生成专属的增肌/减脂饮食方案与训练计划

## 项目简介

FitPlan 是一款面向健身爱好者的个性化方案生成平台，核心计算逻辑基于 [好人松松](https://space.bilibili.com/) 的《健身 Excel 超级套表》，涵盖 8 步热量计算、14 种饮食方案模板和 9 种力量预测公式，帮助用户告别繁琐的手动计算，快速获得科学、专业的增肌减脂指导。

## 功能亮点

### 方案生成（核心）

- **8 步算法**：BMI → BMR → TDEE → 力训消耗 → 有氧消耗 → 维持热量 → 目标热量 → 宏量营养素
- **14 种饮食方案**：减脂 8 种 + 增肌 7 种（按训练时段 × 目标组合）
- **每餐精准分配**：力训日/休息日分别输出早/中/晚/加餐的碳水、蛋白质、脂肪克数与食物建议
- **运动建议**：根据目标自动输出训练注意事项和饮食提示

### 训练计划

- 健身房三分化（背+肩后束+肱二头 / 胸+肩前中束+肱三头 / 腿+臀）
- 健身房四分化（肩单练版 / 手臂单练版）
- 居家三分化训练计划
- 力量预测计算器（Adams / Brown / Brzycki / Lander / Lombardi / Mayhew / O'Connor / Wathen / Welday 共 9 种公式）

### 科普知识库

- 减脂问答 26 条 + 增肌问答 18 条
- 食物营养率数据库（碳水/蛋白质/脂肪分类，含 GI 指数）
- 拉伸图谱（上身/下身）
- 肌肉解剖知识

### 用户系统

- 注册 / 登录（JWT + bcrypt 加密）
- 身体数据录入与编辑
- 体重记录与趋势图表（Recharts 可视化）
- 方案历史管理（查看 / 删除）

### 管理后台

- 用户列表与详情查看
- 数据统计概览

## 技术栈

| 层级 | 技术 |
|------|------|
| **前端** | React 18 + TypeScript + Vite 5 + TailwindCSS 3 + MUI 5 |
| **状态管理** | Zustand |
| **表单校验** | React Hook Form + Zod |
| **图表** | Recharts |
| **后端** | Node.js + Express 4 + TypeScript |
| **ORM** | Prisma 5 |
| **认证** | JWT + bcryptjs |
| **数据库(开发)** | SQLite |
| **数据库(生产)** | PostgreSQL |

## 项目结构

```
FitPlan/
├── client/                  # 前端 (React + Vite)
│   ├── src/
│   │   ├── pages/           # 16 个业务页面
│   │   ├── components/      # 通用组件
│   │   ├── stores/          # Zustand 状态管理
│   │   ├── hooks/           # 自定义 Hooks
│   │   ├── api/             # Axios 请求封装
│   │   └── App.tsx          # 路由配置 (17 条路由 + 懒加载 + 路由守卫)
│   └── package.json
├── server/                  # 后端 (Express + Prisma)
│   ├── prisma/
│   │   ├── schema.prisma    # 7 个数据模型
│   │   └── seed.ts          # 初始化数据 (49 种食物 + 44 条 QA + 14 个训练计划)
│   ├── src/
│   │   ├── routes/          # 6 组 RESTful API
│   │   ├── services/        # 核心业务逻辑 (方案生成 / 餐序分配 / 力量预测)
│   │   ├── middlewares/     # JWT 认证 / 错误处理 / Zod 校验
│   │   └── config/          # 环境配置
│   └── package.json
└── docs/                    # 产品文档
    ├── prd.md               # 产品需求文档
    └── architecture.md      # 系统架构设计
```

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 1. 克隆项目

```bash
git clone https://github.com/allen-kater/FitPlan.git
cd FitPlan
```

### 2. 启动后端

```bash
cd server
npm install
npx prisma generate
npx prisma db push
npm run seed          # 初始化食物/QA/训练计划数据
npm run dev           # 启动开发服务器 (http://localhost:3001)
```

### 3. 启动前端

```bash
cd client
npm install
npm run dev           # 启动开发服务器 (http://localhost:5173)
```

### 4. 访问应用

- 前端页面：http://localhost:5173
- 后端 API：http://localhost:3001
- 默认管理员：`admin@fitplan.com` / `admin123`

## 页面一览

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | `/` | 产品介绍与快速入口 |
| 注册 | `/register` | 用户注册 |
| 登录 | `/login` | 用户登录 |
| 个人中心 | `/profile` | 身体数据管理与体重追踪 |
| 生成方案 | `/plan/create` | 填写数据，一键生成方案 |
| 方案详情 | `/plan/:id` | 查看完整饮食与训练方案 |
| 方案历史 | `/plan/history` | 历史方案列表 |
| 训练计划 | `/training` | 三分化/四分化/居家训练计划 |
| 力量预测 | `/strength` | 9 种力量预测公式计算器 |
| 科普中心 | `/knowledge` | 知识库入口 |
| 减脂问答 | `/knowledge/fat-loss` | 26 条减脂 Q&A |
| 增肌问答 | `/knowledge/muscle` | 18 条增肌 Q&A |
| 食物库 | `/knowledge/food` | 49 种食物营养数据 |
| 拉伸图谱 | `/knowledge/stretch` | 上身/下身拉伸指导 |
| 解剖知识 | `/knowledge/anatomy` | 肌肉解剖知识 |
| 管理后台 | `/admin` | 用户管理与数据统计 |

## API 端点

| 模块 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 认证 | POST | `/api/auth/register` | 用户注册 |
| 认证 | POST | `/api/auth/login` | 用户登录 |
| 用户 | GET/PUT | `/api/users/profile` | 获取/更新个人资料 |
| 用户 | POST/GET | `/api/users/body-data` | 提交/获取身体数据 |
| 用户 | POST/GET | `/api/users/weight` | 记录/获取体重 |
| 方案 | POST | `/api/plans/generate` | 生成健身方案 |
| 方案 | GET | `/api/plans/history` | 方案历史列表 |
| 方案 | GET/DELETE | `/api/plans/:id` | 查看/删除方案 |
| 训练 | GET | `/api/training/plans` | 获取训练计划 |
| 训练 | POST | `/api/training/predict` | 力量预测计算 |
| 科普 | GET | `/api/knowledge/qa` | 获取问答 |
| 科普 | GET | `/api/knowledge/foods` | 获取食物库 |
| 管理 | GET | `/api/admin/users` | 用户列表 |
| 管理 | GET | `/api/admin/stats` | 数据统计 |

## 致谢

- 计算逻辑来源：[好人松松](https://space.bilibili.com/) 的《健身 Excel 超级套表》

## License

MIT
