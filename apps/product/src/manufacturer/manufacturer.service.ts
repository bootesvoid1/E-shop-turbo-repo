import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateManufacturerDto } from './dto/create-manufacturer.dto';
import { UpdateManufacturerDto } from './dto/update-manufacturer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ManufacturersEntity,
  ProductsEntity,
} from '@hellcat29a/shared-entities';

@Injectable()
export class ManufacturerService {
  constructor(
    @InjectRepository(ManufacturersEntity)
    private readonly manufacturerRepository: Repository<ManufacturersEntity>,
    @InjectRepository(ProductsEntity)
    private readonly productRepository: Repository<ProductsEntity>,
  ) {}

  async create(
    createManufacturerDto: CreateManufacturerDto,
  ): Promise<ManufacturersEntity> {
    const { name, details, products } = createManufacturerDto;

    const existingManufacturer = await this.manufacturerRepository.findOneBy({
      name,
    });
    if (existingManufacturer) {
      throw new ConflictException(
        `Manufacturer with name '${name}' already exists`,
      );
    }

    let fetchedProducts: ProductsEntity[] = [];
    if (products && products.length > 0) {
      fetchedProducts = await this.productRepository.findByIds(products);
      if (fetchedProducts.length !== products.length) {
        throw new NotFoundException(`One or more products not found`);
      }
    }

    const newManufacturer = this.manufacturerRepository.create({
      name,
      details,
      products: fetchedProducts,
    });

    try {
      return await this.manufacturerRepository.save(newManufacturer);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to create manufacturer');
    }
  }

  async findAll(): Promise<ManufacturersEntity[]> {
    return await this.manufacturerRepository.find({ relations: ['products'] });
  }

  async findOne(id: number): Promise<ManufacturersEntity> {
    const manufacturer = await this.manufacturerRepository.findOne({
      where: { id },
      relations: ['products'],
    });

    if (!manufacturer) {
      throw new NotFoundException(`Manufacturer with ID ${id} not found`);
    }

    return manufacturer;
  }

  async update(
    id: number,
    updateManufacturerDto: UpdateManufacturerDto,
  ): Promise<ManufacturersEntity> {
    const { name, details, products } = updateManufacturerDto;

    const manufacturer = await this.manufacturerRepository.findOneBy({ id });
    if (!manufacturer) {
      throw new NotFoundException(`Manufacturer with ID ${id} not found`);
    }

    if (name && name !== manufacturer.name) {
      const existingManufacturer = await this.manufacturerRepository.findOneBy({
        name,
      });
      if (existingManufacturer) {
        throw new ConflictException(
          `Manufacturer with name '${name}' already exists`,
        );
      }
      manufacturer.name = name;
    }

    if (details) {
      manufacturer.details = details;
    }

    if (products && products.length > 0) {
      const fetchedProducts = await this.productRepository.findByIds(products);
      if (fetchedProducts.length !== products.length) {
        throw new NotFoundException(`One or more products not found`);
      }
      manufacturer.products = fetchedProducts;
    }

    try {
      return await this.manufacturerRepository.save(manufacturer);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to update manufacturer');
    }
  }

  async remove(id: number): Promise<void> {
    const manufacturer = await this.manufacturerRepository.findOneBy({ id });
    if (!manufacturer) {
      throw new NotFoundException(`Manufacturer with ID ${id} not found`);
    }

    try {
      await this.manufacturerRepository.remove(manufacturer);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to delete manufacturer');
    }
  }
}
