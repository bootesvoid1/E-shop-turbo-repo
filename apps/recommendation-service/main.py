from fastapi import FastAPI
import threading
from rabbitmq_client import RabbitMQConsumer
from recommender import ContentRecommender
from models import RecommendationRequest, RecommendationResponse

app = FastAPI(title="Recommendation Microservice")
recommender = ContentRecommender()

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/recommend", response_model=RecommendationResponse)
def recommend(request: RecommendationRequest):
    results = recommender.recommend(request.product_id)
    return {"recommendations": results}

# Start RabbitMQ consumer in background thread
def start_rabbitmq():
    consumer = RabbitMQConsumer()
    consumer.start_listening()

threading.Thread(target=start_rabbitmq, daemon=True).start()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)