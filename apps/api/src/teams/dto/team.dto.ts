import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTeamDto {
  @ApiProperty({ example: 'Engineering' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Tim engineering inti' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateTeamDto {
  @ApiPropertyOptional({ example: 'Engineering Team' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class AddTeamMemberDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiPropertyOptional({ example: 'member' })
  @IsOptional()
  @IsString()
  role?: string;
}
