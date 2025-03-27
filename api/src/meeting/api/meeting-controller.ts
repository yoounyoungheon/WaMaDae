import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MeetingService } from '../service/meeting.service';
import { CreateMeetingDto } from '../dto/create-meeting.dto';
import { MeetingEntity } from '../entity/meeting.entity';
import { AuthGuard } from '@nestjs/passport';
import { Member } from 'src/utils/decorater/get-member.decorator';
import { MemberEntity } from 'src/auth/member/member.entity';

@ApiTags('Meeting Controller')
@Controller('/meeting')
export class MeetingController {
  constructor(private readonly meetingService: MeetingService) {}

  @ApiOperation({ summary: '미팅 생성' })
  @UseGuards(AuthGuard())
  @ApiBearerAuth('access-token')
  @Post()
  async createMeeting(
    @Body() dto: CreateMeetingDto,
    @Member() member: MemberEntity,
  ): Promise<MeetingEntity> {
    return await this.meetingService.createMeeting(dto, member.memberId);
  }

  @ApiOperation({ summary: '모든 미팅 조회' })
  @Get()
  async loadMeetings(): Promise<MeetingEntity[]> {
    return await this.meetingService.loadMeetings();
  }

  @ApiOperation({ summary: '특정 날짜 범위의 미팅 조회' })
  @Get('/date')
  async loadMeetingsByDate(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<MeetingEntity[]> {
    return await this.meetingService.loadMeetingsByDate(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @ApiOperation({ summary: '미팅 삭제' })
  @UseGuards(AuthGuard())
  @ApiBearerAuth('access-token')
  @Delete('/:id')
  async deleteMeeting(@Param('id') id: string): Promise<void> {
    return await this.meetingService.deleteMeeting(id);
  }

  @ApiOperation({ summary: '미팅 업데이트' })
  @UseGuards(AuthGuard())
  @ApiBearerAuth('access-token')
  @Patch('/:id')
  async updateMeeting(
    @Param('id') id: string,
    @Body() dto: CreateMeetingDto,
  ): Promise<MeetingEntity> {
    return await this.meetingService.updateMeeting(id, dto);
  }
}
