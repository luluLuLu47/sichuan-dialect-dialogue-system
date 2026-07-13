# 四川方言智能对话系统 — 从设计到可演示原型的完整方案

> **项目路径**: `D:\project\scdialect`
> **方案版本**: v1.0 | 2026-07-09
> **定位**: EI会议论文导向 + 可演示原型 + Trae CN可执行的技术蓝图
> **说明**: 本方案供Trae CN按步骤执行，每一步均有具体操作指引

---

## 一、决策记录（grill-me确认）

| 决策项 | 选定方案 | 理由 |
|--------|----------|------|
| 目标场景 | 综合型（文旅+对话+研究） | 论文覆盖面广，创新点多 |
| 知识图谱存储 | Neo4j（4子图在同一数据库） | 已有Neo4j环境，子图用标签区分 |
| 大模型 | 通过小实验A比对选型+参数调优 | 论文需实验支撑，对比选型本身就是实验点 |
| 方言识别 | 词典+LLM混合 | 词典做词级标注，LLM做句级语义，互补 |
| RAG检索 | 意图引导子图检索 | 精准高效，与4子图架构天然匹配 |
| 偏差纠正 | LLM二次校验 | 双Agent思路，灵活可控 |
| 实验结构 | 2小实验+1大实验 | 论文结构清晰，工作量可控 |
| 小实验A | 模型选型+参数敏感度梯度实验 | 不仅是选模型，还要分析参数对方言生成的影响 |
| 小实验B | RAG检索策略对比+命中率分析 | 验证意图引导子图检索的有效性 |
| 大实验 | 端到端系统综合评测 | 全流程评测，论文核心实验 |
| 数据来源 | 开源方言对话数据+飞桨词典提取 | 已有3子图数据在Neo4j中，网络数据补充 |
| 子图4 | 最优先建完再开发后续模块 | ask_food/ask_travel意图依赖文化知识 |
| 子图4数据量 | 4000+节点（全四川） | EI论文要求，覆盖四川所有城市 |
| 子图4数据源 | 百度百科/文旅网站爬取+方言词典释义+LLM辅助方言别称 | 半自动化批量构建 |
| 前端交互 | FastAPI+React全栈 | 工程规范，便于演示 |

---

## 二、系统架构总览

### 2.1 七层模块架构

```
┌─────────────────────────────────────────────────────────────┐
│                    用户方言文本输入                           │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ [模块1] 用户输入层                                          │
│ 任务：接收方言文本，预处理（分句、去噪、长度校验）            │
│ 创新：方言原生起点，非普通话输入的简单适配                    │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ [模块2] 方言识别模块（词典+LLM混合）                        │
│ Step1：方言词典词级标注 → 标记方言词+释义                    │
│ Step2：LLM句级语义转写 → 过滤语气词、保留核心语义            │
│ 输出：{标准语义文本, 方言词标注列表, 语气词列表}             │
│ 创新：解决了方言"输入难识别"痛点                            │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ [模块3] 意图识别模块                                        │
│ 基于关键词特征+LLM意图分类                                  │
│ 输出：意图标签（ask_food/ask_travel/learn_dialect/chat）    │
│       + 关键特征词列表                                      │
│ 创新：针对四川方言表达习惯优化的意图识别                     │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ [模块4] 知识图谱查询模块（RAG核心，论文最核心创新支撑）     │
│ 意图 → 子图3路由 → 锁定子图2/子图4 → Cypher检索           │
│ 输出：{方言回复模板, 场景对话语料, 领域文化知识}             │
│ 创新：KG提供本地真实语料，避免大模型"生硬方言"               │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ [模块5] 大模型方言响应生成                                  │
│ Prompt注入KG知识 + 方言风格指令                             │
│ 输出：方言初稿回复                                          │
│ 创新：LLM生成能力 + KG本地知识的结合                        │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ [模块6] 方言偏差纠正模块（LLM二次校验Agent）                │
│ 检查：方言词准确性、语气词自然度、句式地道性                 │
│ 输出：纠正后的地道方言回复                                  │
│ 创新：让回复"从像方言→就是方言"的关键一步                   │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ [模块7] 输出层                                              │
│ 文本/语音返回用户                                           │
│ 创新："方言输入→方言理解→方言回复"完整闭环                  │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 知识图谱4子图架构（同一Neo4j数据库，用标签区分）

```
Neo4j Database: scdialect（单库，子图用节点标签区分）
│
├── 子图1: 方言词汇子图 ←── 已构建，5151条词
│   节点标签：DialectWord, PartOfSpeech, PhoneticPattern
│   关系类型：HAS_POS, FOLLOW_PHONETIC, SYNONYM, NEAR_SYNONYM
│   属性：word, pinyin, type, definition, usage_frequency, sentiment
│
├── 子图2: 场景对话语料子图 ←── 已构建，11场景/10737语料
│   节点标签：DialogScene, ReplyTemplate, Utterance
│   关系类型：HAS_TEMPLATE, BELONGS_TO_SCENE, CONTAINS_WORD
│   属性：scene_name, scene_type, template, style, sentence_length
│
├── 子图3: 意图-检索映射子图 ←── 已构建，31意图/501关键词
│   节点标签：UserIntent, KeywordFeature, RetrievalEntry
│   关系类型：HAS_KEYWORD, TRIGGERS_RETRIEVAL, HIERARCHY
│   属性：intent_name, intent_type, keyword, weight
│
└── 子图4: 川域文旅美食文化子图 ←── ⚠️ 未构建，最优先补建，目标4000+节点
│   覆盖范围：整个四川所有城市（成都/重庆/乐山/绵阳/宜宾/自贡/泸州/德阳/广元/遂宁/内江/南充/达州/巴中/雅安/眉山/资阳/阿坝/甘孜/凉山）
│   节点标签：Food, Attraction, Custom, Location, DialectExpression, Recommendation
│   关系类型：BELONGS_REGION, DIALECT_ALIAS, RECOMMEND_PAIR, SCENE_MATCH, HAS_LOCAL_NAME, LOCAL_RECOMMEND
│   属性：name, dialect_alias, standard_name, description, region, popularity, local_recommend_phrase
│
│   核心功能：
│   1. 根据意图查询方言知识图谱（如ask_food→检索Food实体+方言表达模板）
│   2. 匹配地道方言表达模板和场景语料（如推荐景点时的四川话句式）
│   3. 检索领域知识（景点/美食的地道介绍、本地俗称、方言推荐话术）
│   4. 保证回复既有"方言味"又符合本地文化习惯（推荐苍蝇馆子而非网红店）
│
│   跨子图关系（连接不同子图的节点）：
│   DialectWord ↔ Food/Attraction（DIALECT_ALIAS，方言词→文化实体的方言别称）
│   DialogScene ↔ Food/Attraction（SCENE_MATCH，场景匹配文化实体）
│   DialectExpression ↔ DialogScene（HAS_LOCAL_NAME，本地叫法关联场景）
```

---

## 三、现有基础盘点

| 项目 | 状态 | 数据量 | 评估 |
|------|------|--------|------|
| 方言词汇子图（子图1） | ✅ 已在Neo4j | 5151条词 | 数据量充足，需验证字段完整性 |
| 场景对话子图（子图2） | ✅ 已在Neo4j | 11场景/10737语料 | 场景偏少，需扩充至15-20 |
| 意图映射子图（子图3） | ✅ 已在Neo4j | 31意图/501关键词 | 基础框架完整 |
| 文化子图（子图4） | ❌ 未构建 | 目标4000+节点 | **最优先补建，覆盖全四川21市** |
| Neo4j导入脚本 | ✅ 已编写 | neo4j_import.cypher | 需验证导入后节点/关系完整性 |
| Flask后端原型 | ⚠️ 初级版 | scdialect.py | 需重构为FastAPI + 模块化 |
| 知识图谱Python类 | ⚠️ JSON版 | scdialect_kg.py | 用JSON加载，需改为Neo4j Cypher查询 |
| 评估脚本 | ⚠️ 基础版 | scdialect_eval.py | 仅方言识别+意图识别，需大幅扩展 |
| 方言词典数据 | ✅ 多版本 | CSV/JSON/MD | 数据够用，已入库 |
| 开源方言对话数据 | ✅ 已收集 | data/raw/对话*.txt | 需结构化处理后扩充子图2 |

---

## 四、核心开发步骤：从设计到可演示原型

### Phase 0：子图4建设（4000+节点）+ 数据质量验证（5-7天，最优先）

**目标**：子图4建成入库（4000+节点）+ 现有3个子图数据完整性验证

#### 0.1 子图4半自动化批量构建流程

**核心挑战**：子图4需要4000+节点，覆盖四川所有城市，纯手动不可能完成。必须设计半自动化流水线。

**构建流水线**：

```
Step 1: 网站爬取 → 获取美食/景点/民俗的普通话实体数据（JSON/CSV）
Step 2: 方言别称匹配 → 从子图1方言词典提取释义，自动匹配方言别称
Step 3: LLM辅助补充 → 对缺失的方言别称/推荐话术/本地俗称，用LLM批量生成
Step 4: 人工审核 → 抽检10-20%的数据质量，修正明显错误
Step 5: CSV格式化 → 生成符合Neo4j导入规范的CSV文件
Step 6: 入库Neo4j → 执行Cypher导入脚本
Step 7: 验证 → 确认节点数≥4000，关系完整
```

#### 0.1.1 Step 1：网站爬取（获取普通话实体数据）

**爬取目标**：

| 数据类别 | 爬取来源 | 目标数量 | 爬取字段 |
|----------|----------|----------|----------|
| 四川美食 | 百度百科"四川美食"词条 + 美食博客 | 1500-2000条 | name, type, description, region, popularity |
| 四川景点 | 百度百科"四川景点"词条 + 文旅官网 | 800-1200条 | name, type, description, region, popularity |
| 四川民俗 | 百度百科"四川民俗"词条 | 100-200条 | name, type, description, region |
| 四川地域 | 行政区划数据 | 20-30条 | name, type, description, parent_region |
| 方言表达模板 | 基于场景对话语料+LLM生成 | 800-1000条 | template, dialect_words, scene_type, region |
| 方言推荐话术 | LLM基于美食/景点+方言风格生成 | 500-800条 | phrase, entity_ref, dialect_style, region |

**爬取脚本设计**（Trae CN执行）：

```python
# scripts/crawl_baidu_baike.py
"""
百度百科爬取脚本
1. 搜索关键词："四川美食"、"成都景点"、"乐山景点"等
2. 提取词条中的结构化信息（名称、描述、分类、地区）
3. 输出为CSV格式
"""

