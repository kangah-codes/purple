import { migrationsV1_0 } from './v1/v1.0';
import { migrationsV1_1 } from './v1/v1.1';

export type Migration = {
    version: number;
    sql: string;
};

const migrations: Migration[] = [...migrationsV1_0, ...migrationsV1_1];

export default migrations;
