import * as FileSystem from 'expo-file-system';
import { StorageAccessFramework } from 'expo-file-system';
import { Platform } from 'react-native';

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

export type ExportLoggerOptions = {
    enabled?: boolean;
    fileName?: string;
    maxBytes?: number;
    flushIntervalMs?: number;
};

type InstalledLogger = {
    enabled: boolean;
    fileUri: string;
    exportLogs: () => Promise<{ success: true; path: string } | { success: false; error: string }>;
    clearLogs: () => Promise<{ success: true } | { success: false; error: string }>;
    flush: () => Promise<void>;
    uninstall: () => void;
};

const DEFAULT_FILE_NAME = 'purple-app-logs.txt';
const DEFAULT_MAX_BYTES = 2_000_000;
const DEFAULT_FLUSH_INTERVAL_MS = 1500;

let installed: InstalledLogger | null = null;

let originalConsole: null | {
    log: typeof console.log;
    info: typeof console.info;
    warn: typeof console.warn;
    error: typeof console.error;
    debug: typeof console.debug;
} = null;

let buffer: string[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let flushing = false;
let lastRotationCheckAt = 0;

async function appendUtf8String(fileUri: string, text: string) {
    const info = await FileSystem.getInfoAsync(fileUri);
    if (!info.exists) {
        await FileSystem.writeAsStringAsync(fileUri, text, {
            encoding: FileSystem.EncodingType.UTF8,
        });
        return;
    }

    const existing = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.UTF8,
    });

    await FileSystem.writeAsStringAsync(fileUri, existing + text, {
        encoding: FileSystem.EncodingType.UTF8,
    });
}

function getDefaultLogFileUri(fileName: string) {
    const dir = FileSystem.documentDirectory;
    if (!dir) return fileName;
    return dir + fileName;
}

function nowIso() {
    return new Date().toISOString();
}

function formatTimestampForFilename(d = new Date()) {
    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    const ss = pad(d.getSeconds());
    return `${yyyy}-${mm}-${dd}_${hh}${mi}${ss}`;
}

function stringifyArg(value: unknown): string {
    if (typeof value === 'string') return value;
    if (value instanceof Error) {
        const stack = value.stack ? `\n${value.stack}` : '';
        return `${value.name}: ${value.message}${stack}`;
    }
    if (typeof value === 'undefined') return 'undefined';
    if (typeof value === 'bigint') return `${value.toString()}n`;
    if (typeof value === 'function') return `[Function ${value.name || 'anonymous'}]`;

    try {
        const seen = new WeakSet<object>();
        const json = JSON.stringify(
            value,
            (_key, v) => {
                if (typeof v === 'bigint') return `${v.toString()}n`;
                if (typeof v === 'function') return `[Function ${v.name || 'anonymous'}]`;
                if (v && typeof v === 'object') {
                    if (seen.has(v)) return '[Circular]';
                    seen.add(v);
                }
                return v;
            },
            2,
        );

        if (json === undefined) return String(value);
        return json;
    } catch {
        return String(value);
    }
}

function formatLogLine(level: LogLevel, args: unknown[]): string {
    const parts = args.map(stringifyArg);
    const joined = parts.join(' ');
    return `${nowIso()} [${level.toUpperCase()}] ${joined}\n`;
}

function scheduleFlush(fileUri: string, flushIntervalMs: number) {
    if (flushTimer) return;
    flushTimer = setTimeout(() => {
        flushTimer = null;
        void flushToDisk(fileUri);
    }, flushIntervalMs);
}

async function maybeRotate(fileUri: string, maxBytes: number) {
    // Avoid frequent size checks (expensive on some devices)
    const now = Date.now();
    if (now - lastRotationCheckAt < 10_000) return;
    lastRotationCheckAt = now;

    try {
        const info = await FileSystem.getInfoAsync(fileUri);
        if (!info.exists || typeof info.size !== 'number') return;
        if (info.size <= maxBytes) return;

        const previous = fileUri.replace(/\.txt$/i, '.previous.txt');
        try {
            const prevInfo = await FileSystem.getInfoAsync(previous);
            if (prevInfo.exists) await FileSystem.deleteAsync(previous);
        } catch {
            // ignore
        }

        await FileSystem.moveAsync({ from: fileUri, to: previous });
        await FileSystem.writeAsStringAsync(
            fileUri,
            `${nowIso()} [INFO] Log rotated (previous saved as ${previous})\n`,
        );
    } catch {
        // ignore rotation failures
    }
}

async function flushToDisk(fileUri: string) {
    if (flushing) return;
    if (buffer.length === 0) return;

    flushing = true;
    try {
        const chunk = buffer.join('');
        buffer = [];
        await appendUtf8String(fileUri, chunk);
    } catch {
        // If writing fails, keep going; don't crash app.
        // Drop buffer to avoid infinite growth.
        buffer = [];
    } finally {
        flushing = false;
    }
}

