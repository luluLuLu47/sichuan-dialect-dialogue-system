# 隐私保护说明

## 不会被上传的文件

以下文件已被 `.gitignore` 排除，**不会**上传到GitHub：

### 敏感配置
- `.env` - 包含真实的API密钥和数据库密码
- `.env.local` - 本地环境配置

### 虚拟环境
- `venv/` - Python虚拟环境目录
- `.venv/` - 另一种虚拟环境命名

### 缓存和编译
- `__pycache__/` - Python缓存
- `*.pyc` - 编译文件

---

## 可以上传的文件

- `.env.example` - 环境变量模板（不包含真实密钥）
- `README.md` - 项目说明
- `*.py` - 源代码

---

## 配置步骤

### 1. 复制环境变量模板
```bash
cp .env.example .env
```

### 2. 编辑 .env 文件
填入你的真实配置：
- Neo4j数据库密码
- DeepSeek/OpenAI API密钥
- 其他敏感信息

**注意：** `.env` 文件不会被Git跟踪，可以安全地存储敏感信息。

---

## 验证 .gitignore

运行以下命令检查哪些文件会被忽略：
```bash
git status --ignored
```

或者检查特定文件：
```bash
git check-ignore .env
```

如果输出 `.env`，说明该文件已被正确忽略。