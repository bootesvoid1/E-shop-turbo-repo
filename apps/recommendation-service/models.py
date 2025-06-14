from pydantic import BaseModel
from typing import List

class ProductModel(BaseModel):
    id: int
    name: str
    category: str
    tags: str

class RecommendationRequest(BaseModel):
    product_id: int

class RecommendationResponse(BaseModel):
    recommendations: List[ProductModel]