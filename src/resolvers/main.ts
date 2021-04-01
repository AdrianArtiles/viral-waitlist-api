/* eslint-disable max-classes-per-file */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
import * as Sentry from '@sentry/node';
import { injectable, inject, container } from 'tsyringe';
import { Repository } from 'typeorm';
import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
} from 'type-graphql';
import * as emailValidator from 'email-validator';
import { isDisposable } from 'freemail';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import User from '../entities/User';
import { sendConfirmationEmail } from '../libraries/nodemailer';
import ProcessReferralsService from '../services/ProcessReferralsService';
import ApolloContext from '../types/apolloContext';

@injectable()
@Resolver()
export default class TestResolver {
  // eslint-disable-next-line no-useless-constructor
  constructor(
    @inject('UserRepository') private userRepository: Repository<User>,
    @inject('RateLimiterAlpha') private rateLimiterAlpha: RateLimiterMemory,
  ) {} // eslint-disable-line no-empty-function

  @Query(() => String, { nullable: true })
  async test() {
    container.resolve(ProcessReferralsService).run();
    // const user = await this.userRepository.findOneOrFail({ email: 'hi5@cool.net' });
    // return user.hash;
  }

  @Query(() => String)
  async task(@Arg('code') code: string, @Arg('payload') payload: string) {
    if (code === 'hashCHECK') {
      const user = await this.userRepository.findOneOrFail({ email: payload });
      return user.hash;
    }
    return 'cool';
  }

  @Query(() => User)
  async user(
    @Arg('email', { nullable: true }) email?: string,
    @Arg('id', { nullable: true }) id?: string,
  ) {
    if (!email && !id) throw new Error('id or email required');
    if (email) return this.userRepository.findOneOrFail({ email });
    return this.userRepository.findOneOrFail({ id });
  }

  @Mutation(() => User)
  async signup(
    @Arg('email') emailAddressRaw: string,
    @Arg('referrerId', { nullable: true }) referrerId: string,
    @Ctx() context: ApolloContext,
  ): Promise<User> {
    console.log('> context', context);
    await this.rateLimiterAlpha.consume(context.ip, 1).catch(() => { throw new Error('too many requests'); });
    const emailAddress = emailAddressRaw.toLowerCase();
    if (!emailValidator.validate(emailAddress)) throw new Error('invalid emailAddress');
    if (isDisposable(emailAddress)) throw new Error('disposable email providers not allowed');

    const existingUser = await this.userRepository.findOne({ email: emailAddress });
    if (existingUser) return existingUser;

    const userCount = await this.userRepository.count();

    const user = this.userRepository.create({
      email: emailAddress,
      hasConfirmedEmail: false,
      referrerId,
      points: 0,
      position: userCount + 1,
    });
    await this.userRepository.save(user);

    console.log('> user signup', { email: emailAddress, hash: user.hash });

    sendConfirmationEmail(user).catch(Sentry.captureException);

    return user;
  }
}
