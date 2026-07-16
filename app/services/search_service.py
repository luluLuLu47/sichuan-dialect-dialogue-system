from typing import Dict, Any, Optional
from loguru import logger
import httpx
import re

class SearchService:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }

    async def search_wikipedia(self, query: str) -> Dict[str, Any]:
        try:
            url = f"https://zh.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|pageimages&exintro=&explaintext=&pithumbsize=300&titles={query}"
            async with httpx.AsyncClient(headers=self.headers) as client:
                response = await client.get(url)
                data = response.json()

                if 'query' in data and 'pages' in data['query']:
                    pages = data['query']['pages']
                    for page_id, page_data in pages.items():
                        if page_id != '-1':
                            result = {
                                'title': page_data.get('title', ''),
                                'summary': page_data.get('extract', '')[:500],
                                'image': page_data.get('thumbnail', {}).get('source', '')
                            }
                            return {"status": "success", "data": result}

            return {"status": "not_found", "data": None}
        except Exception as e:
            logger.error(f"Wikipedia搜索失败: {e}")
            return {"status": "error", "data": None}

    async def search_baike(self, query: str) -> Dict[str, Any]:
        try:
            url = f"https://baike.baidu.com/item/{query}"
            async with httpx.AsyncClient(headers=self.headers, timeout=10) as client:
                response = await client.get(url)
                html = response.text

                summary_match = re.search(r'<div class="lemma-summary[^>]*>(.*?)</div>', html, re.DOTALL)
                title_match = re.search(r'<h1 class="title[^>]*>(.*?)</h1>', html)
                image_match = re.search(r'<div class="summary-pic[^>]*><img[^>]*src="([^"]+)"', html)

                result = {}
                if title_match:
                    result['title'] = re.sub(r'<[^>]+>', '', title_match.group(1)).strip()
                if summary_match:
                    summary = re.sub(r'<[^>]+>', '', summary_match.group(1)).strip()
                    result['summary'] = summary[:500]
                if image_match:
                    result['image'] = image_match.group(1)

                if result:
                    return {"status": "success", "data": result}

            return {"status": "not_found", "data": None}
        except Exception as e:
            logger.error(f"百度百科搜索失败: {e}")
            return {"status": "error", "data": None}

    async def search_image(self, query: str) -> str:
        try:
            url = f"https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt={query}&image_size=square"
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.get(url)
                data = response.json()
                if 'image_url' in data:
                    return data['image_url']
                return ""
        except Exception as e:
            logger.error(f"图片生成失败: {e}")
            return ""

    async def get_entity_info(self, query: str) -> Dict[str, Any]:
        baike_result = await self.search_baike(query)
        if baike_result['status'] == 'success':
            return baike_result

        wiki_result = await self.search_wikipedia(query)
        if wiki_result['status'] == 'success':
            return wiki_result

        image_url = await self.search_image(query)
        return {
            "status": "partial",
            "data": {
                "title": query,
                "summary": f"关于'{query}'的详细信息正在获取中...",
                "image": image_url
            }
        }


_search_service: Optional[SearchService] = None

def get_search_service() -> SearchService:
    global _search_service
    if _search_service is None:
        _search_service = SearchService()
    return _search_service