import { MemberEntity } from 'src/auth/member/member.entity';
import { BaseEntity } from 'src/utils/database/base-entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity()
export class MeetingEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => MemberEntity, { eager: false })
  member: MemberEntity;

  @Column()
  sort: MeetingType;

  @Column()
  meetingName: string;

  @Column()
  description: string;

  @Column()
  place: string;

  @Column()
  fee: number;

  @Column()
  date: Date;

  @Column()
  imgUrl: string;

  @Column()
  startTime: string;

  @Column()
  endTime: string;

  update(
    sort: MeetingType,
    meetingName: string,
    description: string,
    place: string,
    fee: number,
    date: Date,
    imgUrl: string,
    startTime: string,
    endTime: string,
  ): void {
    this.sort = sort;
    this.meetingName = meetingName;
    this.description = description;
    this.place = place;
    this.fee = fee;
    this.date = date;
    this.imgUrl = imgUrl;
    this.startTime = startTime;
    this.endTime = endTime;
  }

  static create(
    member: MemberEntity,
    sort: MeetingType,
    meetingName: string,
    description: string,
    place: string,
    fee: number,
    date: Date,
    imgUrl: string,
    startTime: string,
    endTime: string,
  ): MeetingEntity {
    const meeting = new MeetingEntity();
    meeting.member = member;
    meeting.sort = sort;
    meeting.meetingName = meetingName;
    meeting.description = description;
    meeting.place = place;
    meeting.fee = fee;
    meeting.date = date;
    meeting.imgUrl = imgUrl;
    meeting.startTime = startTime;
    meeting.endTime = endTime;
    return meeting;
  }
}
