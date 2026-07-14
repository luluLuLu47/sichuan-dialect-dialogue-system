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