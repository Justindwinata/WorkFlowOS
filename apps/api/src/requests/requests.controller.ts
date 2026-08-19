import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RequestsService } from './requests.service';
import { CreateRequestDto, UpdateRequestStatusDto } from './dto/request.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('requests')
@Controller('requests')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat request baru' })
  async create(@Body() dto: CreateRequestDto, @CurrentUser('id') userId: string, @CurrentUser('workspaceId') workspaceId: string) {
    return this.requestsService.create(dto, userId, workspaceId);
  }

  @Get()
  @ApiOperation({ summary: 'Daftar semua request' })
  async findAll(@CurrentUser('workspaceId') workspaceId: string) {
    return this.requestsService.findAll(workspaceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail request' })
  async findOne(@Param('id') id: string, @CurrentUser('workspaceId') workspaceId: string) {
    return this.requestsService.findOne(id, workspaceId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update status request' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateRequestStatusDto,
    @CurrentUser('workspaceId') workspaceId: string,
  ) {
    return this.requestsService.updateStatus(id, dto, workspaceId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hapus request' })
  async delete(@Param('id') id: string, @CurrentUser('workspaceId') workspaceId: string) {
    return this.requestsService.delete(id, workspaceId);
  }
}
