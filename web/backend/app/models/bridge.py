from pydantic import BaseModel


class BridgeInput(BaseModel):
    structureType: str
    span: float
    carriagewayWidth: float
    includeMedian: bool
    skewAngle: float
    girderMaterial: str
    deckMaterial: str


class AnalysisResult(BaseModel):
    maxMoment: float
    maxShear: float
    maxDisplacement: float
    status: str