import requests
from bs4 import BeautifulSoup
import csv
import json
import time

BAIKE_BASE = "https://baike.baidu.com"
SEARCH_URL = "https://baike.baidu.com/search"

# 四川21个地级行政区的美食/景点关键词列表
CITY_KEYWORDS = {
    "成都": ["成都美食", "成都景点", "成都火锅", "成都小吃"],
    "乐山": ["乐山美食", "乐山景点", "乐山大佛"],
    "宜宾": ["宜宾美食", "宜宾景点", "宜宾燃面"],
    "自贡": ["自贡美食", "自贡景点", "自贡盐帮菜"],
    "绵阳": ["绵阳美食", "绵阳景点"],
    "南充": ["南充美食", "南充景点"],
    "达州": ["达州美食", "达州景点"],
    # ... 所有21个城市
}

def crawl_category(category, keywords_dict, output_path):
    """爬取指定类别的百科词条"""
    results = []
    for city, keywords in keywords_dict.items():
        for kw in keywords:
            # 搜索词条列表
            search_results = search_baike(kw)
            for item in search_results:
                # 提取词条详情
                detail = extract_baike_detail(item['url'])
                if detail:
                    detail['region'] = city
                    detail['category'] = category
                    results.append(detail)
                time.sleep(1)  # 避免被封
    # 输出CSV
    write_csv(results, output_path)
    return len(results)

def extract_baike_detail(url):
    """提取百科词条的结构化信息"""
    resp = requests.get(url, headers={"User-Agent": "..."})
    soup = BeautifulSoup(resp.text, 'html.parser')
    # 提取：标题、摘要描述、基本信息表格、分类标签
    title = soup.find('h1').text.strip()
    summary = soup.find('div', class_='lemma-summary').text.strip()
    info_table = extract_info_table(soup)
    return {
        'name': title,
        'description': summary[:200],  # 截取前200字
        'popularity': estimate_popularity(info_table),
        **info_table
    }
```

**备选爬取源**（如果百度百科反爬严重）：

| 备选源 | 优势 | 注意事项 |
|--------|------|----------|
| 大众点评API | 美食数据丰富，有评分和评论 | 需要API key，有调用限制 |
| 高德地图API | 景点POI数据，有坐标和分类 | 免费额度有限 |
| 美食天下/下厨房 | 美食分类详细 | 需爬取 |
| 各城市文旅官网 | 官方景点数据，权威 | 格式不统一 |
| 知乎"四川美食推荐" | 真实口碑评价 | 需爬取+结构化 |

#### 0.1.2 Step 2：方言别称自动匹配

**核心思路**：从子图1的方言词典（5151条词）中，找出释义中包含美食/景点相关词汇的方言词，建立"普通话词→方言别称"映射。

```python
# scripts/match_dialect_alias.py
"""
从Neo4j子图1提取方言词释义，自动匹配方言别称
1. 查询所有方言词及其释义
2. 在释义中搜索美食/景点/地域相关的关键词
3. 建立 entity_name → dialect_alias 映射表
"""

from neo4j import GraphDatabase

def extract_dialect_word_meanings(neo4j_conn):
    """从子图1提取所有方言词的释义"""
    cypher = """
    MATCH (dw:DialectWord)
    WHERE dw.definition IS NOT NULL AND dw.definition <> ''
    RETURN dw.word AS word, dw.type AS pos, dw.definition AS definition
    """
    return neo4j_conn.run(cypher)

def match_alias_to_entities(dialect_words, entity_names):
    """
    在方言词释义中搜索实体名称，建立映射
    e.g. 方言词"红苕"释义="红薯" → 映射：红薯→红苕
    e.g. 方言词"巷子"释义="小巷" → 映射：宽窄巷子→巷子（局部匹配）
    """
    alias_map = {}
    for dw in dialect_words:
        definition = dw['definition']
        word = dw['word']
        for entity_name in entity_names:
            # 精确匹配：释义中出现实体名
            if entity_name in definition:
                alias_map[entity_name] = word
            # 反向匹配：方言词出现在实体名中
            if word in entity_name:
                if entity_name not in alias_map:
                    alias_map[entity_name] = word
    return alias_map

# 执行结果示例：
# {"红薯": "红苕", "土豆": "洋芋", "玉米": "包谷", "小巷": "巷子",
#  "火锅": "红锅", "聊天": "摆龙门阵", "麻将": "血战到底"}
```

#### 0.1.3 Step 3：LLM辅助补充方言别称+推荐话术+本地俗称

**对Step 2未能自动匹配的实体，用LLM批量生成方言别称和推荐话术**：

```python
# scripts/llm_enrich_cultural.py
"""
对缺失方言别称的实体，用LLM批量生成：
1. 方言别称（该实体的四川话叫法）
2. 方言推荐话术（当地人怎么推荐这个东西）
3. 本地俗称/描述（本地人怎么描述这个地方）
"""

BATCH_PROMPT = """
你是四川方言文化专家，请为以下四川美食/景点生成方言相关信息。

实体列表：
{entities_json}

对每个实体，请生成：
1. dialect_alias：四川话中这个东西的别称（如有多个用/分隔，如没有则留空）
2. local_recommend_phrase：当地人推荐这个东西时常用的四川话句式（如"这个火锅巴适得板！"）
3. local_description：本地人怎么描述这个地方（用四川方言，如"巷子里面耍安逸"）

输出为JSON数组，格式：
[{"entity_name": "...", "dialect_alias": "...", "local_recommend_phrase": "...", "local_description": "..."}]
"""

