import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApprovalsService } from './approvals.service';
import { CreateApprovalDto, UpdateApprovalDto } from './dto/approval.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('approvals')
@Controller('approvals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat approval baru' })
  async create(@Body() dto: CreateApprovalDto, @CurrentUser('id') userId: string) {
    return this.approvalsService.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Daftar semua approval' })
  async findAll() {
    return this.approvalsService.findAll();
  }

  @Get('pending')
  @ApiOperation({ summary: 'Daftar approval pending untuk user' })
  async findPending(@CurrentUser('id') userId: string) {
    return this.approvalsService.findPending(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail approval' })
  async findOne(@Param('id') id: string) {
    return this.approvalsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update status approval' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateApprovalDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.approvalsService.update(id, dto, userId);
  }
}
