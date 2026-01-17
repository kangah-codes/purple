import { type SQLiteDatabase } from 'expo-sqlite';
import { StartupServiceFactory } from '../factory/StartupFactory';
import { loadFonts } from './fonts';
import { initializePreferences } from './preferences';
import { processRecurringTransactions } from './transaction';
import { loadAndApplyUpdates } from './updates';

export async function initializeApp(db: SQLiteDatabase) {
    const startTime = Date.now();
    console.log('[InitializeApp] Starting app initialization');
    try {
        const startupService = await StartupServiceFactory.init(db);

        // PHASE 1: Critical - Must run migrations first
        const phase1Start = Date.now();
        console.log('[InitializeApp] Phase 1: Running migrations');
        await startupService.runMigrations(db);
        console.log(`[InitializeApp] Phase 1 complete (${Date.now() - phase1Start}ms)`);

        // PHASE 2: Critical parallel - Can all run in parallel, none depend on each other
        const phase2Start = Date.now();
        console.log('[InitializeApp] Phase 2: Loading critical dependencies (parallel)');
        const criticalTasks = [
            loadFonts(),
            initializePreferences(db),
        ];
        await Promise.all(criticalTasks);
        console.log(`[InitializeApp] Phase 2 complete (${Date.now() - phase2Start}ms)`);

        // PHASE 3: Background tasks - Defer non-critical tasks
        console.log('[InitializeApp] Phase 3: Scheduling background tasks');
        // Run these in background without blocking app startup
        setImmediate(() => {
            const phase3Start = Date.now();

            const recurringStart = Date.now();
            const recurringPromise = processRecurringTransactions(db)
                .then(() => {
                    console.log(`[Background] Recurring transactions complete (${Date.now() - recurringStart}ms)`);
                })
                .catch(err => console.error('[Background] Recurring transactions failed:', err));

            const updatesStart = Date.now();
            const updatesPromise = loadAndApplyUpdates()
                .then(() => {
                    console.log(`[Background] Updates check complete (${Date.now() - updatesStart}ms)`);
                })
                .catch(err => console.error('[Background] Updates failed:', err));

            Promise.all([recurringPromise, updatesPromise])
                .then(() => {
                    console.log(`[InitializeApp] Phase 3 complete (${Date.now() - phase3Start}ms)`);
                })
                .catch(err => console.error('[Background] Background tasks failed:', err));
        });

        const totalTime = Date.now() - startTime;
        console.log(`[InitializeApp] App ready for user interaction (${totalTime}ms)`);
    } catch (error) {
        console.error('[InitializeApp] Failed to initialize app:', error);
        throw error;
    }
}
