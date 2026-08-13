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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UpdateUserRoleDto } from './dto/user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Daftar semua user di workspace' })
  @ApiResponse({ status: 200, description: 'Daftar user berhasil diambil' })
  async findAll(@CurrentUser('workspaceId') workspaceId: string) {
    return this.usersService.findAll(workspaceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail user' })
  @ApiResponse({ status: 200, description: 'Data user berhasil diambil' })
  @ApiResponse({ status: 404, description: 'User tidak ditemukan' })
  async findOne(@Param('id') id: string, @CurrentUser('workspaceId') workspaceId: string) {
    return this.usersService.findOne(id, workspaceId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat user baru' })
  @ApiResponse({ status: 201, description: 'User berhasil dibuat' })
  @ApiResponse({ status: 409, description: 'Email atau username sudah terdaftar' })
  async create(@Body() dto: CreateUserDto, @CurrentUser('workspaceId') workspaceId: string) {
    return this.usersService.create(dto, workspaceId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update profil user' })
  @ApiResponse({ status: 200, description: 'User berhasil diupdate' })
  @ApiResponse({ status: 404, description: 'User tidak ditemukan' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser('workspaceId') workspaceId: string,
  ) {
    return this.usersService.update(id, dto, workspaceId);
  }

  @Patch(':id/role')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('manage_users', 'admin')
  @ApiOperation({ summary: 'Update role user' })
  @ApiResponse({ status: 200, description: 'Role user berhasil diupdate' })
  @ApiResponse({ status: 403, description: 'Tidak ada permission' })
  async updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
    @CurrentUser('workspaceId') workspaceId: string,
  ) {
    return this.usersService.updateRole(id, dto, workspaceId);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('delete_users', 'admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hapus user' })
  @ApiResponse({ status: 204, description: 'User berhasil dihapus' })
  @ApiResponse({ status: 403, description: 'Tidak ada permission' })
  async delete(@Param('id') id: string, @CurrentUser('workspaceId') workspaceId: string) {
    return this.usersService.delete(id, workspaceId);
  }
}