function patchConsole(options: Required<ExportLoggerOptions>, fileUri: string) {
    if (!originalConsole) {
        originalConsole = {
            log: console.log,
            info: console.info,
            warn: console.warn,
            error: console.error,
            debug: console.debug,
        };
    }

    const makePatched = (level: LogLevel) => {
        const original = originalConsole?.[level] ?? console[level];
        return (...args: unknown[]) => {
            try {
                buffer.push(formatLogLine(level, args));
                void maybeRotate(fileUri, options.maxBytes);
                scheduleFlush(fileUri, options.flushIntervalMs);
            } catch {
                // ignore
            }
            original(...(args as any));
        };
    };

    console.log = makePatched('log') as any;
    console.info = makePatched('info') as any;
    console.warn = makePatched('warn') as any;
    console.error = makePatched('error') as any;
    console.debug = makePatched('debug') as any;
}

function unpatchConsole() {
    if (!originalConsole) return;
    console.log = originalConsole.log;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    console.debug = originalConsole.debug;
}

/**
 * Installs a console-compatible logger that also writes logs to a text file.
 * Idempotent: calling multiple times returns the existing installed instance.
 */
export function installExportLogger(options: ExportLoggerOptions = {}): InstalledLogger {
    const requestedEnabled = options.enabled ?? true;
    if (installed) {
        if (requestedEnabled && !installed.enabled) {
            installed.enabled = true;
            patchConsole(
                {
                    enabled: true,
                    fileName: options.fileName ?? DEFAULT_FILE_NAME,
                    maxBytes: options.maxBytes ?? DEFAULT_MAX_BYTES,
                    flushIntervalMs: options.flushIntervalMs ?? DEFAULT_FLUSH_INTERVAL_MS,
                },
                installed.fileUri,
            );
            void appendUtf8String(installed.fileUri, `${nowIso()} [INFO] Log session enabled\n`);
        }
        return installed;
    }

    const resolved: Required<ExportLoggerOptions> = {
        enabled: requestedEnabled,
        fileName: options.fileName ?? DEFAULT_FILE_NAME,
        maxBytes: options.maxBytes ?? DEFAULT_MAX_BYTES,
        flushIntervalMs: options.flushIntervalMs ?? DEFAULT_FLUSH_INTERVAL_MS,
    };

    const fileUri = getDefaultLogFileUri(resolved.fileName);

    const flush = async () => {
        await flushToDisk(fileUri);
    };

    const clearLogs = async () => {
        try {
            if (flushTimer) {
                clearTimeout(flushTimer);
                flushTimer = null;
            }
            buffer = [];
            const info = await FileSystem.getInfoAsync(fileUri);
            if (info.exists) {
                await FileSystem.writeAsStringAsync(fileUri, '', {
                    encoding: FileSystem.EncodingType.UTF8,
                });
            }
            return { success: true as const };
        } catch (e) {
            return { success: false as const, error: e instanceof Error ? e.message : String(e) };
        }
    };

    const exportLogs = async () => {
        try {
            await flush();

            const info = await FileSystem.getInfoAsync(fileUri);
            if (!info.exists) {
                return { success: false as const, error: 'No log file found yet' };
            }

            const timestamp = formatTimestampForFilename();
            const exportName = `purple-logs-${timestamp}.txt`;

            if (Platform.OS === 'android') {
                const dir = await StorageAccessFramework.requestDirectoryPermissionsAsync();
                if (!dir.granted) {
                    return { success: false as const, error: 'Permission denied' };
                }

                const content = await FileSystem.readAsStringAsync(fileUri, {
                    encoding: FileSystem.EncodingType.UTF8,
                });

                const outUri = await StorageAccessFramework.createFileAsync(
                    dir.directoryUri,
                    exportName,
                    'text/plain',
                );

                await FileSystem.writeAsStringAsync(outUri, content, {
                    encoding: FileSystem.EncodingType.UTF8,
                });

                return { success: true as const, path: outUri };
            }

            const dest = FileSystem.documentDirectory + exportName;
            await FileSystem.copyAsync({ from: fileUri, to: dest });
            return { success: true as const, path: dest };
        } catch (e) {
            return { success: false as const, error: e instanceof Error ? e.message : String(e) };
        }
    };

    const uninstall = () => {
        try {
            if (flushTimer) {
                clearTimeout(flushTimer);
                flushTimer = null;
            }
        } finally {
            unpatchConsole();
            installed = null;
        }
    };

    installed = {
        enabled: resolved.enabled,
        fileUri,
        exportLogs,
        clearLogs,
        flush,
        uninstall,
    };

    if (resolved.enabled) {
        // Ensure file exists and write a small session header.
        void (async () => {
            try {
                const info = await FileSystem.getInfoAsync(fileUri);
                if (!info.exists) {
                    await FileSystem.writeAsStringAsync(
                        fileUri,
                        `${nowIso()} [INFO] Log started (${Platform.OS})\n`,
                        { encoding: FileSystem.EncodingType.UTF8 },
                    );
                } else {
                    await maybeRotate(fileUri, resolved.maxBytes);
                    await appendUtf8String(fileUri, `${nowIso()} [INFO] Log session resumed\n`);
                }
            } catch {
                // ignore
            }
        })();

        patchConsole(resolved, fileUri);
    }

    return installed;
}

export function getInstalledExportLogger() {
    return installed;
}
