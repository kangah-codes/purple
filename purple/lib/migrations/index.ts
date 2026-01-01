import { migrationsV1_0 } from './v1/v1.0';
import { migrationsV1_1 } from './v1/v1.1';
// same thing, but increasing because of version
import { migrationsV1_2 } from './v1/v1.2';

export type Migration = {
    version: number;
    sql: string;
};

const migrations: Migration[] = [...migrationsV1_0, ...migrationsV1_1, ...migrationsV1_2];

export default migrations;
