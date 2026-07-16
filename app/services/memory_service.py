from typing import Dict, Any, List, Optional
from datetime import datetime
from dataclasses import dataclass
from loguru import logger

@dataclass
class MemoryEntry:
    id: str
    session_id: str
    content: str
    timestamp: datetime
    memory_type: str
    summary: str = ""

class MemoryService:
    def __init__(self):
        self.short_term_memory: Dict[str, List[MemoryEntry]] = {}
        self.long_term_memory: Dict[str, List[MemoryEntry]] = {}
        self.session_summaries: Dict[str, Dict[str, Any]] = {}
        self.SHORT_TERM_LIMIT = 20
        self.LONG_TERM_LIMIT = 100

    async def add_memory(self, session_id: str, content: str, memory_type: str = "short_term", summary: str = ""):
        entry = MemoryEntry(
            id=f"mem_{datetime.now().timestamp()}",
            session_id=session_id,
            content=content,
            timestamp=datetime.now(),
            memory_type=memory_type,
            summary=summary
        )

        if memory_type == "short_term":
            if session_id not in self.short_term_memory:
                self.short_term_memory[session_id] = []
            self.short_term_memory[session_id].append(entry)
            if len(self.short_term_memory[session_id]) > self.SHORT_TERM_LIMIT:
                self.short_term_memory[session_id] = self.short_term_memory[session_id][-self.SHORT_TERM_LIMIT:]
        else:
            if session_id not in self.long_term_memory:
                self.long_term_memory[session_id] = []
            self.long_term_memory[session_id].append(entry)
            if len(self.long_term_memory[session_id]) > self.LONG_TERM_LIMIT:
                self.long_term_memory[session_id] = self.long_term_memory[session_id][-self.LONG_TERM_LIMIT:]

    async def get_short_term_memory(self, session_id: str) -> List[Dict[str, Any]]:
        entries = self.short_term_memory.get(session_id, [])
        return [self._entry_to_dict(e) for e in entries]

    async def get_long_term_memory(self, session_id: str) -> List[Dict[str, Any]]:
        entries = self.long_term_memory.get(session_id, [])
        return [self._entry_to_dict(e) for e in entries]

    async def get_session_summary(self, session_id: str) -> Optional[Dict[str, Any]]:
        return self.session_summaries.get(session_id)

    async def update_session_summary(self, session_id: str, summary: str, messages_count: int = 0):
        if session_id not in self.session_summaries:
            self.session_summaries[session_id] = {
                "session_id": session_id,
                "created_at": datetime.now(),
                "updated_at": datetime.now(),
                "summary": summary,
                "messages_count": messages_count,
                "topic": ""
            }
        else:
            self.session_summaries[session_id]["summary"] = summary
            self.session_summaries[session_id]["updated_at"] = datetime.now()
            self.session_summaries[session_id]["messages_count"] = messages_count

    async def get_all_sessions(self) -> List[Dict[str, Any]]:
        sessions = []
        for session_id, data in self.session_summaries.items():
            sessions.append({
                "session_id": session_id,
                "summary": data.get("summary", "暂无对话"),
                "updated_at": data.get("updated_at", datetime.now()).strftime("%Y-%m-%d %H:%M"),
                "messages_count": data.get("messages_count", 0),
                "topic": data.get("topic", "")
            })
        return sorted(sessions, key=lambda x: x["updated_at"], reverse=True)

    async def clear_memory(self, session_id: str):
        if session_id in self.short_term_memory:
            del self.short_term_memory[session_id]
        if session_id in self.long_term_memory:
            del self.long_term_memory[session_id]

    def _entry_to_dict(self, entry: MemoryEntry) -> Dict[str, Any]:
        return {
            "id": entry.id,
            "content": entry.content,
            "timestamp": entry.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "memory_type": entry.memory_type,
            "summary": entry.summary
        }


_memory_service: Optional[MemoryService] = None

def get_memory_service() -> MemoryService:
    global _memory_service
    if _memory_service is None:
        _memory_service = MemoryService()
    return _memory_service