import { migrationsV1 } from './v1/v1';
import { migrationsV2 } from './v1/v2';
import { migrationsV3 } from './v1/v3';
import { migrationsV4 } from './v1/v4';
import { migrationsV5 } from './v1/v5';

export type Migration = {
    version: number;
    sql: string;
};

const migrations: Migration[] = [
    ...migrationsV1,
    ...migrationsV2,
    ...migrationsV3,
    ...migrationsV4,
    ...migrationsV5,
];

export default migrations;
