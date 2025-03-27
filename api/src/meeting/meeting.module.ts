import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { MemberEntity } from 'src/auth/member/member.entity';
import { BookEntity } from './entity/book.entity';
import { MeetingEntity } from './entity/meeting.entity';
import { MeetingService } from './service/meeting.service';
import { BookService } from './service/book.service';
import { MeetingController } from './api/meeting-controller';
import { BookController } from './api/book-controller';

@Module({
  controllers: [MeetingController, BookController],
  providers: [MeetingService, BookService],
  imports: [
    AuthModule,
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 20000,
        maxRedirects: 5,
      }),
    }),
    TypeOrmModule.forFeature([MemberEntity, BookEntity, MeetingEntity]),
  ],
})
export class MeetingModule {}
