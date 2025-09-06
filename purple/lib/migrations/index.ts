import { migrationsV1 } from './v1';

export type Migration = {
    version: number;
    sql: string;
};

const migrations: Migration[] = [...migrationsV1];

export default migrations;
