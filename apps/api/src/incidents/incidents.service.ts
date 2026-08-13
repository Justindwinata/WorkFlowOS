import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIncidentDto, UpdateIncidentDto, AssignIncidentDto } from './dto/incident.dto';

@Injectable()
export class IncidentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateIncidentDto) {
    return this.prisma.incident.create({
      data: {
        title: dto.title,
        description: dto.description,
        severity: dto.severity || 'medium',
        priority: dto.priority || 'medium',
        affectedService: dto.affectedService,
      },
      include: { assignee: true },
    });
  }

  async findAll() {
    return this.prisma.incident.findMany({
      include: { assignee: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const incident = await this.prisma.incident.findUnique({
      where: { id },
      include: { assignee: true },
    });

    if (!incident) {
      throw new NotFoundException('Incident tidak ditemukan');
    }

    return incident;
  }

  async update(id: string, dto: UpdateIncidentDto) {
    const incident = await this.prisma.incident.findUnique({
      where: { id },
    });

    if (!incident) {
      throw new NotFoundException('Incident tidak ditemukan');
    }

    return this.prisma.incident.update({
      where: { id },
      data: {
        title: dto.title ?? incident.title,
        description: dto.description ?? incident.description,
        status: dto.status ?? incident.status,
        severity: dto.severity ?? incident.severity,
        priority: dto.priority ?? incident.priority,
        resolution: dto.resolution ?? incident.resolution,
      },
      include: { assignee: true },
    });
  }

  async assignUser(id: string, dto: AssignIncidentDto) {
    const incident = await this.prisma.incident.findUnique({
      where: { id },
    });

    if (!incident) {
      throw new NotFoundException('Incident tidak ditemukan');
    }

    return this.prisma.incident.update({
      where: { id },
      data: { assigneeId: dto.assigneeId },
      include: { assignee: true },
    });
  }

  async delete(id: string) {
    const incident = await this.prisma.incident.findUnique({
      where: { id },
    });

    if (!incident) {
      throw new NotFoundException('Incident tidak ditemukan');
    }

    await this.prisma.incident.delete({ where: { id } });
    return { message: 'Incident berhasil dihapus' };
  }
}
