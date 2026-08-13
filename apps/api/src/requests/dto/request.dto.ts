import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRequestDto {
  @ApiProperty({ example: 'IT Access Request' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Need access to production database' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'it_access' })
  @IsString()
  type: string;

  @ApiPropertyOptional({ example: 'high' })
  @IsOptional()
  @IsString()
  priority?: string;
}

export class UpdateRequestStatusDto {
  @ApiProperty({ example: 'submitted' })
  @IsString()
  status: string;
}
