import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MeetingEntity } from '../entity/meeting.entity';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { CreateMeetingDto } from '../dto/create-meeting.dto';
import { MemberEntity } from 'src/auth/member/member.entity';
import { BookEntity } from '../entity/book.entity';
import { S3Service } from 'src/s3/s3.service';

@Injectable()
export class MeetingService {
  constructor(
    @InjectRepository(MeetingEntity)
    private readonly meetingRepository: Repository<MeetingEntity>,
    @InjectRepository(MemberEntity)
    private readonly memberRepository: Repository<MemberEntity>,
    @InjectRepository(BookEntity)
    private readonly bookRepository: Repository<BookEntity>,
    private readonly s3Service: S3Service,
  ) {}

  @Transactional()
  async createMeeting(
    dto: CreateMeetingDto,
    fileUrl: Express.Multer.File,
    memberId: string,
  ): Promise<MeetingEntity> {
    const member = await this.memberRepository.findOneBy({ memberId });
    if (!member) {
      throw new NotFoundException(`Member with ID "${memberId}" not found`);
    }
    const fileExtension = fileUrl.originalname.split('.').pop();
    const fileName = `${Date.now()}-${fileUrl.originalname}`;
    const uploadedFileUrl = await this.s3Service.uploadFile(
      fileName,
      fileUrl,
      fileExtension,
    );

    dto.imgUrl = uploadedFileUrl;
    const {
      sort,
      meetingName,
      description,
      place,
      fee,
      date,
      imgUrl,
      startTime,
      endTime,
    } = dto;

    const meeting = MeetingEntity.create(
      member,
      sort,
      meetingName,
      description,
      place,
      fee,
      date,
      imgUrl,
      startTime,
      endTime,
    );

    return await this.meetingRepository.save(meeting);
  }

  @Transactional()
  async loadMeetings(): Promise<MeetingEntity[]> {
    return await this.meetingRepository.find();
  }

  @Transactional()
  async loadMeetingsByDate(
    startDate: Date,
    endDate: Date,
  ): Promise<MeetingEntity[]> {
    return await this.meetingRepository
      .createQueryBuilder('meeting')
      .andWhere('meeting.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getMany();
  }

  @Transactional()
  async loadMeeting(id: string) {
    return await this.meetingRepository.findOneBy({ id });
  }

  @Transactional()
  async deleteMeeting(id: string): Promise<void> {
    const meeting = await this.meetingRepository.findOneBy({ id });
    const books = await this.bookRepository.findBy({ meeting });
    await this.bookRepository.remove(books);
    await this.meetingRepository.remove(meeting);
  }

  @Transactional()
  async updateMeeting(
    id: string,
    dto: CreateMeetingDto,
  ): Promise<MeetingEntity> {
    const meeting = await this.meetingRepository.findOneBy({ id });
    const {
      sort,
      meetingName,
      description,
      place,
      fee,
      date,
      imgUrl,
      startTime,
      endTime,
    } = dto;

    meeting.update(
      sort,
      meetingName,
      description,
      place,
      fee,
      date,
      imgUrl,
      startTime,
      endTime,
    );

    return await this.meetingRepository.save(meeting);
  }
}
