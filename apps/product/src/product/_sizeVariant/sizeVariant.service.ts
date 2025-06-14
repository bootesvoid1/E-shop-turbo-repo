import { SizesVariants } from '@hellcat29a/shared-entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SizeVariantService {
  constructor(
    @InjectRepository(SizesVariants)
    private readonly sizeVariantRepository: Repository<SizesVariants>,
  ) {}

  async create(createVariantDto: Partial<SizesVariants>) {
    const newVariant = this.sizeVariantRepository.create(createVariantDto);
    return await this.sizeVariantRepository.save(newVariant);
  }
}
