# Sichuan Dialect Dialogue System | 四川方言智能对话系统

> 基于知识图谱的四川方言文本对话系统 | Knowledge Graph-based Sichuan Dialect Text Dialogue System

本仓库用于系统化整理**基于知识图谱的四川方言文本对话系统**的设计、开发与评测工作。项目以知识图谱为核心知识源，通过对话引擎实现四川方言相关的文本问答与交互。

---

## 目录结构

```
sichuan-dialect-dialogue-system/
├── knowledge-graph/            # 知识图谱相关
│   ├── construction/           #   图谱构建（实体抽取、关系定义、导入脚本）
│   ├── query/                  #   图谱查询（Cypher 查询模板、检索逻辑）
│   └── schemas/                #   图谱 Schema（本体设计、实体/关系类型定义）
├── dialogue-system/            # 对话系统相关
│   ├── engine/                 #   对话引擎（对话流程控制、状态管理）
│   ├── intent-recognition/     #   意图识别（方言意图分类、关键词匹配）
│   └── response-generation/    #   回复生成（基于图谱的答案生成、模板回复）
├── data/                       # 数据相关
│   ├── dialect-dataset/        #   方言数据集（方言词汇、表达、语义标注）
│   ├── corpus/                 #   语料库（对话语料、问答语料）
│   └── kg-data/                #   知识图谱原始数据（CSV/JSON 格式的图谱数据）
├── evaluation/                 # 评测相关
│   ├── scripts/                #   评测脚本（准确率、召回率等指标计算）
│   └── results/                #   评测结果（评测报告、对比数据）
├── docs/                       # 文档相关
│   ├── design/                 #   设计文档（架构设计、模块说明）
│   └── api/                    #   API 文档（接口定义、使用说明）
└── assets/                     # 图片等资源
```

---

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

---

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

---

## 知识图谱内容

### 子图1：方言词汇图谱
- 方言词汇实体、语义分类、同义词关系

### 子图2：场景对话模板
- 20个对话场景、语料数据、回复模板

### 子图3：意图关键词映射
- 31个意图、关键词匹配规则

### 子图4：文化实体知识
- 四川美食、景点、民俗、方言表达模板

---

## 7层流水线架构

1. **输入标准化** - 文本清洗、方言词归一化
2. **意图识别** - 基于关键词和规则
3. **场景匹配** - 匹配最合适的对话场景
4. **实体抽取** - 提取美食、景点、民俗等实体
5. **知识检索** - 从Neo4j查询相关数据
6. **模板匹配** - 匹配方言表达模板
7. **响应生成** - 使用LLM生成最终回复

---

## 支持的LLM提供商

- **DeepSeek** - 推荐使用
- **OpenAI** - GPT系列
- **Ollama** - 本地部署

---

## 技术栈

- **FastAPI** - 现代高性能异步框架
- **Neo4j** - 图数据库（知识图谱）
- **Pydantic** - 数据验证
- **Loguru** - 日志记录

---

## 项目特点

- **知识图谱驱动**：以结构化方言知识为核心，确保回复的准确性与可溯源性
- **文本对话交互**：当前仅支持文本输入输出，未实现语音/图像模块
- **方言文化承载**：不仅做方言翻译，更承载方言背后的文化典故与语义内涵

---

## 文档

- [完整设计方案](docs/PLAN.md) - 从设计到原型的完整方案
- [开发日志](devlog.md) - 功能开发记录
- [隐私保护说明](PRIVACY.md) - API密钥安全指南

---

## License

[MIT](./LICENSE)