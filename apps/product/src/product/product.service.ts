import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  CategoriesEntity,
  FeaturesEntity,
  ManufacturersEntity,
  ProductsEntity,
  SizesVariants,
  UsersEntity,
} from '@hellcat29a/shared-entities';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductsEntity)
    private readonly productRepository: Repository<ProductsEntity>,
    @InjectRepository(CategoriesEntity)
    private readonly categoryRepository: Repository<CategoriesEntity>,
    @InjectRepository(FeaturesEntity)
    private readonly featuresRepository: Repository<FeaturesEntity>,
    @InjectRepository(ManufacturersEntity)
    private readonly manufacturerRepository: Repository<ManufacturersEntity>,

    @InjectRepository(UsersEntity)
    private readonly userRepository: Repository<UsersEntity>,

    @InjectRepository(SizesVariants)
    private readonly sizeVariantRepository: Repository<SizesVariants>,
  ) {}
  async create(createProductDto: CreateProductDto): Promise<ProductsEntity> {
    const {
      sizes,
      user_id,
      category_id,
      manufacturer,
      features,
      ...productData
    } = createProductDto;

    const user = await this.userRepository.findOne({ where: { id: user_id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${user_id} not found`);
    }

    const category = await this.categoryRepository.findOneBy({
      id: category_id,
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${category_id} not found`);
    }

    const manufacturerEntity = manufacturer
      ? await this.manufacturerRepository.findOneBy({ id: manufacturer })
      : null;

    const fetchedFeatures = features?.length
      ? await this.featuresRepository.findBy({ id: In(features) })
      : [];

    let sizeVariants: any[] = [];
    if (sizes?.length) {
      sizeVariants = await this.sizeVariantRepository.findBy({ id: In(sizes) });

      if (sizeVariants.length !== sizes.length) {
        const foundIds = sizeVariants.map((s): any => s.id);
        const missingIds = sizes.filter((id) => !foundIds.includes(id));
        throw new NotFoundException(
          `SizeVariants not found for IDs: ${missingIds.join(', ')}`,
        );
      }
    }

    const newProduct = this.productRepository.create({
      ...productData,
      user,
      category,
      sizeVariants,
      manufacturer: manufacturerEntity ?? undefined,
      features: fetchedFeatures.length ? fetchedFeatures : undefined,
    });

    try {
      return await this.productRepository.save(newProduct);
    } catch (error) {
      if (error?.code === '23505') {
        throw new ConflictException('Product with this name already exists');
      }
      console.error(error);
      throw new InternalServerErrorException('Failed to create product');
    }
  }

  async findAll(relations: string[]): Promise<ProductsEntity[]> {
    try {
      return await this.productRepository.find({
        relations: relations.length > 0 ? relations : undefined,
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to get products with relations: ${relations.join(', ')}`,
        error,
      );
    }
  }

  async findOne(id: number): Promise<ProductsEntity> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'features', 'manufacturer'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductsEntity> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new ConflictException(`Product with ${id} does not exist`);
    }
    Object.assign(product, updateProductDto);
    try {
      return await this.productRepository.save(product);
    } catch (error) {
      throw new InternalServerErrorException('Failed to Update Product', error);
    }
  }

  async remove(id: number): Promise<string> {
    const product = await this.findOne(id);
    if (!product) {
      throw new ConflictException(`Product with ID ${id} does not exist`);
    }

    try {
      await this.productRepository.update(id, { status: 'archived' });
      return `Product ${product.name} has been archived`;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Failed to archive product',
        error,
      );
    }
  }
}