def llm_enrich_entities(entities_without_alias, llm_client):
    """批量LLM生成方言信息"""
    # 每次处理20个实体（避免Prompt过长）
    results = []
    batch_size = 20
    for i in range(0, len(entities_without_alias), batch_size):
        batch = entities_without_alias[i:i+batch_size]
        entities_json = json.dumps([{"name": e["name"], "region": e["region"], "type": e["type"]} for e in batch])
        prompt = BATCH_PROMPT.format(entities_json=entities_json)
        response = llm_client.generate(prompt)
        batch_result = json.loads(response)
        results.extend(batch_result)
    return results
```

#### 0.1.4 Step 4：人工审核（抽检10-20%）

**审核重点**：
- 方言别称是否真实存在（不是LLM编造的）
- 推荐话术是否地道（不是"机翻式方言"）
- 本地描述是否准确（不是泛泛之谈）

**审核方法**：
- 抽检10-20%（约400-800条）
- 对照四川方言词典验证别称
- 对照本地人经验验证推荐话术
- 修正明显错误后重新入库

#### 0.1.5 Step 5-6：CSV格式化 + Neo4j导入

**子图4 CSV文件规范**：

```
D:\project\scdialect\scdialect\subgraph_4_cultural\
├── food.csv                     # 美食实体（1500-2000条）
│   entity_id:ID,name,type,dialect_alias,standard_name,description,region,popularity,local_recommend_phrase
│   示例：FD_001,火锅,美食,红锅/涮锅,火锅,"四川麻辣火锅代表",成都,5,"这个火锅巴适得板！"
│
├── attractions.csv               # 景点实体（800-1200条）
│   entity_id:ID,name,type,dialect_alias,standard_name,description,region,popularity,local_description
│   示例：AT_001,宽窄巷子,景点,巷子,宽窄巷子,"成都最有代表性的老街巷",成都青羊区,5,"巷子里面耍安逸"
│
├── customs.csv                   # 民俗实体（100-200条）
│   entity_id:ID,name,type,dialect_alias,description,region
│   示例：CU_001,茶馆文化,民俗,坐茶铺,"四川人坐茶铺摆龙门阵的习惯",成都
│
├── locations.csv                 # 地域实体（20-30条）
│   entity_id:ID,name,type,description,parent_region
│   示例：LOC_001,成都,城市,"四川省省会",四川
│
├── dialect_expressions.csv       # 方言表达模板（800-1000条）
│   entity_id:ID,template,dialect_words,scene_type,region,style
│   示例：DE_001,"这个{food}巴适得板！","巴适/得板",美食讨论,成都,casual
│
├── recommendations.csv           # 方言推荐话术（500-800条）
│   entity_id:ID,phrase,entity_ref,dialect_style,region
│   示例：RC_001,"切吃那个串串嘛，安逸！",FD_串串,casual,成都
│
├── cultural_relations.csv        # 关系
│   :START_ID,:END_ID,:TYPE,properties
│   示例：FD_001,LOC_001,BELONGS_REGION,{alias:"成都火锅"}
│   示例：FD_001,AT_001,RECOMMEND_PAIR,{pair_desc:"吃完火锅逛巷子"}
│   示例：DW_啥子,FD_火锅,DIALECT_ALIAS,{context:"啥子火锅好吃"}
│
└── scene_match.csv               # 场景-文化实体映射
│   :START_ID,:END_ID,:TYPE
│   示例：SCENE_001,FD_001,SCENE_MATCH
```

**数据量分配**（总计4000+节点）：

| 实体类型 | 目标数量 | 覆盖范围 | 说明 |
|----------|----------|----------|------|
| Food（美食） | 1500-2000 | 全四川21市 | 每市70-100种美食，覆盖火锅/串串/小吃/面食/川菜 |
| Attraction（景点） | 800-1200 | 全四川21市 | 每市40-60个景点，覆盖自然景观/人文古迹/公园 |
| Custom（民俗） | 100-200 | 全四川 | 覆盖茶馆/麻将/摆龙门阵/坝坝宴/赶场等 |
| Location（地域） | 20-30 | 全四川 | 21个地级行政区+9个特色区 |
| DialectExpression（方言表达模板） | 800-1000 | 全四川 | 每场景50-60个模板，覆盖4大意图 |
| Recommendation（方言推荐话术） | 500-800 | 全四川 | 基于美食/景点生成的地道推荐语 |
| **总计** | **3720-5230** | | ≥ 4000节点达标 |

**城市覆盖列表**（21个地级行政区）：

| 序号 | 城市 | 美食特色 | 景点特色 | 方言特点 |
|------|------|----------|----------|----------|
| 1 | 成都 | 火锅/串串/小吃 | 宽窄巷子/锦里/武侯祠 | 成都话（代表性方言） |
| 2 | 重庆 | 江湖菜/小面 | 解放碑/洪崖洞/磁器口 | 重庆话（与成都话有差异） |
| 3 | 乐山 | 乐山烧烤/甜皮鸭 | 乐山大佛/峨眉山 | 乐山话（有独特方音） |
| 4 | 宜宾 | 燃面/宜宾白酒 | 蜀南竹海/李庄古镇 | 宜宾话 |
| 5 | 自贡 | 盐帮菜/冷吃兔 | 自贡恐龙博物馆 | 自贡话 |
| 6 | 绵阳 | 绵阳米粉 | 越王楼/北川羌城 | 绵阳话 |
| 7 | 南充 | 南充锅盔 | 阆中古城/白塔 | 南充话 |
| 8 | 达州 | 达州灯影牛肉 | 賓人谷 | 达州话 |
| 9 | 德阳 | 德阳干锅 | 三星堆博物馆 | 德阳话 |
| 10 | 广元 | 广元凉面 | 剑门关/皇泽寺 | 广元话 |
| 11 | 遂宁 | 遂宁豆腐 | 灵泉寺/中国观音故里 | 遂宁话 |
| 12 | 内江 | 内江牛肉面 | 大千园 | 内江话 |
| 13 | 泸州 | 泸州白糕/泸州老窖 | 泸州老窖景区/方山 | 泸州话 |
| 14 | 巴中 | 巴中凉粉 | 光雾山 | 巴中话 |
| 15 | 雅安 | 雅鱼 | 碧峰峡/上里古镇 | 雅安话 |
| 16 | 眉山 | 眉山东坡肉 | 三苏祠/瓦屋山 | 眉山话 |
| 17 | 资阳 | 资阳羊肉汤 | 安岳石刻 | 资阳话 |
| 18 | 广安 | 广安盐皮蛋 | 邓小平故里/华蓥山 | 广安话 |
| 19 | 攀枝花 | 攀枝花芒果 | 二滩国家森林公园 | 攀枝花话（受云南影响） |
| 20 | 阿坝 | 藏羌美食 | 九寨沟/黄龙/四姑娘山 | 藏羌方言区 |
| 21 | 甘孜/凉山 | 彝族/藏族美食 | 稻城亚丁/螺髻山 | 彝族/藏族方言区 |

#### 0.1.6 Neo4j导入脚本

```cypher
// 子图4导入（追加到现有数据库）

// 创建约束
CREATE CONSTRAINT IF NOT EXISTS FOR (f:Food) REQUIRE f.entity_id IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (a:Attraction) REQUIRE a.entity_id IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (c:Custom) REQUIRE c.entity_id IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (l:Location) REQUIRE l.entity_id IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (de:DialectExpression) REQUIRE de.entity_id IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (rc:Recommendation) REQUIRE rc.entity_id IS UNIQUE;

// 导入美食实体
LOAD CSV WITH HEADERS FROM 'file:///subgraph_4_cultural/food.csv' AS row
CREATE (f:Food:CulturalEntity {
    entity_id: row.entity_id, name: row.name, type: row.type,
    dialect_alias: row.dialect_alias, standard_name: row.standard_name,
    description: row.description, region: row.region,
    popularity: toInteger(row.popularity),
    local_recommend_phrase: row.local_recommend_phrase
});

// 导入景点实体
LOAD CSV WITH HEADERS FROM 'file:///subgraph_4_cultural/attractions.csv' AS row
CREATE (a:Attraction:CulturalEntity {
    entity_id: row.entity_id, name: row.name, type: row.type,
    dialect_alias: row.dialect_alias, standard_name: row.standard_name,
    description: row.description, region: row.region,
    popularity: toInteger(row.popularity),
    local_description: row.local_description
});

