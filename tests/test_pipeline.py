# tests/test_pipeline.py
# 流水线测试

import pytest
from app.services.pipeline_service import PipelineService


@pytest.mark.asyncio
async def test_pipeline_basic():
    """测试基本流水线处理"""
    pipeline = PipelineService()
    
    # 测试美食查询
    result = await pipeline.process("成都哪里的火锅好吃？")
    assert result.final_response
    assert result.intent == "美食查询"
    assert "火锅" in result.entities
    
    # 测试旅游推荐
    result = await pipeline.process("九寨沟值不值得去？")
    assert result.final_response
    assert result.intent == "旅游推荐"


@pytest.mark.asyncio
async def test_normalize_input():
    """测试输入标准化"""
    pipeline = PipelineService()
    
    text = "成都火锅好吃撒！"
    normalized = await pipeline._normalize_input(text)
    
    assert normalized
    assert len(normalized) > 0


@pytest.mark.asyncio
async def test_intent_detection():
    """测试意图识别"""
    pipeline = PipelineService()
    
    intent = await pipeline._detect_intent("火锅好吃吗")
    assert intent == "美食查询"
    
    intent = await pipeline._detect_intent("九寨沟怎么去")
    assert intent == "旅游推荐"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])