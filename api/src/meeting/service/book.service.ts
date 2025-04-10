import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BookEntity } from '../entity/book.entity';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { CreateBookDto } from '../dto/create-book.dto';
import { MeetingEntity } from '../entity/meeting.entity';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(BookEntity)
    private readonly bookRepository: Repository<BookEntity>,
    @InjectRepository(MeetingEntity)
    private readonly meetingRepository: Repository<MeetingEntity>,
  ) {}

  @Transactional()
  async createBook(meetingId: string, dto: CreateBookDto) {
    const meeting = await this.meetingRepository.findOneBy({ id: meetingId });
    if (!meeting) {
      throw new NotFoundException(`Meeting with ID "${meetingId}" not found`);
    }
    const { name, nickname, phoneNumber } = dto;
    const book = BookEntity.create(name, nickname, phoneNumber, false, meeting);
    return await this.bookRepository.save(book);
  }

  @Transactional()
  async loadBook(id: string) {
    const book = await this.bookRepository.findOneBy({ id });
    if (!book) {
      throw new NotFoundException();
    }
    return book;
  }

  @Transactional()
  async loadBooksByMeetingId(meetingId: string) {
    const meeting = await this.meetingRepository.findOneBy({ id: meetingId });
    if (!meeting) {
      throw new NotFoundException();
    }
    const books = await this.bookRepository.find({
      where: { meeting: { id: meetingId } },
      relations: ['meeting'],
    });

    return books;
  }

  @Transactional()
  async loadBookByPhoneNumber(phoneNumber: string) {
    const meetings = await this.bookRepository.findBy({ phoneNumber });
    return meetings;
  }

  @Transactional()
  async deleteBook(id: string): Promise<void> {
    const book = await this.bookRepository.findOneBy({ id });
    if (!book) {
      throw new NotFoundException(`Book with ID "${id}" not found`);
    }
    await this.bookRepository.remove(book);
  }

  @Transactional()
  async updatePaidStatus(id: string): Promise<BookEntity> {
    const book = await this.bookRepository.findOneBy({ id });
    if (!book) {
      throw new Error(`Book with ID "${id}" not found`);
    }
    const currentStatus = book.isPaid;
    book.isPaid = !currentStatus;
    return await this.bookRepository.save(book);
  }
}