// 导入民俗实体
LOAD CSV WITH HEADERS FROM 'file:///subgraph_4_cultural/customs.csv' AS row
CREATE (c:Custom:CulturalEntity {
    entity_id: row.entity_id, name: row.name, type: row.type,
    dialect_alias: row.dialect_alias, description: row.description, region: row.region
});

// 导入地域实体
LOAD CSV WITH HEADERS FROM 'file:///subgraph_4_cultural/locations.csv' AS row
CREATE (l:Location {
    entity_id: row.entity_id, name: row.name, type: row.type,
    description: row.description, parent_region: row.parent_region
});

// 导入方言表达模板
LOAD CSV WITH HEADERS FROM 'file:///subgraph_4_cultural/dialect_expressions.csv' AS row
CREATE (de:DialectExpression:CulturalEntity {
    entity_id: row.entity_id, template: row.template,
    dialect_words: row.dialect_words, scene_type: row.scene_type,
    region: row.region, style: row.style
});

// 导入方言推荐话术
LOAD CSV WITH HEADERS FROM 'file:///subgraph_4_cultural/recommendations.csv' AS row
CREATE (rc:Recommendation:CulturalEntity {
    entity_id: row.entity_id, phrase: row.phrase,
    entity_ref: row.entity_ref, dialect_style: row.dialect_style, region: row.region
});

// 导入关系
LOAD CSV WITH HEADERS FROM 'file:///subgraph_4_cultural/cultural_relations.csv' AS row
MATCH (a {entity_id: row.`:START_ID`})
MATCH (b {entity_id: row.`:END_ID`})
CALL apoc.create.relationship(a, row.`:TYPE`, json.loads(row.properties), b) YIELD rel
RETURN rel;

// 导入场景匹配
LOAD CSV WITH HEADERS FROM 'file:///subgraph_4_cultural/scene_match.csv' AS row
MATCH (s:DialogScene {scene_id: row.`:START_ID`})
MATCH (ce:CulturalEntity {entity_id: row.`:END_ID`})
CREATE (s)-[:SCENE_MATCH]->(ce);
```

#### 0.2 现有子图数据验证

```cypher
// 验证各子图节点数
MATCH (n:DialectWord) RETURN count(n) AS dialect_words;
MATCH (n:DialogScene) RETURN count(n) AS scenes;
MATCH (n:UserIntent) RETURN count(n) AS intents;
MATCH (n:CulturalEntity) RETURN count(n) AS cultural_entities;

// 验证关键关系
MATCH (dw:DialectWord)-[:SYNONYM]->(dw2:DialectWord) RETURN count(*) AS synonym_pairs;
MATCH (s:DialogScene)-[:HAS_TEMPLATE]->(t:ReplyTemplate) RETURN s.scene_name, count(t);
MATCH (i:UserIntent)-[:HAS_KEYWORD]->(k:KeywordFeature) RETURN i.intent_name, count(k);

// 验证跨子图连接
MATCH (ut:Utterance)-[:CONTAINS_WORD]->(dw:DialectWord) RETURN count(*) AS utterance_word_links;
MATCH (i:UserIntent)-[:TRIGGERS_RETRIEVAL]->(r:RetrievalEntry) RETURN i.intent_name, r.entry_type;
```

#### 0.3 子图2场景扩充（从11→15-20）

现有11个场景偏少，需补充以下场景并入库：

| 新增场景 | scene_id | 目标语料数 | 数据来源 |
|----------|----------|-----------|----------|
| 问路/交通 | SCENE_012 | 50+ | 开源对话数据+LLM生成 |
| 购物/价格 | SCENE_013 | 50+ | 开源对话数据+LLM生成 |
| 天气/日常 | SCENE_014 | 50+ | 开源对话数据+LLM生成 |
| 方言学习 | SCENE_015 | 50+ | 方言词典+教学材料 |
| 本地民俗 | SCENE_016 | 30+ | 民俗资料+LLM生成 |

---

### Phase 1：后端核心模块开发（5-7天）

**目标**：7层流水线每个模块独立可调用 + FastAPI接口就绪

#### 1.1 项目重构：Flask → FastAPI + 模块化

**目标目录结构**（Trae CN按此创建）：

```
D:\project\scdialect\
├── backend/                        # FastAPI后端（新建）
│   ├── main.py                     # FastAPI入口 + 路由注册
│   ├── config.py                   # 配置（Neo4j连接/LLM API keys）
│   ├── models/                     # Pydantic数据模型
│   │   ├── schemas.py              # 请求/响应模型定义
│   │   └── chat.py                 # 对话相关模型
│   ├── services/                   # 7层流水线核心业务
│   │   ├── input_processor.py      # 模块1：输入预处理
│   │   ├── dialect_recognizer.py   # 模块2：方言识别（词典+LLM）
│   │   ├── intent_classifier.py    # 模块3：意图识别（关键词+LLM）
│   │   ├── kg_query.py             # 模块4：KG检索（Neo4j Cypher）
│   │   ├── response_generator.py   # 模块5：LLM方言生成
│   │   ├── dialect_corrector.py    # 模块6：偏差纠正（二次LLM）
│   │   └── pipeline.py             # 7层流水线编排
│   ├── kg/                         # 知识图谱连接层
│   │   ├── neo4j_connector.py      # Neo4j驱动封装
│   │   ├── subgraph_router.py      # 子图路由逻辑
│   │   └── cypher_templates.py     # Cypher查询模板库
│   ├── llm/                        # LLM调用层
│   │   ├── llm_client.py           # 多LLM统一调用接口
│   │   ├── prompt_templates.py     # Prompt模板库
│   │   └── model_registry.py       # 模型注册与配置
│   ├── dict/                       # 方言词典模块
│   │   ├── dialect_dict_loader.py  # 方言词典加载（从Neo4j/CSV）
│   │   └── word_matcher.py         # 方言词匹配与标注
│   ├── utils/                      # 工具
│   │   ├── text_utils.py           # 文本处理（分词/去噪）
│   │   └── logger.py               # 日志
│   └── requirements.txt            # Python依赖
│
├── frontend/                       # React前端（新建）
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── ChatWindow.tsx      # 对话窗口
│   │   │   ├── InputBar.tsx        # 输入框
│   │   │   ├── MessageBubble.tsx   # 消息气泡（方言词高亮）
│   │   │   ├── IntentTag.tsx       # 意图标签
│   │   │   └── QuickQuestions.tsx  # 快捷方言提问按钮
│   │   ├── services/
│   │   │   └── api.ts             # FastAPI调用
│   │   └── types/
│   │       └── chat.ts            # TS类型定义
│   ├── package.json
│   └── vite.config.ts
│
├── experiments/                    # 实验脚本（新建）
│   ├── exp_a_model_selection.py    # 小实验A：模型选型+参数敏感度
│   ├── exp_b_rag_comparison.py     # 小实验B：RAG检索策略+命中率
│   ├── exp_c_system_eval.py        # 大实验：端到端系统评测
│   ├── datasets/                   # 实验数据集
│   │   ├── model_test_100.json     # 模型评测100条
│   │   ├── rag_test_50.json        # RAG评测50条
│   │   ├── system_test_200.json    # 系统评测200条
│   └── results/                    # 实验结果输出
│       ├── exp_a_results.json
│       ├── exp_b_results.json
│       ├── exp_c_results.json
│
├── data/                           # 保留现有数据目录
│   ├── raw/                        # 原始数据
│   ├── kg_output/                  # KG构建输出
│   └── evaluation_report.json      # 已有评估
│
├── scdialect/                      # 保留现有KG构建脚本
├── scdialect.py                    # 旧Flask原型（参考后删除）
├── scdialect_kg.py                 # 旧JSON KG（参考后删除）
├── scdialect_eval.py               # 旧评估（参考后重构）
└── PLAN.md                         # 本方案文件
```

#### 1.2 模块2：方言识别（词典+LLM混合）详细设计

```python
# backend/services/dialect_recognizer.py

