/* eslint-disable camelcase */
import { inject, injectable } from 'tsyringe';
import { Repository } from 'typeorm';
import { cargoQueue, QueueObject } from 'async';
import User from '../entities/User';

type StreamUser = {
  user_id: User['id'],
  user_email: User['email'],
  user_hasConfirmedEmail: User['hasConfirmedEmail'],
  user_referrerId: User['referrerId'],
  user_points: User['points'],
  user_position: User['position'],
  user_meta: User['meta'],
  user_createdAt: User['createdAt'],
  user_updatedAt: User['updatedAt']
};

type StreamUserPositioned = {
  streamUser: StreamUser;
  position: number;
};

// @singleton()
@injectable()
export default class ProcessReferralsService {
  updateQueue: QueueObject<StreamUser>;

  runningPosition: number;

  constructor(
    @inject('UserRepository') private userRepository: Repository<User>,
  ) {
    this.runningPosition = 0;
    this.updateQueue = cargoQueue<StreamUser>(async (streamUsers, callback) => {
      const streamUsersPositioned = streamUsers.map<StreamUserPositioned>((streamUser) => ({
        streamUser,
        position: this.updateRetrievePosition(),
      }));
      await this.persistUpdate(streamUsersPositioned);
      callback();
    }, 1, 50);
  }

  updateRetrievePosition() {
    this.runningPosition += 1;
    return this.runningPosition;
  }

  async persistUpdate(streamUsersPositioned: StreamUserPositioned[]): Promise<void> {
    const updateValues = streamUsersPositioned
      .map((streamUserPositioned) => (`('${streamUserPositioned.streamUser.user_id}'::uuid, ${streamUserPositioned.position})`))
      .join(',');
    await this.userRepository.query(`
      update "user" as u set
        position = u2.position
      from (values
        ${updateValues}
      ) as u2(id, position)
      where u2.id = u.id;
    `);
  }

  async run(): Promise<void> {
    this.runningPosition = 0;
    const accountStream = await this.userRepository
      .createQueryBuilder('user')
      .orderBy('user.points', 'DESC')
      .addOrderBy('user.createdAt')
      .stream();

    accountStream.on('data', this.updateQueue.push);
  }
}
