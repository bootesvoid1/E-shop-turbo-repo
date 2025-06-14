import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

describe('CartController', () => {
  let CartController: CartController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [CartService],
    }).compile();

    CartController = app.get<CartController>(CartController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(CartController.getHello()).toBe('Hello World!');
    });
  });
});
