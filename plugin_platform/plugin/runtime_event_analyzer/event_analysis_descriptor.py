class EventAnalysisDescriptor:
    def __init__(self, analysis_id: str, metadata_id: str, analysis_type: str, metadata: dict, trace_id: str):
        self.analysis_id = analysis_id
        self.metadata_id = metadata_id
        self.analysis_type = analysis_type
        self.metadata = metadata
        self.trace_id = trace_id

    def to_dict(self) -> dict:
        return {
            "analysis_id": self.analysis_id,
            "metadata_id": self.metadata_id,
            "analysis_type": self.analysis_type,
            "metadata": self.metadata,
            "trace_id": self.trace_id
        }
