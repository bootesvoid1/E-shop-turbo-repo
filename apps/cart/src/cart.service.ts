import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartEntity } from '@bootesvoid1/shared-entities';
import { USER_MESSAGE_PATTERNS, PRODUCT_MESSAGE_PATTERNS } from '@bootesvoid1/shared-entities';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { CreateCartDto } from '@bootesvoid1/shared-entities';
import {UpdateCartDto} from '@bootesvoid1/shared-entities';
@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>,

    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @Inject('PRODUCT_SERVICE') private readonly productClient: ClientProxy,
  ) {}

  async create(createCartDto: CreateCartDto): Promise<CartEntity> {
    const { user_id, product_id, quantity } = createCartDto;

    // Use RabbitMQ to get user info
    const user = await this.sendAndWait(this.userClient, USER_MESSAGE_PATTERNS.USER_FIND_ONE, user_id);
    if (!user) {
      throw new NotFoundException(`User with ID ${user_id} not found`);
    }

    // Use RabbitMQ to get product info
    const product = await this.sendAndWait(this.productClient, PRODUCT_MESSAGE_PATTERNS.PRODUCT_FIND_ONE, product_id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${product_id} not found`);
    }

    if (product.stock < quantity) {
      throw new BadRequestException(`Not enough stock. Available: ${product.stock}`);
    }

    const existingCartItem = await this.cartRepository.findOne({
      where: {
        user: { id: user_id },
        product: { id: product_id },
      },
    });

    if (existingCartItem) {
      existingCartItem.quantity += quantity;
      return this.cartRepository.save(existingCartItem);
    }

    const newCartItem = this.cartRepository.create({
      quantity,
      user: { id: user_id },
      product: { id: product_id },
    });

    return this.cartRepository.save(newCartItem);
  }

  async findAll(): Promise<CartEntity[]> {
    try {
      return await this.cartRepository.find();
    } catch (error) {
      throw new InternalServerErrorException('Failed to get carts', error);
    }
  }

  async findAllByUser(user_id: number): Promise<CartEntity[]> {
    try {
      return await this.cartRepository.find({
        where: { user: { id: user_id } },
        relations: ['product'],
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to get carts by user', error);
    }
  }

  async findOne(id: number): Promise<CartEntity> {
    const cart = await this.cartRepository.findOne({ where: { id } });
    if (!cart) {
      throw new NotFoundException(`Cart with ID ${id} not found`);
    }
    return cart;
  }

  async update(id: number, updateCartDto: UpdateCartDto): Promise<CartEntity> {
    const cart = await this.cartRepository.findOne({ where: { id } });
    if (!cart) {
      throw new ConflictException(`Cart with ID ${id} not found`);
    }

    Object.assign(cart, updateCartDto);

    try {
      return await this.cartRepository.save(cart);
    } catch (error) {
      throw new InternalServerErrorException('Failed to update cart', error);
    }
  }

  async remove(cartItemId: number): Promise<void> {
    const cartItem = await this.cartRepository.findOne({ where: { id: cartItemId } });
    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID ${cartItemId} not found`);
    }

    await this.cartRepository.remove(cartItem);
  }

  // Helper method to send and wait for a response
  private async sendAndWait<T>(client: ClientProxy, pattern: any, data: any): Promise<T> {
    try {
      const result = await client.send(pattern, data).toPromise();
      return result;
    } catch (error) {
      throw new InternalServerErrorException(`Error communicating with service`, error);
    }
  }
}