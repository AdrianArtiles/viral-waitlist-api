/* eslint-disable class-methods-use-this */
import { MigrationInterface, QueryRunner } from 'typeorm';

export default class CreateBase1613083697000 implements MigrationInterface {
  name = 'CreateBase1613083697000'

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await queryRunner.query(`
      CREATE TABLE "user" (
        "id" UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
        "email" CHARACTER VARYING NOT NULL UNIQUE,
        "hasConfirmedEmail" BOOL NOT NULL DEFAULT false,
        "referrerId" UUID REFERENCES "user" (id),
        "points" INT NOT NULL DEFAULT 0,
        "position" INT NOT NULL DEFAULT 0,
        "meta" jsonb NOT NULL DEFAULT '{}',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP TABLE "user"', undefined);
  }
}
