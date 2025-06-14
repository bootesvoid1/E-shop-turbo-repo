import { bootstrapMicroservice } from '@repo/shared-entities';
import { AuthModule } from './auth/auth.module';

async function bootstrap() {
  await bootstrapMicroservice({
    appModule: AuthModule,
    port: 3001,
    queueName: 'auth_queue',
    rabbitmqUrl: process.env.RABBITMQ_URL,
  });
}

bootstrap();