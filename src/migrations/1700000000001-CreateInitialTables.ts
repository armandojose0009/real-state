import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialTables1700000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      CREATE EXTENSION IF NOT EXISTS "postgis";
      
      CREATE TABLE "tenant" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "email" character varying NOT NULL UNIQUE,
        "password" character varying NOT NULL,
        "role" character varying NOT NULL DEFAULT 'user',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_tenant_id" PRIMARY KEY ("id")
      );
      
      CREATE TABLE "property" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "address" character varying NOT NULL,
        "city" character varying NOT NULL,
        "state" character varying NOT NULL,
        "zip_code" character varying NOT NULL,
        "sector" character varying NOT NULL,
        "property_type" character varying NOT NULL,
        "location" geometry(Point,4326) NOT NULL,
        "valuation" numeric(12,2) NOT NULL,
        "bedrooms" integer NOT NULL,
        "bathrooms" integer NOT NULL,
        "square_feet" integer NOT NULL,
        "year_built" integer NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "tenant_id" uuid NOT NULL,
        CONSTRAINT "PK_property_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_property_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE
      );
      
      CREATE INDEX "IDX_property_location" ON "property" USING GIST ("location");
      CREATE INDEX "IDX_property_tenant_id" ON "property" ("tenant_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_property_tenant_id"`);
    await queryRunner.query(`DROP INDEX "IDX_property_location"`);
    await queryRunner.query(`DROP TABLE "property"`);
    await queryRunner.query(`DROP TABLE "tenant"`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS "postgis"`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
  }
}
