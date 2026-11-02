import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @MaxLength(180)
  title!: string;

  @IsString()
  @MaxLength(12000)
  description!: string;

  @IsDateString()
  startAt!: string;

  @IsDateString()
  endAt!: string;

  @IsOptional()
  @IsString()
  organizerEntityId?: string;
}

