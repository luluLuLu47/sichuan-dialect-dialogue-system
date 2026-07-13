# app/core/config.py
# 配置管理模块 - 使用pydantic-settings管理环境变量

from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator
from functools import lru_cache


class Settings(BaseSettings):
    """应用配置类"""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )
    
    # ==================== 应用配置 ====================
    app_name: str = Field(default="四川方言智能对话系统", alias="APP_NAME")
    app_version: str = Field(default="1.0.0", alias="APP_VERSION")
    debug: bool = Field(default=False, alias="DEBUG")
    environment: str = Field(default="development", alias="ENVIRONMENT")
    
    # ==================== 服务器配置 ====================
    host: str = Field(default="0.0.0.0", alias="HOST")
    port: int = Field(default=8000, alias="PORT")
    
    # ==================== Neo4j数据库配置 ====================
    neo4j_uri: str = Field(default="bolt://localhost:7687", alias="NEO4J_URI")
    neo4j_user: str = Field(default="neo4j", alias="NEO4J_USER")
    neo4j_password: str = Field(default="", alias="NEO4J_PASSWORD")
    neo4j_database: str = Field(default="neo4j", alias="NEO4J_DATABASE")
    
    # ==================== LLM配置 ====================
    llm_provider: str = Field(default="deepseek", alias="LLM_PROVIDER")
    
    # DeepSeek API
    deepseek_api_key: str = Field(default="", alias="DEEPSEEK_API_KEY")
    deepseek_base_url: str = Field(
        default="https://api.deepseek.com/v1", 
        alias="DEEPSEEK_BASE_URL"
    )
    deepseek_model: str = Field(default="deepseek-chat", alias="DEEPSEEK_MODEL")
    
    # OpenAI API
    openai_api_key: str = Field(default="", alias="OPENAI_API_KEY")
    openai_base_url: str = Field(
        default="https://api.openai.com/v1", 
        alias="OPENAI_BASE_URL"
    )
    openai_model: str = Field(default="gpt-3.5-turbo", alias="OPENAI_MODEL")
    
    # Ollama本地部署
    ollama_base_url: str = Field(default="http://localhost:11434", alias="OLLAMA_BASE_URL")
    ollama_model: str = Field(default="qwen2:7b", alias="OLLAMA_MODEL")
    
    # ==================== 日志配置 ====================
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")
    log_file: str = Field(default="logs/app.log", alias="LOG_FILE")
    
    # ==================== CORS配置 ====================
    cors_origins: str = Field(
        default='["http://localhost:3000", "http://localhost:8080"]',
        alias="CORS_ORIGINS"
    )
    
    @property
    def cors_origins_list(self) -> List[str]:
        """解析CORS源列表"""
        import json
        try:
            return json.loads(self.cors_origins)
        except:
            return ["http://localhost:3000", "http://localhost:8080"]
    
    @property
    def is_production(self) -> bool:
        """判断是否为生产环境"""
        return self.environment.lower() == "production"
    
    def get_llm_config(self) -> dict:
        """获取LLM配置"""
        if self.llm_provider == "deepseek":
            return {
                "provider": "deepseek",
                "api_key": self.deepseek_api_key,
                "base_url": self.deepseek_base_url,
                "model": self.deepseek_model
            }
        elif self.llm_provider == "openai":
            return {
                "provider": "openai",
                "api_key": self.openai_api_key,
                "base_url": self.openai_base_url,
                "model": self.openai_model
            }
        elif self.llm_provider == "ollama":
            return {
                "provider": "ollama",
                "base_url": self.ollama_base_url,
                "model": self.ollama_model
            }
        else:
            raise ValueError(f"不支持的LLM提供商: {self.llm_provider}")


@lru_cache()
def get_settings() -> Settings:
    """获取配置实例（单例）"""
    return Settings()


# 导出全局配置实例
settings = get_settings()