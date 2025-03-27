import { BaseEntity } from 'src/utils/database/base-entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { MeetingEntity } from './meeting.entity';

@Entity()
export class BookEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  nickname: string;

  @Column()
  phoneNumber: string;

  @Column()
  isPaid: boolean;

  @ManyToOne(() => MeetingEntity, { eager: false })
  meeting: MeetingEntity;

  static create(
    name: string,
    nickname: string,
    phoneNumber: string,
    isPaid: boolean,
    meeting: MeetingEntity,
  ): BookEntity {
    const book = new BookEntity();
    book.name = name;
    book.nickname = nickname;
    book.phoneNumber = phoneNumber;
    book.isPaid = isPaid;
    book.meeting = meeting;
    return book;
  }
}
