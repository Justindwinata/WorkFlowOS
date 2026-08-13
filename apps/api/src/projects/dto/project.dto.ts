import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: 'WorkflowOS v1' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Project utama untuk fase 1' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsString()
  teamId: string;
}

export class UpdateProjectDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'active' })
  @IsOptional()
  @IsString()
  status?: string;
}
