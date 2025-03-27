import { BaseEntity } from 'src/utils/database/base-entity';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class MemberEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  memberId: string;

  @Column()
  username: string;

  @Column()
  name: string;

  @Column()
  password: string;
}
