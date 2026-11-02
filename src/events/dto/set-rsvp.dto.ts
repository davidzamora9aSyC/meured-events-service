import { IsIn } from 'class-validator';

export class SetRsvpDto {
  @IsIn(['GOING', 'INTERESTED', 'NONE'] as const)
  status!: 'GOING' | 'INTERESTED' | 'NONE';
}