class DialectRecognizer:
    """方言识别模块：词典词级标注 + LLM句级转写"""

    def __init__(self, neo4j_conn, llm_client):
        self.neo4j = neo4j_conn
        self.llm = llm_client
        self.dialect_dict = self._load_dialect_dict()  # 从Neo4j子图1加载

    def _load_dialect_dict(self) -> dict:
        """从Neo4j加载方言词典，构建查找表"""
        cypher = "MATCH (dw:DialectWord) RETURN dw.word AS word, dw.type AS pos, dw.definition AS def"
        result = self.neo4j.run(cypher)
        # 构建：word → {pos, definition} 的字典
        return {record["word"]: {"pos": record["pos"], "def": record["def"]} for record in result}

    def recognize(self, user_input: str) -> dict:
        """
        输入：用户方言文本
        输出：{
            "original": 原始输入,
            "annotated": 标注文本（方言词+释义）,
            "standard_text": 标准语义转写,
            "dialect_words_found": 识别出的方言词列表,
            "noise_filtered": 过滤的语气词/重复词
        }
        """
        # Step 1: 词典词级标注
        annotated, dialect_words_found, noise_filtered = self._annotate_dialect_words(user_input)

        # Step 2: LLM句级语义转写
        standard_text = self._llm_rewrite(annotated, dialect_words_found)

        return {
            "original": user_input,
            "annotated": annotated,
            "standard_text": standard_text,
            "dialect_words_found": dialect_words_found,
            "noise_filtered": noise_filtered
        }

    def _annotate_dialect_words(self, text: str) -> tuple:
        """基于方言词典做词级标注+噪音过滤"""
        import jieba
        words = list(jieba.cut(text))
        annotated_parts = []
        dialect_words = []
        noise_words = []

        for w in words:
            if w in self.dialect_dict:
                info = self.dialect_dict[w]
                annotated_parts.append(f"{w}[方言:{info['def']}]")
                dialect_words.append({"word": w, "pos": info["pos"], "meaning": info["def"]})
            elif w in SICHUAN_NOISE_WORDS:  # 语气词列表（嘛、哦、哈、撒、咯等）
                noise_words.append(w)
                annotated_parts.append(w)  # 保留但标记
            else:
                annotated_parts.append(w)

        annotated = "".join(annotated_parts)
        return annotated, dialect_words, noise_words

    def _llm_rewrite(self, annotated: str, dialect_words: list) -> str:
        """LLM做句级语义转写，去除口语噪音，保留核心语义"""
        prompt = f"""
请将以下标注了方言词的四川话文本转写为标准普通话语义文本。
要求：
1. 保留核心语义信息
2. 将方言词替换为对应的普通话含义
3. 去除口语噪音（语气词、重复词）
4. 不改变用户意图

输入：{annotated}
方言词释义：{dialect_words}

输出标准语义文本："""
        return self.llm.generate(prompt)
```

#### 1.3 模块3：意图识别详细设计

```python
# backend/services/intent_classifier.py

class IntentClassifier:
    """意图识别模块：关键词匹配 + LLM分类"""

    def __init__(self, neo4j_conn, llm_client):
        self.neo4j = neo4j_conn
        self.llm = llm_client
        self.intent_keywords = self._load_intent_keywords()  # 从子图3加载

    def _load_intent_keywords(self) -> dict:
        """从Neo4j子图3加载意图-关键词映射"""
        cypher = """
        MATCH (i:UserIntent)-[:HAS_KEYWORD]->(k:KeywordFeature)
        RETURN i.intent_name AS intent, k.keyword AS keyword, k.weight AS weight
        """
        result = self.neo4j.run(cypher)
        mapping = {}
        for record in result:
            intent = record["intent"]
            if intent not in mapping:
                mapping[intent] = []
            mapping[intent].append({"keyword": record["keyword"], "weight": record["weight"]})
        return mapping

    def classify(self, standard_text: str, dialect_words: list) -> dict:
        """
        输入：标准语义文本 + 方言词列表
        输出：{
            "intent": 意图标签,
            "confidence": 置信度,
            "keywords_matched": 匹配的关键词,
            "all_candidates": 所有候选意图及得分
        }
        """
        # Step 1: 关键词匹配预评分
        keyword_scores = self._keyword_matching(standard_text, dialect_words)

        # Step 2: LLM意图分类（带关键词预评分作为提示）
        intent_result = self._llm_classify(standard_text, dialect_words, keyword_scores)

        return intent_result

    def _keyword_matching(self, text: str, dialect_words: list) -> dict:
        """基于子图3关键词做意图预评分"""
        scores = {}
        for intent, kw_list in self.intent_keywords.items():
            score = 0
            matched = []
            for kw in kw_list:
                if kw["keyword"] in text or kw["keyword"] in [d["word"] for d in dialect_words]:
                    score += kw["weight"]
                    matched.append(kw["keyword"])
            scores[intent] = {"score": score, "matched_keywords": matched}
        return scores
```

#### 1.4 模块4：知识图谱RAG检索详细设计

```python
# backend/services/kg_query.py

class KGQueryService:
    """知识图谱查询模块：意图→子图路由→子图内Cypher检索"""

    def __init__(self, neo4j_conn):
        self.neo4j = neo4j_conn
        self.router = SubgraphRouter(neo4j_conn)

    def query(self, intent: str, keywords: list, dialect_words: list) -> dict:
        """
        输入：意图标签 + 关键词 + 方言词
        输出：{
            "dialect_templates": 方言回复模板列表,
            "scene_corpus": 场景对话语料,
            "domain_knowledge": 领域文化知识,
            "dialect_expressions": 地道方言表达
        }
        """
        # Step 1: 意图→子图路由
        target_subgraphs = self.router.route(intent)
        # e.g. "ask_food" → ["subgraph2(scene=美食)", "subgraph4(type=Food)"]

        # Step 2: 子图内Cypher检索
        templates = self._search_templates(target_subgraphs, intent)
        corpus = self._search_corpus(target_subgraphs, keywords)
        knowledge = self._search_knowledge(target_subgraphs, keywords, dialect_words)

        return {
            "dialect_templates": templates,
            "scene_corpus": corpus,
            "domain_knowledge": knowledge,
            "dialect_expressions": self._extract_expressions(templates, corpus)
        }

    def _search_templates(self, subgraphs: list, intent: str) -> list:
        """查询方言回复模板"""
        cypher = """
        MATCH (s:DialogScene)-[:HAS_TEMPLATE]->(t:ReplyTemplate)
        WHERE s.scene_type = $scene_type
        RETURN t.template AS template, t.dialect_words AS dialect_words, t.style AS style
        """
        scene_type = INTENT_TO_SCENE_MAP[intent]  # ask_food → 美食讨论
        return self.neo4j.run(cypher, {"scene_type": scene_type})

    def _search_knowledge(self, subgraphs: list, keywords: list, dialect_words: list) -> list:
        """查询文化实体知识（子图4）"""
        cypher = """
        MATCH (ce:CulturalEntity)
        WHERE ce.name IN $keywords OR ce.dialect_alias IN $aliases
        RETURN ce.name AS name, ce.dialect_alias AS alias,
               ce.description AS desc, ce.region AS region, ce.popularity AS popularity
        """
        aliases = [d["word"] for d in dialect_words]
        return self.neo4j.run(cypher, {"keywords": keywords, "aliases": aliases})
```

```python
# backend/kg/subgraph_router.py

class SubgraphRouter:
    """意图→子图路由器，基于子图3的意图-检索映射"""

    def __init__(self, neo4j_conn):
        self.neo4j = neo4j_conn
        self.route_map = self._load_route_map()

    def _load_route_map(self) -> dict:
        """从Neo4j子图3加载意图-检索映射"""
        cypher = """
        MATCH (i:UserIntent)-[:TRIGGERS_RETRIEVAL]->(r:RetrievalEntry)
        RETURN i.intent_name AS intent, r.entry_type AS entry_type, r.subgraph AS subgraph
        """
        result = self.neo4j.run(cypher)
        return {record["intent"]: {"entry_type": record["entry_type"], "subgraph": record["subgraph"]}
                for record in result}

    def route(self, intent: str) -> list:
        """
        输入：意图标签
        输出：需要检索的子图列表
        e.g. ask_food → [subgraph2(美食场景), subgraph4(Food实体)]
        """
        route_info = self.route_map.get(intent, {})
        # 根据意图类型决定检索哪些子图
        INTENT_SUBGRAPH_MAP = {
            "ask_food":     ["subgraph2", "subgraph4"],
            "ask_travel":   ["subgraph2", "subgraph4"],
            "learn_dialect": ["subgraph1", "subgraph2"],
            "chat":         ["subgraph1", "subgraph2"],
        }
        return INTENT_SUBGRAPH_MAP.get(intent, ["subgraph1", "subgraph2"])
