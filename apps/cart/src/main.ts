import { bootstrapMicroservice } from '@repo/shared-entities';
import { QUEUE_NAMES } from '@repo/shared-entities';
import { CartModule } from './cart.module';

async function bootstrap() {
  await bootstrapMicroservice({
    appModule: CartModule,
    port: 3003,
    queueName:QUEUE_NAMES.CART,
    enableCors: true,
    corsOrigin: 'http://localhost:4200',
    
  });
}
bootstrap();