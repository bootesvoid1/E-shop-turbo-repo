import pika
import json

connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()

channel.queue_declare(queue='recommendation_queue')

message = {
    "product_id": "123"
}

channel.basic_publish(
    exchange='',  
    routing_key='recommendation_queue',  
    body=json.dumps(message)
)

print("✅ Sent message to recommendation_queue")
connection.close()