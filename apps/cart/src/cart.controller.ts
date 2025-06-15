  import { BadRequestException, Controller } from '@nestjs/common';
  import { MessagePattern, Payload } from '@nestjs/microservices';
  import { CART_MESSAGE_PATTERNS } from '@repo/shared-entities/dist/modules/rabbitmq/patterns.enum';
  import { CartService } from './cart.service';
  import { CreateCartDto } from '@repo/shared-entities/dist/dto/create-cart.dto';
  import {UpdateCartDto} from '@repo/shared-entities/dist/dto/update-cart.dto';
  @Controller()
  export class CartController {
    constructor(private readonly cartService: CartService) {}

    @MessagePattern(CART_MESSAGE_PATTERNS.CART_CREATE)
    async create(@Payload() dto: CreateCartDto) {
      return await this.cartService.create(dto);
    }

    @MessagePattern(CART_MESSAGE_PATTERNS.CART_FIND_ALL)
    async findAll() {
      return await this.cartService.findAll();
    }

    @MessagePattern(CART_MESSAGE_PATTERNS.CART_FIND_ONE)
    async findOne(@Payload('id') id: number) {
      return await this.cartService.findOne(id);
    }

    @MessagePattern(CART_MESSAGE_PATTERNS.CART_UPDATE)
    async update(@Payload() dto: UpdateCartDto) {
      if (dto.id === undefined) {
        throw new BadRequestException('ID is required for updating cart');
      }
    
      return await this.cartService.update(dto.id, dto);
    }

    @MessagePattern(CART_MESSAGE_PATTERNS.CART_DELETE)
    async remove(@Payload('id') id: number) {
      return await this.cartService.remove(id);
    }

    @MessagePattern(CART_MESSAGE_PATTERNS.CART_FIND_BY_USER)
    async findAllByUser(@Payload('user_id') user_id: number) {
      return await this.cartService.findAllByUser(user_id);
    }
  }