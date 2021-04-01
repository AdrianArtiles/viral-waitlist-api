/* eslint-disable no-console */
import express from 'express';
import * as Sentry from '@sentry/node';
import { inject, injectable } from 'tsyringe';
import { Repository } from 'typeorm';
import User from '../entities/User';
import { sendWelcomeEmail } from '../libraries/nodemailer';

@injectable()
export default class ConfirmEmailService {
  // eslint-disable-next-line no-useless-constructor
  constructor(
    @inject('UserRepository') private userRepository: Repository<User>,
    // private findPersonDataService: FindPersonDataService,
  ) {} // eslint-disable-line no-empty-function

  async creditReferrer(referrerId: string): Promise<void> {
    const user = await this.userRepository.findOneOrFail({ id: referrerId });
    user.points += 1;
    if (user.meta.referralCount) {
      user.meta.referralCount += 1;
    } else {
      user.meta.referralCount = 1;
    }
    if (user.meta.referralCount === 5) console.log('> send a bonus!!'); // TODO: implement bonus
    await this.userRepository.save(user);
  }

  async confirmUserEmail(emailAddress: string, hash: string): Promise<boolean> {
    try {
      const user = await this.userRepository.findOneOrFail({ email: emailAddress });
      if (user.hasConfirmedEmail) return true;
      if (user.hash !== hash) throw new Error('user hash does not match');
      user.hasConfirmedEmail = true;
      await this.userRepository.save(user);
      if (user.referrerId) this.creditReferrer(user.referrerId);
      sendWelcomeEmail(user).catch(Sentry.captureException);
      return true;
    } catch (error) {
      console.log('> error', error);
      Sentry.captureException(error, (scope) => scope.setContext('context', { emailAddress, hash }));
      return false;
    }
  }

  async run({ req, res }: { req: express.Request, res: express.Response }): Promise<any> {
    const {
      email,
      hash,
      successUrl,
      failUrl,
    } = req.query;

    const emailString = Array.isArray(email) ? email[0] : email;
    const hashString = Array.isArray(hash) ? hash[0] : hash;
    const successUrlString = Array.isArray(successUrl) ? successUrl[0] : successUrl;
    const failUrlString = Array.isArray(failUrl) ? failUrl[0] : failUrl;

    if (!emailString || !hashString) return res.send('Missing email or hash');

    const isConfirmed = await this.confirmUserEmail(emailString.toString(), hashString.toString());

    if (isConfirmed) {
      console.log('confirmed!');
      return res.redirect((successUrlString || 'https://thisa.com').toString());
    }
    console.log('not confirmed');
    return res.redirect((failUrlString || 'https://thisa.com').toString());
  }
}
