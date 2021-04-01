/* eslint-disable max-classes-per-file */
import {
  Field,
  ID,
  ObjectType,
} from 'type-graphql';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import md5 from 'crypto-js/md5';

export class UserMeta {
  referralCount?: number;

  bonusCount?: number;
}

@ObjectType()
@Entity()
export default class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field()
  @Column()
  email!: string;

  @Field({ defaultValue: false })
  @Column({ default: false })
  hasConfirmedEmail!: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  referrerId!: string;

  @Field({ defaultValue: 0 })
  @Column({ default: 0 })
  points!: number;

  @Field({ defaultValue: 0 })
  @Column({ default: 0 })
  position!: number;

  get hash(): string {
    const st = `${this.id}${this.email}${this.createdAt}fakeSalt`;
    return md5(st).toString();
  }

  @Column({ type: 'jsonb', default: {} })
  meta!: UserMeta;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