```

#### 1.5 模块5+6：生成+偏差纠正详细设计

```python
# backend/services/response_generator.py

class ResponseGenerator:
    """大模型方言响应生成模块"""

    def __init__(self, llm_client):
        self.llm = llm_client

    def generate(self, intent: str, kg_results: dict, recognized: dict) -> str:
        """Prompt注入KG知识 + 方言风格指令，生成方言初稿"""
        prompt = f"""你是四川方言智能助手"小方言"，必须用地道四川方言回复用户。

【知识图谱提供的参考知识】
方言回复模板：{kg_results['dialect_templates']}
场景对话语料：{kg_results['scene_corpus']}
领域文化知识：{kg_results['domain_knowledge']}
地道方言表达：{kg_results['dialect_expressions']}

【用户信息】
用户原文：{recognized['original']}
识别的方言词：{recognized['dialect_words_found']}
用户意图：{intent}

【生成要求】
1. 必须用四川方言回复，参考知识图谱提供的模板和语料
2. 回复要自然、地道，像本地人说话
3. 内容要准确回答用户问题
4. 适当使用四川方言语气词（嘛、哦、哈、撒）

请生成四川方言回复："""
        return self.llm.generate(prompt)
```

```python
# backend/services/dialect_corrector.py

class DialectCorrector:
    """方言偏差纠正模块：LLM二次校验Agent"""

    def __init__(self, llm_client, neo4j_conn):
        self.llm = llm_client
        self.neo4j = neo4j_conn

    def correct(self, draft_response: str, recognized: dict) -> str:
        """二次LLM校验方言地道性"""
        prompt = f"""请校验以下四川方言回复的地道性，逐项检查并修正：

【检查维度】
1. 方言词准确性：有无普通话词误用为方言词？方言词含义是否正确？
2. 语气词自然度：四川话常用语气词（嘛、哦、哈、撒、咯）是否自然使用？
3. 句式地道性：有无生硬书面语？是否符合四川话口语习惯？
4. 语义完整性：是否完整回答了用户的问题？

【回复初稿】
{draft_response}

【用户原始输入】
{recognized['original']}

请输出修正后的地道四川方言版本。如无问题则保持原样。"""
        return self.llm.generate(prompt)
```

#### 1.6 7层流水线编排

```python
# backend/services/pipeline.py

class ChatPipeline:
    """7层流水线编排器"""

    def __init__(self, input_processor, dialect_recognizer, intent_classifier,
                 kg_query, response_generator, dialect_corrector):
        self.module1 = input_processor
        self.module2 = dialect_recognizer
        self.module3 = intent_classifier
        self.module4 = kg_query
        self.module5 = response_generator
        self.module6 = dialect_corrector

    async def run(self, user_input: str) -> dict:
        """执行完整7层流水线"""
        # 模块1：输入预处理
        processed = self.module1.process(user_input)

        # 模块2：方言识别
        recognized = self.module2.recognize(processed)

        # 模块3：意图识别
        intent_result = self.module3.classify(
            recognized["standard_text"],
            recognized["dialect_words_found"]
        )

        # 模块4：KG RAG检索
        kg_results = self.module4.query(
            intent_result["intent"],
            intent_result["keywords_matched"],
            recognized["dialect_words_found"]
        )

        # 模块5：方言响应生成
        draft = self.module5.generate(intent_result["intent"], kg_results, recognized)

        # 模块6：偏差纠正
        final = self.module6.correct(draft, recognized)

        return {
            "response": final,                     # 最终方言回复
            "intent": intent_result["intent"],      # 识别的意图
            "dialect_words": recognized["dialect_words_found"],  # 识别的方言词
            "draft": draft,                         # 纠正前的初稿（调试用）
            "kg_context": kg_results                # KG检索结果（调试用）
        }
```

#### 1.7 FastAPI接口

```python
# backend/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="四川方言智能对话系统 API", version="1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"])

# 初始化各模块（按依赖顺序）
neo4j_conn = Neo4jConnector(config.NEO4J_URI, config.NEO4J_USER, config.NEO4J_PASSWORD)
llm_client = LLMClient(config.DEFAULT_MODEL)

pipeline = ChatPipeline(
    input_processor=InputProcessor(),
    dialect_recognizer=DialectRecognizer(neo4j_conn, llm_client),
    intent_classifier=IntentClassifier(neo4j_conn, llm_client),
    kg_query=KGQueryService(neo4j_conn),
    response_generator=ResponseGenerator(llm_client),
    dialect_corrector=DialectCorrector(llm_client, neo4j_conn)
)

@app.post("/api/chat")
async def chat(request: ChatRequest):
    """主对话接口"""
    result = await pipeline.run(request.text)
    return ChatResponse(**result)

@app.get("/api/health")
async def health():
    """系统健康检查"""
    return {"status": "ok", "neo4j": neo4j_conn.is_connected()}

@app.get("/api/subgraph/stats")
async def subgraph_stats():
    """各子图节点统计"""
    return neo4j_conn.get_stats()
```

---

### Phase 2：前端开发（3-4天）

#### 2.1 React前端核心页面

```
frontend/src/
├── App.tsx                      # 主布局：左侧对话+右侧信息面板
├── components/
│   ├── ChatWindow.tsx           # 对话窗口：消息列表+滚动
│   ├── InputBar.tsx             # 输入框+发送按钮
│   ├── MessageBubble.tsx        # 消息气泡：用户/助手消息，方言词高亮显示
│   ├── IntentTag.tsx            # 意图标签（美食/景点/学方言/闲聊）
│   ├── QuickQuestions.tsx       # 快捷提问按钮组（预置典型方言问题）
│   ├── DialectHighlight.tsx     # 方言词标注高亮组件
│   └── InfoPanel.tsx            # 右侧信息面板：意图+方言词+KG检索详情
├── services/
│   └── api.ts                   # 与FastAPI通信
└── types/
    └── chat.ts                  # TypeScript类型定义
```

#### 2.2 MVP核心功能清单

| 功能 | 优先级 | 说明 |
|------|--------|------|
| 方言对话窗口 | P0 | 发送方言文本，接收方言回复 |
| 方言词高亮 | P1 | 回复中方言词标注显示，点击可看释义 |
| 意图标签 | P1 | 每条回复附带意图标签 |
| 快捷提问 | P1 | 4个意图的典型方言问题按钮 |
| 信息面板 | P2 | 显示KG检索结果、方言词列表等调试信息 |

---

### Phase 3：端到端集成与调试（2-3天）

#### 3.1 集成测试示例

```
输入："成都啥子地方好耍嘛？"
→ 模块1: 预处理 → "成都啥子地方好耍嘛？"
→ 模块2: 识别 → annotated:"成都[啥子:什么]地方好[耍:玩]嘛？"
                  standard:"成都什么地方好玩？"
                  dialect_words:[{word:"啥子",meaning:"什么"},{word:"耍",meaning:"玩"}]
                  noise:[嘛]
→ 模块3: 意图 → ask_travel, keywords:[成都,耍], confidence:0.85
→ 模块4: RAG → 路由到subgraph2(旅游场景)+subgraph4(景点实体)
                → 方言模板:["我们切{景点}耍一哈嘛！"]
                → 文化实体:[宽窄巷子(dialect_alias:巷子), 锦里, 武侯祠]
