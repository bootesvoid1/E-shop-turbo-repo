import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriesEntity } from '@hellcat29a/shared-entities';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoriesEntity)
    private readonly categoryRepository: Repository<CategoriesEntity>,
  ) {}
  async create(
    createCategoryDto: CreateCategoryDto,
  ): Promise<CategoriesEntity> {
    const { name, parent_id, description } = createCategoryDto;
    const categoryNameExist = await this.categoryRepository.findOne({
      where: { name },
    });
    if (categoryNameExist) {
      throw new ConflictException(`Category with name ${name} already exist`);
    }
    const newCategory = this.categoryRepository.create({
      name,
      description,
    });
    if (parent_id) {
      const parentCategory = await this.categoryRepository.findOne({
        where: { id: parent_id },
      });
      if (!parentCategory) {
        throw new NotFoundException(
          `Parent Category with ID ${parent_id} not found`,
        );
      }
      newCategory.parent = parentCategory;
    }
    try {
      return await this.categoryRepository.save(newCategory);
    } catch (error) {
      throw new InternalServerErrorException('Failed To create category');
    }
  }

  async findAll(relations: string[]): Promise<CategoriesEntity[]> {
    try {
      return await this.categoryRepository.find({
        relations: relations.length > 0 ? relations : undefined,
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed To Get Categories');
    }
  }

  async findOne(id: number, relations: string[]): Promise<CategoriesEntity> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: relations.length > 0 ? relations : undefined,
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoriesEntity> {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });
    if (!category) {
      throw new ConflictException(`Category with ID ${id} not found`);
    }
    Object.assign(category, updateCategoryDto);
    try {
      return await this.categoryRepository.save(category);
    } catch (error) {
      throw new InternalServerErrorException('Failed to update category');
    }
  }

  async remove(id: number): Promise<string> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new ConflictException(`Category with ID ${id} does not exist`);
    }
    try {
      await this.categoryRepository.remove(category);
      return `Category ${category.name} has been removed`;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to delete Category',
        error,
      );
    }
  }
}
