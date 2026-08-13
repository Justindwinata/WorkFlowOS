import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, UpdateUserRoleDto } from './dto/user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(workspaceId: string) {
    return this.prisma.user.findMany({
      where: { workspaceId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        status: true,
        role: { select: { id: true, name: true } },
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string, workspaceId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, workspaceId },
      include: { role: { include: { permissions: true } } },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    return user;
  }

  async create(dto: CreateUserDto, workspaceId: string) {
    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { username: dto.username }] },
    });

    if (existingUser) {
      throw new ConflictException('Email atau username sudah terdaftar');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    let memberRole = await this.prisma.role.findUnique({
      where: { name: 'member' },
    });

    if (!memberRole) {
      memberRole = await this.prisma.role.create({
        data: {
          name: 'member',
          description: 'Default member role',
        },
      });
    }

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        workspaceId,
        roleId: memberRole.id,
      },
      include: { role: true },
    });

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role.name,
      createdAt: user.createdAt,
    };
  }

  async update(id: string, dto: UpdateUserDto, workspaceId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, workspaceId },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        firstName: dto.firstName ?? user.firstName,
        lastName: dto.lastName ?? user.lastName,
        avatar: dto.avatar ?? user.avatar,
      },
      include: { role: true },
    });

    return {
      id: updated.id,
      email: updated.email,
      username: updated.username,
      firstName: updated.firstName,
      lastName: updated.lastName,
      avatar: updated.avatar,
      role: updated.role.name,
    };
  }

  async updateRole(id: string, dto: UpdateUserRoleDto, workspaceId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, workspaceId },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    const role = await this.prisma.role.findUnique({
      where: { id: dto.roleId },
    });

    if (!role) {
      throw new NotFoundException('Role tidak ditemukan');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { roleId: dto.roleId },
      include: { role: true },
    });

    return {
      id: updated.id,
      email: updated.email,
      role: updated.role.name,
      updatedAt: updated.updatedAt,
    };
  }

  async delete(id: string, workspaceId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, workspaceId },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User berhasil dihapus' };
  }
}
