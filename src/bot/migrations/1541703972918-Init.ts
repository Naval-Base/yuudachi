import {MigrationInterface, QueryRunner} from "typeorm";

export class Init1541703972918 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "cases" ALTER COLUMN "createdAt" SET DEFAULT NOW()`);
        await queryRunner.query(`ALTER TABLE "role_states" ALTER COLUMN "roles" SET DEFAULT ARRAY[]::text[]`);
        await queryRunner.query(`ALTER TABLE "settings" ALTER COLUMN "settings" SET DEFAULT '{}'::jsonb`);
        await queryRunner.query(`ALTER TABLE "tags" ALTER COLUMN "aliases" SET DEFAULT ARRAY[]::text[]`);
        await queryRunner.query(`ALTER TABLE "tags" ALTER COLUMN "createdAt" SET DEFAULT NOW()`);
        await queryRunner.query(`ALTER TABLE "tags" ALTER COLUMN "updatedAt" SET DEFAULT NOW()`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "tags" ALTER COLUMN "updatedAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "tags" ALTER COLUMN "createdAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "tags" ALTER COLUMN "aliases" SET DEFAULT ARRAY[]`);
        await queryRunner.query(`ALTER TABLE "settings" ALTER COLUMN "settings" SET DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "role_states" ALTER COLUMN "roles" SET DEFAULT ARRAY[]`);
        await queryRunner.query(`ALTER TABLE "cases" ALTER COLUMN "createdAt" SET DEFAULT now()`);
    }

}
