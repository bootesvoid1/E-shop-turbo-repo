import pika
import json
from models import RecommendationRequest, RecommendationResponse
from recommender import ContentRecommender

class RabbitMQConsumer:
    def __init__(self):
        self.recommender = ContentRecommender()
        self.connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
        self.channel = self.connection.channel()
        self.channel.queue_declare(queue='recommendation_queue')

    def on_request(self, ch, method, props, body):
        try:
            # Parse the incoming request
            data = RecommendationRequest(**json.loads(body))
            product_id = data.product_id

            # Get recommendations
            recommendations = self.recommender.recommend(product_id)
            
            # Convert recommendations to proper format
            # If your recommender returns product objects, convert them to dicts
            recommendations_data = []
            for rec in recommendations:
                if hasattr(rec, '__dict__'):
                    # If it's an object, convert to dict
                    recommendations_data.append(rec.__dict__)
                elif hasattr(rec, 'model_dump'):
                    # If it's a Pydantic model
                    recommendations_data.append(rec.model_dump())
                elif hasattr(rec, 'dict'):
                    # If it's a Pydantic v1 model
                    recommendations_data.append(rec.dict())
                else:
                    # If it's already a dict or simple type
                    recommendations_data.append(rec)

            # Create response using Pydantic 2.x syntax
            response = RecommendationResponse(recommendations=recommendations_data)
            
            # Convert to dict using Pydantic 2.x method
            response_dict = response.model_dump() if hasattr(response, 'model_dump') else response.dict()
            
            # Send response back
            ch.basic_publish(
                exchange='',
                routing_key=props.reply_to,
                properties=pika.BasicProperties(correlation_id=props.correlation_id),
                body=json.dumps(response_dict)
            )
            ch.basic_ack(delivery_tag=method.delivery_tag)
            
        except Exception as e:
            print(f"Error processing message: {e}")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

    def start_listening(self):
        self.channel.basic_qos(prefetch_count=1)  # Process one message at a time
        self.channel.basic_consume(queue='recommendation_queue', on_message_callback=self.on_request)
        print("Python service waiting for RPC requests...")
        try:
            self.channel.start_consuming()
        except KeyboardInterrupt:
            print("Stopping consumer...")
            self.channel.stop_consuming()
            self.connection.close()

    def __del__(self):
        """Cleanup connection when object is destroyed"""
        try:
            if hasattr(self, 'connection') and self.connection and not self.connection.is_closed:
                self.connection.close()
        except:
            pass