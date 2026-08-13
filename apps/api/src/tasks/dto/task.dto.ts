import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ example: 'Setup authentication' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Implement JWT-based auth' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsString()
  projectId: string;

  @ApiPropertyOptional({ example: 'high' })
  @IsOptional()
  @IsString()
  priority?: string;

  @ApiPropertyOptional()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  assigneeIds?: string[];
}

export class UpdateTaskDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  priority?: string;

  @ApiPropertyOptional()
  @IsOptional()
  dueDate?: string;
}

export class AssignTaskDto {
  @ApiProperty()
  @IsString()
  userId: string;
}
