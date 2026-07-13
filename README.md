# Sichuan Dialect Dialogue System

> 基于知识图谱的四川方言文本对话系统 | Knowledge Graph-based Sichuan Dialect Text Dialogue System

本仓库用于系统化整理**基于知识图谱的四川方言文本对话系统**的设计、开发与评测工作。项目以知识图谱为核心知识源，通过对话引擎实现四川方言相关的文本问答与交互。

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

## 内容分类说明

### knowledge-graph/ — 知识图谱

| 子目录 | 内容 |
|--------|------|
| `construction/` | 图谱构建流程：实体识别、关系抽取、Neo4j 导入脚本等 |
| `query/` | 图谱查询逻辑：Cypher 查询模板、多跳推理、语义检索等 |
| `schemas/` | 图谱本体设计：实体类型（方言词汇、语义概念）、关系类型（同义、转换、释义等） |

### dialogue-system/ — 对话系统

| 子目录 | 内容 |
|--------|------|
| `engine/` | 对话引擎核心：对话状态追踪、流程控制、多轮对话管理 |
| `intent-recognition/` | 意图识别模块：方言意图分类（释义查询、翻译转换、文化典故等） |
| `response-generation/` | 回复生成模块：基于图谱知识的答案组装、自然语言模板生成 |

### data/ — 数据

| 子目录 | 内容 |
|--------|------|
| `dialect-dataset/` | 四川方言词汇数据集：方言词汇、标准语对照、语义标注 |
| `corpus/` | 对话语料：真实对话样本、问答对集合 |
| `kg-data/` | 知识图谱原始数据：用于导入 Neo4j 的 CSV/JSON 数据文件 |

### evaluation/ — 评测

| 子目录 | 内容 |
|--------|------|
| `scripts/` | 评测脚本：意图识别准确率、回复质量评分、图谱覆盖率等 |
| `results/` | 评测结果记录：各模块评测报告、迭代对比数据 |

## 项目特点

- **知识图谱驱动**：以结构化方言知识为核心，确保回复的准确性与可溯源性
- **文本对话交互**：当前仅支持文本输入输出，未实现语音/图像模块
- **方言文化承载**：不仅做方言翻译，更承载方言背后的文化典故与语义内涵

## 技术栈

- 知识图谱：Neo4j / Cypher
- 对话引擎：Python
- 意图识别：规则 + LLM
- 回复生成：模板 + 图谱知识组装

## 贡献方式

本仓库为个人项目，欢迎参考和引用。如发现错误或有交流意向，欢迎提 Issue。

## License

[MIT](./LICENSE)
