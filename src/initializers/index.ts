import { container } from 'tsyringe';
import { getRepository, Repository } from 'typeorm';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import nodeSchedule from 'node-schedule';
import User from '../entities/User';
import ProcessReferralsService from '../services/ProcessReferralsService';

export default async () => {
  container.register<Repository<User>>('UserRepository', { useValue: getRepository(User) });
  container.register<RateLimiterMemory>('RateLimiterAlpha', { useValue: new RateLimiterMemory({ points: 1, duration: 1 }) });
  nodeSchedule.scheduleJob('*/5 * * * *', () => container.resolve(ProcessReferralsService).run());
};
