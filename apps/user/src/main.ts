import { bootstrapMicroservice } from '@repo/shared-entities';
import { UserModule } from './user/user.module';
import { SERVICE_NAMES } from '@repo/shared-entities';

async function bootstrap() {
  await bootstrapMicroservice({
    appModule: UserModule,
    port: 3002,
    queueName: SERVICE_NAMES.USER,
    enableCors: true,
    corsOrigin: 'http://localhost:4200',
  });
}
bootstrap();