# 四川方言智能对话系统 - 开发日志

---

## v1.0.0 - 2026-07-13

### 项目初始化

#### [17:36] 创建项目结构

**新增目录结构：**
```
project_scdialect/
├── app/
│   ├── api/          # API路由层
│   ├── core/         # 核心配置
│   ├── models/       # 数据模型
│   ├── services/     # 业务逻辑层
│   └── utils/        # 工具函数
├── tests/            # 测试代码
├── data/             # 数据文件
├── main.py           # 应用入口
├── requirements.txt  # 依赖管理
├── .env.example      # 环境变量模板
└── devlog.md         # 开发日志
```

**设计决策：**
- 采用FastAPI框架替代原有Flask，提升异步性能和自动文档
- 模块化设计，便于后续维护和扩展
- 环境变量管理敏感信息（数据库密码、API密钥等）

---

#### [17:40] 实现核心配置模块

**新增文件：**
- `app/core/config.py` - 配置管理类（pydantic-settings）
- `.env.example` - 环境变量模板

**支持配置：**
- 应用配置（名称、版本、环境）
- Neo4j数据库连接
- LLM提供商选择（DeepSeek/OpenAI/Ollama）

---

#### [17:42] 实现数据库连接层

**新增文件：**
- `app/core/database.py` - Neo4j异步连接管理

**功能：**
- 异步数据库连接
- 查询执行封装
- 预定义Cypher查询模板（KG_QUERIES）

---

#### [17:45] 实现LLM调用层

**新增文件：**
- `app/services/llm_service.py` - LLM统一调用接口

**支持的LLM提供商：**
- DeepSeek API
- OpenAI API
- Ollama本地部署

**功能：**
- 统一的调用接口
- 支持普通生成和流式生成
- 方言风格回复生成

---

#### [17:50] 实现7层流水线处理模块

**新增文件：**
- `app/services/pipeline_service.py` - 核心对话处理逻辑

**7层流水线：**
1. 输入标准化 -> 文本清洗、方言词归一化
2. 意图识别 -> 基于关键词和规则
3. 场景匹配 -> 匹配最合适的对话场景
4. 实体抽取 -> 提取美食、景点、民俗等实体
5. 知识检索 -> 从Neo4j查询相关数据
6. 模板匹配 -> 匹配方言表达模板
7. 响应生成 -> 使用LLM生成最终回复

---

#### [17:55] 实现FastAPI路由和API接口

**新增文件：**
- `app/models/schemas.py` - API数据模型
- `app/api/chat.py` - 对话API路由
- `app/api/health.py` - 健康检查路由
- `app/__init__.py` - 应用初始化和生命周期管理
- `main.py` - 应用主入口

**API接口：**
- `POST /api/v1/chat` - 对话接口
- `GET /health` - 健康检查
- `GET /` - 根路径
- `GET /docs` - OpenAPI文档

**特性：**
- 自动生成API文档（Swagger/ReDoc）
- CORS支持
- 异常处理
- 日志记录

---

#### [18:05] 创建虚拟环境并修复依赖版本冲突

**新增：**
- `venv/` - Python虚拟环境

**修复问题：**
- neo4j-driver版本冲突：`neo4j>=5.0.0` 替换 `neo4j-driver>=1.7.0`
- 添加明确版本约束避免依赖冲突

---

#### [18:12] 创建环境变量文件和隐私保护文档

**新增文件：**
- `.env` - 真实环境变量配置（不上传GitHub）
- `PRIVACY.md` - API密钥隐私保护说明

**配置内容：**
- Neo4j数据库连接信息
- DeepSeek API密钥配置
- LLM提供商选择

---

#### [18:12] 整理项目文档结构

**新增：**
- `docs/` - 项目文档文件夹
- `docs/PLAN.md` - 完整设计方案（从scdialect/PLAN.md复制）

**更新：**
- `README.md` - 添加文档引用链接，更新项目结构

