import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { UpdateFeatureDto } from './dto/update-feature.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { FindFeaturesQueryDto } from './dto/find-feature-query.dto';
import { FeaturesEntity, ProductsEntity } from '@hellcat29a/shared-entities';

@Injectable()
export class FeaturesService {
  constructor(
    @InjectRepository(FeaturesEntity)
    private readonly featuresRepository: Repository<FeaturesEntity>,
    @InjectRepository(ProductsEntity)
    private readonly productsRepository: Repository<ProductsEntity>,
  ) {}
  async create(createFeatureDto: CreateFeatureDto): Promise<FeaturesEntity> {
    const { name, products: productIds } = createFeatureDto;

    const featureExist = await this.featuresRepository.findOne({
      where: { name },
    });
    if (featureExist) {
      throw new ConflictException(`Feature with name ${name} already exists`);
    }

    let productsToAdd: ProductsEntity[] = [];
    if (productIds?.length > 0) {
      productsToAdd = await this.productsRepository.findBy({
        id: In(productIds),
      });
    }

    const newFeature = this.featuresRepository.create({
      ...createFeatureDto,
      products: productsToAdd,
    });

    try {
      return await this.featuresRepository.save(newFeature);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create Feature', error);
    }
  }

  async findAll(query: FindFeaturesQueryDto): Promise<FeaturesEntity[]> {
    const { productId, search, includeProducts } = query;
    console.log(includeProducts);

    const queryBuilder = this.featuresRepository.createQueryBuilder('feature');

    if (includeProducts) {
      queryBuilder.leftJoinAndSelect('feature.products', 'product');
    }

    if (productId) {
      queryBuilder
        .innerJoin('feature.products', 'product')
        .where('product.id = :productId', { productId });
    }

    if (search) {
      queryBuilder.andWhere('LOWER(feature.name) LIKE LOWER(:search)', {
        search: `%${search}%`,
      });
    }

    try {
      return await queryBuilder.getMany();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch features');
    }
  }

  async findOne(
    id: number,
    includeProducts: boolean = false,
  ): Promise<FeaturesEntity> {
    const queryBuilder = this.featuresRepository
      .createQueryBuilder('feature')
      .where('feature.id = :id', { id });

    console.log(includeProducts);
    if (includeProducts) {
      queryBuilder.leftJoinAndSelect('feature.products', 'product');
    }

    const feature = await queryBuilder.getOne();

    if (!feature) {
      throw new NotFoundException(`Feature with ID ${id} not found`);
    }

    return feature;
  }

  async update(
    id: number,
    updateFeatureDto: UpdateFeatureDto,
  ): Promise<FeaturesEntity> {
    const feature = await this.findOne(id);

    if (updateFeatureDto.name && updateFeatureDto.name !== feature.name) {
      const nameExists = await this.featuresRepository.findOne({
        where: { name: updateFeatureDto.name },
      });
      if (nameExists) {
        throw new ConflictException(
          `Feature with name ${updateFeatureDto.name} already exists`,
        );
      }
    }

    if (updateFeatureDto.products) {
      const products = await this.productsRepository.findBy({
        id: In(updateFeatureDto.products),
      });
      feature.products = products;
    }

    Object.assign(feature, {
      ...updateFeatureDto,
      products: feature.products,
    });

    try {
      return await this.featuresRepository.save(feature);
    } catch (error) {
      throw new InternalServerErrorException('Failed to update feature');
    }
  }

  async remove(id: number): Promise<void> {
    const result = await this.featuresRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Feature with ID ${id} not found`);
    }
  }
}
