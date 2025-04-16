import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsDate,
  IsOptional,
} from 'class-validator';

export class CreateMeetingDto {
  @ApiProperty({
    example: 'class',
    description: '미팅 유형 (club, class)',
  })
  @IsNotEmpty()
  sort: MeetingType;

  @ApiProperty({
    example: '스터디 모임',
    description: '미팅 이름',
  })
  @IsString()
  @IsNotEmpty()
  meetingName: string;

  @ApiProperty({
    example: '프로그래밍 스터디를 위한 모임입니다.',
    description: '미팅 설명',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: '서울 강남구 카페',
    description: '미팅 장소',
  })
  @IsString()
  @IsNotEmpty()
  place: string;

  @ApiProperty({
    example: 10000,
    description: '미팅 참가비',
  })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  fee: number;

  @ApiProperty({
    example: '2025-03-28',
    description: '미팅 날짜',
  })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  date: Date;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    isArray: true,
    description: '업로드할 파일',
  })
  @IsOptional()
  @IsString()
  imgUrl?: string;

  @ApiProperty({
    example: '14:00',
    description: '미팅 시작 시간',
  })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({
    example: '16:00',
    description: '미팅 종료 시간',
  })
  @IsString()
  @IsNotEmpty()
  endTime: string;
}
