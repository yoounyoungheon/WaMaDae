import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateBookDto {
  @ApiProperty({
    example: '홍길동',
    description: '예약자의 이름',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: '길동이',
    description: '예약자의 별명',
  })
  @IsString()
  nickname: string;

  @ApiProperty({
    example: '010-1234-5678',
    description: '예약자의 전화번호',
  })
  @IsString()
  phoneNumber: string;
}