**项目文档结构：**
- docs/PLAN.md - 完整设计方案
- README.md - 项目说明
- devlog.md - 开发日志
- PRIVACY.md - 隐私保护说明

---

#### [22:50] 完成前端界面开发

**新增：**
- `frontend/` - 前端项目目录
  - `package.json` - 项目配置
  - `vite.config.js` - Vite构建配置
  - `index.html` - 入口HTML
  - `src/main.jsx` - React入口
  - `src/App.jsx` - 主组件
  - `src/components/` - UI组件
    - `Header.jsx` - 头部组件
    - `ChatWindow.jsx` - 对话窗口
    - `MessageBubble.jsx` - 消息气泡
    - `InputArea.jsx` - 输入区域
    - `LoadingIndicator.jsx` - 加载指示器
  - `src/services/api.js` - API调用封装
  - `src/styles/` - 样式文件
    - `variables.css` - CSS变量
    - `global.css` - 全局样式
    - `animations.css` - 动画样式

**设计特点：**
- 金黄色(#D4A84B) + 米白色(#F5F0E6) 配色方案
- 响应式布局
- 消息气泡动画效果
- 加载状态呼吸动画
- 与后端API对接

**技术栈：**
- React 18
- Vite 5
- CSS3 动画

---

#### [00:30] 重构前端界面 - 主界面+多方言板块

**修改：**
- `src/App.jsx` - 添加页面切换逻辑（首页/聊天页）
- `src/styles/variables.css` - 更新配色为绿色系（参考图片）
- `src/styles/global.css` - 完整重写，支持新布局

**新增：**
- `src/components/HomePage.jsx` - 主界面（系统名称、描述、方言板块选择）
- `src/components/ChatPage.jsx` - 聊天页面（侧边栏+聊天区域）
- `src/components/Sidebar.jsx` - 侧边栏组件

**设计特点：**
- 绿色系配色（参考图片）：#2E7D32主色、#4CAF50聊天背景
- 主界面展示系统名称"小方言"和描述
- 6个方言板块卡片：四川话、粤语、上海话、北京话、湖南话、东北话
- 点击卡片进入对应方言聊天页面
- 侧边栏包含返回、用户信息、新建会话、会话列表
- 聊天页面包含头部（标题、方言选择）、聊天区域、输入框
- 响应式布局，移动端隐藏侧边栏

**配色方案：**
- 主色：#2E7D32（深绿）
- 聊天背景：#4CAF50（中绿）
- 侧边栏：#1B5E20（墨绿）
- 强调色：#FFA000（金色）
- 背景：#F5F0E6（米白）

---

#### [01:30] 重新设计界面 - 单方言入口+知识图谱分类

**修改：**
- `src/App.jsx` - 更新路由逻辑，支持5个功能页面
- `src/components/HomePage.jsx` - 去掉多方言选择，只保留四川话"开始聊天"按钮，添加功能特色展示
- `src/components/Sidebar.jsx` - 添加知识图谱分类功能入口

**新增：**
- `src/components/DictionaryPage.jsx` - 方言词典页面（常用词汇查询）
- `src/components/ScenesPage.jsx` - 场景对话页面（美食、旅游、天气等场景）
- `src/components/CulturePage.jsx` - 文化百科页面（美食、景点、民俗、方言表达）
- `src/components/IntentPage.jsx` - 意图识别页面（对话意图分析）

**界面结构：**
- 主界面：系统名称"小方言" + 描述 + "开始聊天"按钮 + 功能特色卡片
- 聊天页面：侧边栏（功能入口）+ 绿色聊天区域 + 输入框
- 侧边栏功能入口：开始聊天、方言词典、场景对话、文化百科、意图识别

**知识图谱分类对应：**
- 方言词典 → 子图1：方言词汇图谱
- 场景对话 → 子图2：场景对话模板
- 文化百科 → 子图4：文化实体知识
- 意图识别 → 子图3：意图关键词映射

---