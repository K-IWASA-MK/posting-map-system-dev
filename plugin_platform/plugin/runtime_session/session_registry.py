from .session_descriptor import SessionDescriptor

class SessionRegistry:
    def __init__(self):
        self._sessions = {}

    def register(self, descriptor: SessionDescriptor):
        assert descriptor.session_id is not None, "Descriptor session_id must not be None"
        self._sessions[descriptor.session_id] = descriptor

    def get(self, session_id: str) -> SessionDescriptor:
        return self._sessions.get(session_id)

    def get_all(self) -> list:
        # 決定論的ソート (1. session_id 昇順)
        return sorted(self._sessions.values(), key=lambda x: x.session_id)
