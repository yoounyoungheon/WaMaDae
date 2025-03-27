import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class AuthLoginRequestDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @ApiProperty({
    example: 'iddyoon@gmail.com',
    description: '사용자가 로그인에 사용할 email',
  })
  username: string;

  @IsString()
  @MinLength(2)
  @MaxLength(30)
  @ApiProperty({
    example: '!tbvjgjsl912',
    description: '사용자가 로그인에 사용할 password',
  })
  password: string;
}
