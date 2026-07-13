# app/services/llm_service.py
# LLM调用服务 - 支持DeepSeek/OpenAI/Ollama

from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any
import httpx
import json
from loguru import logger
from app.core.config import settings


class BaseLLMProvider(ABC):
    """LLM提供商基类"""
    
    @abstractmethod
    async def generate(
        self, 
        prompt: str, 
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000
    ) -> str:
        """生成回复"""
        pass
    
    @abstractmethod
    async def generate_stream(
        self, 
        prompt: str, 
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000
    ):
        """流式生成回复"""
        pass


class DeepSeekProvider(BaseLLMProvider):
    """DeepSeek API提供商"""
    
    def __init__(self):
        self.api_key = settings.deepseek_api_key
        self.base_url = settings.deepseek_base_url
        self.model = settings.deepseek_model
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000
    ) -> str:
        """调用DeepSeek API生成回复"""
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=self.headers,
                    json=payload
                )
                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"]
                
            except httpx.HTTPError as e:
                logger.error(f"DeepSeek API调用失败: {e}")
                raise
            except Exception as e:
                logger.error(f"DeepSeek生成异常: {e}")
                raise
    
    async def generate_stream(self, prompt: str, system_prompt: Optional[str] = None, 
                              temperature: float = 0.7, max_tokens: int = 2000):
        """流式生成（暂不实现）"""
        yield await self.generate(prompt, system_prompt, temperature, max_tokens)


class OpenAIProvider(BaseLLMProvider):
    """OpenAI API提供商"""
    
    def __init__(self):
        self.api_key = settings.openai_api_key
        self.base_url = settings.openai_base_url
        self.model = settings.openai_model
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000
    ) -> str:
        """调用OpenAI API生成回复"""
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=self.headers,
                    json=payload
                )
                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"]
                
            except httpx.HTTPError as e:
                logger.error(f"OpenAI API调用失败: {e}")
                raise
    
    async def generate_stream(self, prompt: str, system_prompt: Optional[str] = None, 
                              temperature: float = 0.7, max_tokens: int = 2000):
        """流式生成"""
        yield await self.generate(prompt, system_prompt, temperature, max_tokens)


class OllamaProvider(BaseLLMProvider):
    """Ollama本地部署提供商"""
    
    def __init__(self):
        self.base_url = settings.ollama_base_url
        self.model = settings.ollama_model
    
    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000
    ) -> str:
        """调用Ollama API生成回复"""
        
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": temperature,
                "num_predict": max_tokens
            }
        }
        
        if system_prompt:
            payload["system"] = system_prompt
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/api/generate",
                    json=payload
                )
                response.raise_for_status()
                data = response.json()
                return data.get("response", "")
                
            except httpx.HTTPError as e:
                logger.error(f"Ollama API调用失败: {e}")
                raise
    
    async def generate_stream(self, prompt: str, system_prompt: Optional[str] = None, 
                              temperature: float = 0.7, max_tokens: int = 2000):
        """流式生成"""
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": True,
            "options": {
                "temperature": temperature,
                "num_predict": max_tokens
            }
        }
        
        if system_prompt:
            payload["system"] = system_prompt
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream(
                "POST",
                f"{self.base_url}/api/generate",
                json=payload
            ) as response:
                async for line in response.aiter_lines():
                    if line:
                        data = json.loads(line)
                        if "response" in data:
                            yield data["response"]


class LLMService:
    """LLM服务统一接口"""
    
    def __init__(self):
        self.provider = self._create_provider()
        logger.info(f"LLM服务初始化: {settings.llm_provider}")
    
    def _create_provider(self) -> BaseLLMProvider:
        """创建LLM提供商实例"""
        provider_map = {
            "deepseek": DeepSeekProvider,
            "openai": OpenAIProvider,
            "ollama": OllamaProvider
        }
        
        provider_class = provider_map.get(settings.llm_provider.lower())
        if not provider_class:
            raise ValueError(f"不支持的LLM提供商: {settings.llm_provider}")
        
        return provider_class()
    
    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000
    ) -> str:
        """生成回复"""
        return await self.provider.generate(prompt, system_prompt, temperature, max_tokens)
    
    async def generate_stream(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000
    ):
        """流式生成回复"""
        async for chunk in self.provider.generate_stream(prompt, system_prompt, temperature, max_tokens):
            yield chunk
    
    async def generate_dialect_response(
        self,
        user_input: str,
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        生成方言对话回复
        
        Args:
            user_input: 用户输入
            context: 上下文信息（意图、场景等）
            
        Returns:
            方言回复
        """
        system_prompt = """你是四川方言智能对话助手。
请用四川方言风格回复用户。
保持回复自然、亲切、有趣。
可以适当使用方言词汇如"巴适"、"安逸"、"要得"、"啥子"等。"""
        
        # 如果有上下文信息，添加到提示中
        if context:
            context_str = f"\n\n上下文信息：\n"
            if context.get("intent"):
                context_str += f"- 意图：{context['intent']}\n"
            if context.get("scene"):
                context_str += f"- 场景：{context['scene']}\n"
            if context.get("entities"):
                context_str += f"- 相关实体：{', '.join(context['entities'])}\n"
            system_prompt += context_str
        
        return await self.generate(user_input, system_prompt)


# 单例实例
_llm_service: Optional[LLMService] = None


def get_llm_service() -> LLMService:
    """获取LLM服务实例"""
    global _llm_service
    if _llm_service is None:
        _llm_service = LLMService()
    return _llm_service