→ 模块5: 生成 → "成都好耍的地方多得很！宽窄巷子、锦里都安逸，切耍一哈嘛！"
→ 模块6: 纠正 → 检查通过：方言词准确、语气词自然、句式地道
→ 模块7: 输出 → "成都好耍的地方多得很！宽窄巷子、锦里都安逸，切耍一哈嘛！"
```

#### 3.2 调试重点

- Neo4j Cypher查询返回结果是否符合预期
- 方言词标注覆盖率（是否有漏标）
- 意图识别准确率（4类意图是否正确分类）
- KG知识注入后LLM回复质量（对比有无KG的差异）
- 偏差纠正是否有效改善回复地道性

---

## 五、实验设计（EI会议论文导向）

> **论文定位**：EI检索会议论文，需有明确的创新点论证 + 可复现的实验 + 定量分析

### 5.1 小实验A：大模型方言生成能力选型 + 参数敏感度梯度分析

#### 5.1.1 实验目的

1. 选出最适合四川方言生成的大模型，用于系统后续模块
2. 分析关键生成参数（temperature、top_p、方言指令强度）对方言回复质量的影响
3. 为论文提供"模型选型+参数调优"的完整实验依据

#### 5.1.2 候选模型

| 模型 | 类型 | 调用方式 | 选入理由 |
|------|------|----------|----------|
| DeepSeek-V3 | 开源 | API | 中文理解强，开源可控 |
| Qwen2.5-72B-Instruct | 开源 | API | 中文生成质量好 |
| 通义千问（商业版） | 商业 | API | 中文生态成熟 |
| Doubao（豆包） | 商业 | API | 当前项目已使用 |
| ChatGLM4-9B | 开源 | 本地 | 学术项目适配 |

#### 5.1.3 评测维度

| 维度 | 定义 | 量化方式 |
|------|------|----------|
| 方言词汇准确率 | 回复中方言词是否正确使用（非生硬插入） | 正确方言词数/总方言词数 |
| 方言地道性 | 回复整体是否像地道四川话 | 人工评分1-5分（3人取均值） |
| 语义保真度 | 回复是否准确传达用户想问的信息 | 关键信息点覆盖率 |
| 语气词自然度 | 语气词（嘛/哦/哈/撒）是否自然融入 | 语气词位置合理性评分 |
| 回复完整性 | 是否完整回答了用户问题 | 信息完整性评分1-5 |

#### 5.1.4 参数敏感度梯度实验设计

**实验变量**：

| 参数 | 梯度值 | 说明 |
|------|--------|------|
| temperature | 0.3, 0.5, 0.7, 0.9, 1.1 | 控制生成随机性/创造性 |
| top_p | 0.5, 0.7, 0.9, 0.95 | 控制采样范围 |
| 方言指令强度 | 弱/中/强/极强 | Prompt中方言风格指令的明确程度 |

**方言指令强度梯度定义**：

| 级别 | Prompt描述 | 示例 |
|------|-----------|------|
| 弱 | 仅提示"用四川话回复" | "请用四川方言回复用户。" |
| 中 | 提示+少量方言词示例 | "请用四川方言回复，常用词：啥子、咋个、巴适、安逸" |
| 强 | 提示+方言词+句式模板 | "请用地道四川方言回复，参考模板：...，常用词列表..." |
| 枧强 | 提示+方言词+句式模板+KG知识注入 | 同模块5的完整Prompt，注入KG检索结果 |

**实验矩阵**：

```
对选出的最优模型（如2-3个候选），做以下交叉实验：

模型 × temperature梯度 × 方言指令强度 = N组实验
e.g. 3模型 × 5温度 × 4指令强度 = 60组

每组实验：
- 输入100条测试数据
- 记录：5维度评分
- 分析：参数变化对各维度评分的影响趋势
```

#### 5.1.5 评测数据集

- 从子图2场景语料中抽取100条典型方言对话
- 覆盖4大意图各25条
- 每条含：方言输入 + 标准语义标注 + 期望方言回复要点标注

#### 5.1.6 评测流程

```
Phase 1: 模型选型（粗筛）
- 5个模型，默认参数（temperature=0.7, top_p=0.9, 指令强度=中）
- 100条测试 → 自动评测（方言词准确率）+ 人工评测（地道性、语义保真度）
- 选出前2-3个最优模型

Phase 2: 参数敏感度（精调）
- 对选出的2-3个模型，做 temperature × 指令强度 梯度实验
- 每组100条 → 记录5维度评分
- 绘制参数敏感度曲线（各维度随参数变化的趋势图）

Phase 3: 结果分析
- 选出最优模型+最优参数组合
- 分析：temperature对方言地道性的影响、指令强度对语义保真度的影响
```

#### 5.1.7 论文呈现形式

| 呈现方式 | 内容 |
|----------|------|
| 表格1 | 5模型×5维度评分对比表（粗筛结果） |
| 雷达图 | 各模型5维度雷达图 |
| 表格2 | 参数梯度实验结果表（temperature × 地道性评分） |
| 抖线图 | temperature/指令强度对各维度的敏感度曲线 |
| 结论段 | 选定模型+最优参数+敏感度分析结论 |

---

### 5.2 小实验B：RAG检索策略对比 + 检索命中率分析

#### 5.2.1 实验目的

1. 验证"意图引导子图检索"策略的有效性（vs 全图检索 vs 无KG）
2. 分析检索命中率及其对最终回复质量的影响
3. 为论文提供"KG-RAG有效性"的核心实验论证

#### 5.2.2 实验设计

| 检索策略 | 描述 | 对照组/实验组 |
|----------|------|---------------|
| **意图引导子图检索**（实验组） | 意图→子图3路由→锁定子图→子图内Cypher检索 | 实验组 |
| 全图向量检索（对照组1） | 不做路由，全大图用Cypher+关键词匹配检索 | 对照组 |
| 无KG纯LLM（对照组2） | 不注入KG知识，LLM凭自身知识生成 | 基线 |

#### 5.2.3 评测维度

| 维度 | 定义 | 量化指标 |
|------|------|----------|
| 检索精准率 | 检索结果中与意图相关的节点占比 | Precision = relevant / retrieved |
| 检索召回率 | 应检索到的相关节点是否都被检索到 | Recall = retrieved_relevant / all_relevant |
| 检索命中率 | 检索结果被LLM有效利用的比例 | Hit Rate = used_in_response / retrieved |
| 回复地道性 | 有KG vs 无KG的地道性评分差 | Δ_地道性 |
| 方言词丰富度 | 回复中方言词数量变化 | count(dialect_words) |
| 噪音率 | 检索到的不相关节点占比 | Noise = irrelevant / retrieved |

#### 5.2.4 评测数据集

- 50条方言输入（覆盖4大意图各12-13条）
- 每条标注：
  - 期望检索到的节点类型（如ask_food → Food实体 + 美食场景模板）
  - 期望回复包含的知识点
  - 预期命中率

#### 5.2.5 评测流程

```
Phase 1: 检索质量评测
- 对50条测试输入，3种策略分别检索
- 记录：检索精准率、召回率、噪音率
- 分析：意图引导子图检索是否显著优于全图检索

Phase 2: 检索命中率分析
- 对实验组（意图引导子图检索）：
  - 记录每条检索结果中哪些节点被LLM实际引用
  - 计算命中率 = 被引用数 / 检索总数
  - 分析：命中率与回复地道性的相关性

Phase 3: 回复质量对比
- 3种策略分别生成回复
- 人工评测地道性(1-5)、语义正确性(1-5)
- 对比：有KG vs 无KG的回复质量差异
```

#### 5.2.6 论文呈现形式

| 呈现方式 | 内容 |
|----------|------|
| 表格1 | 3种策略的精准率/召回率/噪音率对比 |
| 柱状图 | 3种策略的地道性/语义正确性评分对比 |
| 散点图 | 命中率 vs 地道性评分的相关性散点图 |
| 案例分析 | 2-3个典型案例的3策略检索结果+回复对比 |
| 结论段 | 意图引导子图检索的有效性论证 + 命中率分析 |

---

### 5.3 大实验：端到端系统综合评测

#### 5.3.1 实验目的

1. 全面评估系统7层流水线的整体性能
2. 验证"方言原生全流程"设计理念的有效性
3. 分析各模块对最终回复质量的贡献度

#### 5.3.2 评测维度

| 维度 | 子指标 | 评测方式 |
|------|--------|----------|
| 方言识别准确率 | 方言词识别率、语气词过滤率 | 自动（对比标注） |
| 意图识别准确率 | 4类意图分类准确率 | 自动（对比标注） |
| 回复地道性 | 方言地道性评分(1-5)、语气词自然度(1-5) | 人工3人评分 |
| 语义正确性 | 回复是否准确回答用户问题(1-5) | 人工评分 |
| 方言词丰富度 | 回复中方言词数量、占比 | 自动统计 |
| 用户满意度 | 流畅度、沉浸感、满意度(1-5) | 用户问卷 |

#### 5.3.3 评测数据集

- 200条方言输入
- 来源分布：
  - 子图2语料抽取：80条
  - 网络真实对话：60条
  - 人工编写典型场景：60条
- 覆盖4大意图各50条
- 每条标注：方言词列表 + 期望意图 + 期望回复要点

#### 5.3.4 评测流程

```
Phase 1: 自动评测（200条全量）
- 方言词识别率 = 正确识别的方言词数 / 标注的方言词总数
- 意图分类准确率 = 正确分类数 / 200
- 方言词覆盖率 = 回复中方言词数 / 回复总词数
- 检索命中率 = KG节点被引用数 / KG检索节点总数

