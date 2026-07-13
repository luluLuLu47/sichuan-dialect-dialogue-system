# 四川方言智能对话系统

基于知识图谱的大语言模型方言对话系统。

## 快速开始

### 1. 安装依赖

```bash
cd project_scdialect
pip install -r requirements.txt
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填入实际配置
# - Neo4j数据库连接信息
# - LLM API密钥
```

### 3. 启动服务

```bash
# 方式1：直接运行
python main.py

# 方式2：使用uvicorn
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. 访问API文档

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API接口

### 对话接口

```http
POST /api/v1/chat
Content-Type: application/json

{
    "message": "成都哪里的火锅好吃？",
    "session_id": "session_123"
}
```

**响应：**

```json
{
    "response": "切吃那个火锅嘛，巴适得板！",
    "session_id": "session_123",
    "intent": "美食查询",
    "scene": "美食推荐",
    "entities": ["火锅"],
    "confidence": 0.85
}
```

### 健康检查

```http
GET /health
```

## 项目结构

```
project_scdialect/
├── app/
│   ├── api/              # API路由层
│   │   ├── chat.py       # 对话接口
│   │   └── health.py     # 健康检查
│   ├── core/             # 核心配置
│   │   ├── config.py     # 配置管理
│   │   └── database.py   # 数据库连接
│   ├── models/           # 数据模型
│   │   └── schemas.py    # API模型定义
│   ├── services/         # 业务逻辑层
│   │   ├── llm_service.py      # LLM调用
│   │   └── pipeline_service.py # 7层流水线
│   └── utils/            # 工具函数
├── docs/                 # 项目文档
│   └── PLAN.md           # 完整设计方案
├── tests/                # 测试代码
├── main.py               # 应用入口
├── requirements.txt      # 依赖管理
├── .env.example          # 环境变量模板
├── .env                  # 环境变量（不上传）
└── devlog.md             # 开发日志
```

## 文档

- [完整设计方案](docs/PLAN.md) - 从设计到原型的完整方案
- [开发日志](devlog.md) - 功能开发记录
- [隐私保护说明](PRIVACY.md) - API密钥安全指南

## 7层流水线架构

1. **输入标准化** - 文本清洗、方言词归一化
2. **意图识别** - 基于关键词和规则
3. **场景匹配** - 匹配最合适的对话场景
4. **实体抽取** - 提取美食、景点、民俗等实体
5. **知识检索** - 从Neo4j查询相关数据
6. **模板匹配** - 匹配方言表达模板
7. **响应生成** - 使用LLM生成最终回复

## 支持的LLM提供商

- **DeepSeek** - 推荐使用
- **OpenAI** - GPT系列
- **Ollama** - 本地部署

## 技术栈

- **FastAPI** - 现代高性能异步框架
- **Neo4j** - 图数据库（知识图谱）
- **Pydantic** - 数据验证
- **Loguru** - 日志记录

## 开发日志

详见 [devlog.md](devlog.md)

## License

MIT