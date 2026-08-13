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
import { TeamsService } from './teams.service';
import { CreateTeamDto, UpdateTeamDto, AddTeamMemberDto } from './dto/team.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('teams')
@Controller('teams')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat tim baru' })
  async create(@Body() dto: CreateTeamDto, @CurrentUser('workspaceId') workspaceId: string) {
    return this.teamsService.create(dto, workspaceId);
  }

  @Get()
  @ApiOperation({ summary: 'Daftar semua tim' })
  async findAll(@CurrentUser('workspaceId') workspaceId: string) {
    return this.teamsService.findAll(workspaceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail tim' })
  async findOne(@Param('id') id: string, @CurrentUser('workspaceId') workspaceId: string) {
    return this.teamsService.findOne(id, workspaceId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update tim' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTeamDto,
    @CurrentUser('workspaceId') workspaceId: string,
  ) {
    return this.teamsService.update(id, dto, workspaceId);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Tambah anggota ke tim' })
  async addMember(
    @Param('id') id: string,
    @Body() dto: AddTeamMemberDto,
    @CurrentUser('workspaceId') workspaceId: string,
  ) {
    return this.teamsService.addMember(id, dto, workspaceId);
  }

  @Delete(':id/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hapus anggota dari tim' })
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @CurrentUser('workspaceId') workspaceId: string,
  ) {
    return this.teamsService.removeMember(id, userId, workspaceId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hapus tim' })
  async delete(@Param('id') id: string, @CurrentUser('workspaceId') workspaceId: string) {
    return this.teamsService.delete(id, workspaceId);
  }
}
