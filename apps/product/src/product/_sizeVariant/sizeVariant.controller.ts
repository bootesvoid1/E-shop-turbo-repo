import { SizesVariants } from '@hellcat29a/shared-entities';
import { Body, Controller, Post } from '@nestjs/common';
import { SizeVariantService } from './sizeVariant.service';

@Controller('size-variant')
export class SizeVariantController {
  constructor(private readonly sizeVariantService: SizeVariantService) {}

  @Post()
  create(@Body() createVariantDto: Partial<SizesVariants>) {
    const data = this.sizeVariantService.create(createVariantDto);
    return data;
  }
}