Phase 2: 人工评测（200条，3位评分员独立评分）
- 地道性(1-5)：回复整体是否地道四川话
- 语义正确性(1-5)：是否准确回答了用户问题
- 自然度(1-5)：语气词和句式是否自然
- 计算Cohen's Kappa一致性系数

Phase 3: 模块贡献度分析
- 对比实验：去掉模块6（偏差纠正）的系统 vs 完整系统
- 对比实验：去掉模块4（KG检索）的系统 vs 完整系统
- 分析各模块对最终回复质量的贡献度

Phase 4: 用户问卷（5-10人）
- 使用系统进行10轮对话
- 问卷评分：流畅度(1-5)、沉浸感(1-5)、满意度(1-5)
```

#### 5.3.5 论文呈现形式

| 呈现方式 | 内容 |
|----------|------|
| 表格1 | 200条自动评测汇总（识别率、意图准确率、覆盖率） |
| 表格2 | 人工评测评分汇总（地道性、语义正确性、自然度+Kappa） |
| 柱状图 | 各意图类型的评分对比 |
| 模块贡献度图 | 有/无各模块的评分差柱状图 |
| 案例分析 | 典型对话的7层流水线逐步输出展示 |
| 结论段 | 系统整体性能评估 + 方言原生全流程有效性论证 |

---

## 六、实验数据集构建规范

### 6.1 数据集格式

```json
// experiments/datasets/model_test_100.json
{
  "dataset_name": "四川方言模型选型评测集",
  "version": "1.0",
  "total": 100,
  "intents": {
    "ask_food": 25,
    "ask_travel": 25,
    "learn_dialect": 25,
    "chat": 25
  },
  "items": [
    {
      "id": "MT_001",
      "intent": "ask_food",
      "input": "成都啥子火锅好吃嘛？",
      "standard_meaning": "成都什么火锅好吃？",
      "dialect_words": ["啥子", "嘛"],
      "expected_key_points": ["推荐成都火锅", "使用方言词巴适/安逸"],
      "difficulty": "medium"
    },
    ...
  ]
}
```

### 6.2 评分标准

| 维度 | 1分 | 2分 | 3分 | 4分 | 5分 |
|------|-----|-----|-----|-----|-----|
| 地道性 | 完全普通话 | 大部分普通话，偶有方言词 | 半方言半普通话 | 大部分地道方言，少量不自然 | 完全地道四川话 |
| 语义正确性 | 完全偏离 | 大部分偏离 | 部分正确 | 大部分正确 | 完全准确 |
| 自然度 | 生硬书面语 | 较生硬 | 一般 | 较自然 | 非常自然口语化 |

---

## 七、论文结构预规划（EI会议论文）

### 建议论文标题

> **A Dialect-Native Knowledge Graph Enhanced Dialogue System for Sichuan Dialect: Architecture, RAG Strategy, and Evaluation**

或中文版：
> **基于知识图谱增强的四川方言原生对话系统：架构设计、RAG检索策略与评测**

### 论文结构

| 章节 | 内容 | 对应方案 |
|------|------|----------|
| 1. Introduction | 方言保护意义+对话系统现状+本文创新点 | §二系统架构 |
| 2. Related Work | 方言NLP + KG对话系统 + RAG | 背景调研 |
| 3. System Architecture | 7层流水线 + 4子图KG设计 | §二 + §1.2-1.7 |
| 4. Knowledge Graph Construction | 4子图构建方法+数据来源 | §三 + §Phase0 |
| 5. Experiments | 小实验A + 小实验B + 大实验 | §五 |
| 5.1 Exp A | 模型选型+参数敏感度 | §5.1 |
| 5.2 Exp B | RAG检索策略+命中率 | §5.2 |
| 5.3 Exp C | 端到端系统评测 | §5.3 |
| 6. Results & Discussion | 实验结果+分析+讨论 | 实验结果 |
| 7. Conclusion | 总结+局限+未来工作 | — |

### 创新点提炼（论文核心主张）

| 创新点 | 论证方式 | 对应实验 |
|--------|----------|----------|
| 方言原生全流程设计 | 7层流水线每层针对方言优化 | 大实验：各模块贡献度分析 |
| 方言知识图谱4子图架构 | KG提供本地真实语料 vs 纯LLM | 小实验B：有KG vs 无KG对比 |
| 意图引导子图检索RAG | 路由精准+检索高效 | 小实验B：精准率/召回率/命中率 |
| 方言偏差纠正Agent | 从"像方言"到"就是方言" | 大实验：有/无模块6对比 |

---

## 八、时间规划

| Phase | 任务 | 预估时间 | 依赖 |
|-------|------|----------|------|
| Phase 0 | 子图4建设（4000+节点爬取+LLM补充+入库）+数据验证+场景扩充 | 5-7天 | — |
| Phase 1 | 后端7层模块开发+FastAPI | 5-7天 | Phase 0完成 |
| Phase 2 | React前端开发 | 3-4天 | Phase 1的API可用 |
| Phase 3 | 端到端集成调试 | 2-3天 | Phase 1+2完成 |
| Phase 4 | 小实验A（模型选型+参数敏感度） | 3-4天 | Phase 3完成 |
| Phase 5 | 小实验B（RAG检索+命中率） | 2-3天 | Phase 3完成 |
| Phase 6 | 大实验（端到端系统评测） | 4-5天 | Phase 4+5完成 |
| Phase 7 | 论文撰写 | 7-10天 | Phase 6完成 |
| **总计** | | **约35-45天** | |

---

## 九、Trae CN执行指引

> 本方案供Trae CN逐步执行，以下是关键提示：

1. **先建子图4**：Phase 0最优先，子图4是ask_food/ask_travel意图的基础，目标4000+节点覆盖全四川21市
2. **子图4半自动化构建**：先爬取网站获取普通话实体数据→方言词典自动匹配别称→LLM补充缺失别称/话术→抽检审核→入库
2. **保留现有数据**：scdialect/目录下的子图CSV不要删除，已经导入Neo4j的数据保持不变
3. **参考旧代码但重构**：scdialect.py（Flask）和scdialect_kg.py（JSON版）可参考逻辑，但要重构为FastAPI+Neo4j版本
4. **模块独立开发**：每个services/下的模块先独立测试，再通过pipeline.py编排
5. **实验脚本独立**：experiments/目录与backend/分离，实验脚本直接调用backend的模块
6. **模型配置灵活**：LLMClient设计为多模型统一接口，方便实验A切换模型

---

## 十、风险与备选方案

| 风险 | 影响 | 备选方案 |
|------|------|----------|
| 子图4数据量达不到4000+ | 论文数据支撑不足 | 爬取范围扩大到21市+LLM批量生成表达模板和推荐话术；如仍不足，增加方言表达模板和推荐话术占比（这两类LLM生成质量高） |
| Neo4j导入失败 | RAG检索无法执行 | 退回JSON版KG（scdialect_kg.py），暂用JSON检索 |
| 模型API不稳定 | 实验A无法完成 | 增加本地模型（ChatGLM4-9B）作为备选 |
| 人工评分员不足 | 大实验评分一致性差 | 用LLM做自动评分（GPT-4作为评判），补充人工 |
| 参数敏感度实验组数太多 | 实验周期过长 | 减少梯度层级（temperature 3级×指令3级=9组） |

---

_方案完。后续如有调整，直接修改本文件并注明版本号。_
