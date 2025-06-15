import { bootstrapMicroservice } from '@repo/shared-entities';
import { QUEUE_NAMES } from '@repo/shared-entities';
import { UserModule } from './user/user.module';
async function bootstrap() {
  await bootstrapMicroservice({
    appModule: UserModule,
    port: 3002,
    queueName:QUEUE_NAMES.USER,
    enableCors: true,
    corsOrigin: 'http://localhost:4200',
    
  });
}
bootstrap();