import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BookService } from '../service/book.service';
import { CreateBookDto } from '../dto/create-book.dto';
import { BookEntity } from '../entity/book.entity';

@ApiTags('Book Controller')
@Controller('/book')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @ApiOperation({ summary: '예약 조회' })
  @Get(':id')
  async loadBook(@Param('id') id: string) {
    return await this.bookService.loadBook(id);
  }

  @ApiOperation({ summary: '미팅 별 예약 리스트 조회' })
  @Get('/project/:projectId')
  async loadBooks(@Param('projectId') projectId: string) {
    return await this.bookService.loadBooksByMeetingId(projectId);
  }

  @ApiOperation({ summary: '예약 생성' })
  @Post('/:meetingId')
  async createBook(
    @Param('meetingId') meetingId: string,
    @Body() dto: CreateBookDto,
  ): Promise<BookEntity> {
    return await this.bookService.createBook(meetingId, dto);
  }

  @ApiOperation({ summary: '전화번호로 예약 조회' })
  @Get('/phone/:phoneNumber')
  async loadBookByPhoneNumber(
    @Param('phoneNumber') phoneNumber: string,
  ): Promise<BookEntity[]> {
    return await this.bookService.loadBookByPhoneNumber(phoneNumber);
  }

  @ApiOperation({ summary: '예약 삭제' })
  @Delete('/:id')
  async deleteBook(@Param('id') id: string): Promise<void> {
    return await this.bookService.deleteBook(id);
  }

  @ApiOperation({ summary: '결제 상태 업데이트' })
  @Patch('/:id')
  async updatePaidStatus(@Param('id') id: string): Promise<BookEntity> {
    return await this.bookService.updatePaidStatus(id);
  }
}
