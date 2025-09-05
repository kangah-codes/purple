import { execSync } from 'child_process';

const run = (cmd) => {
    try {
        // eslint-disable-next-line no-undef
        console.log(`\n=== Running: ${cmd} ===\n`);
        execSync(cmd, { stdio: 'inherit' });
    } catch (e) {
        // eslint-disable-next-line no-undef
        console.error(`Error running ${cmd}: `, e);
    }
};

run('npx knip'); // unused packages + unused exports
// run('npx ts-prune'); // unused exports only
// run('npx eslint . --ext .js,.ts,.tsx'); // unused vars/imports
