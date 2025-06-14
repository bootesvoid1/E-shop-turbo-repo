import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { FeaturesService } from './features.service';
import { CreateFeatureDto } from './dto/create-feature.dto';
import { UpdateFeatureDto } from './dto/update-feature.dto';
import { FindFeaturesQueryDto } from './dto/find-feature-query.dto';

@Controller('features')
export class FeaturesController {
  constructor(private readonly featuresService: FeaturesService) {}

  @Post('create')
  create(@Body() createFeatureDto: CreateFeatureDto) {
    return this.featuresService.create(createFeatureDto);
  }
  @Get('all')
  findAll(@Query() query: FindFeaturesQueryDto) {
    return this.featuresService.findAll(query);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('includeProducts') includeProducts: string,
  ) {
    return this.featuresService.findOne(+id, includeProducts === 'true');
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() updateFeatureDto: UpdateFeatureDto) {
    return this.featuresService.update(+id, updateFeatureDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.featuresService.remove(+id);
  }
}
