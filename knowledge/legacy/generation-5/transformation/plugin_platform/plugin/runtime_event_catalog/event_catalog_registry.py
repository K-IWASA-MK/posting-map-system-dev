from .event_catalog_descriptor import EventCatalogDescriptor

class EventCatalogRegistry:
    def __init__(self):
        self._catalogs = {}

    def register(self, descriptor: EventCatalogDescriptor):
        assert descriptor.catalog_id is not None, "Descriptor catalog_id must not be None"
        self._catalogs[descriptor.catalog_id] = descriptor

    def get(self, catalog_id: str) -> EventCatalogDescriptor:
        return self._catalogs.get(catalog_id)

    def get_all(self) -> list:
        # 決定論的ソート (1. catalog_id 昇順)
        return sorted(self._catalogs.values(), key=lambda x: x.catalog_id)
