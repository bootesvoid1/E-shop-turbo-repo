import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const RABBITMQ_URL = 'amqp://guest:guest@localhost:5672';
  app.enableCors({
    origin: 'http://localhost:4200', // or whatever your frontend origin is
    credentials: true, // if you use cookies or auth headers
  });
  await app.listen(3003);

  const microservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [RABBITMQ_URL],
      queue: 'product_queue',
      queueOptions: { durable: false },
    },
  });
  await microservice.listen();
}
bootstrap();
