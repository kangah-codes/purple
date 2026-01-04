import { migrationsV1 } from './v1/v1';
import { migrationsV2 } from './v1/v2';
import { migrationsV3 } from './v1/v3';

export type Migration = {
    version: number;
    sql: string;
};

const migrations: Migration[] = [...migrationsV1, ...migrationsV2, ...migrationsV3];

export default migrations;
