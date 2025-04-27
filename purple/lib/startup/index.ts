import { StartupServiceFactory } from '../factory/StartupFactory';
import { loadFonts } from './fonts';

export function registerAllStartupTasks() {
    // loading fonts
    StartupServiceFactory.registerTask(loadFonts);
}
