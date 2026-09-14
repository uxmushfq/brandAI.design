import "server-only";

import { mkdirSync, readFileSync, writeFileSync, renameSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";

import { type Database, EMPTY_DATABASE } from "./schema";

/**
 * A JSON file standing in for Postgres.
 *
 * This exists so the whole app can be clicked through without Supabase credentials.
 * It is not the real store and is not meant to be: no concurrency beyond one
 * process, no migrations, no row-level security. Everything that reads or writes it
 * goes through the functions in this directory, so replacing it is a matter of
 * reimplementing those against Supabase.
 *
 * The ownership checks those functions perform are the app-level stand-in for RLS.
 * When Supabase lands, the policies become the real enforcement and those checks
 * stay as a second belt.
 */

const DATA_FILE = process.env.BRANDAI_DATA_FILE
  ? process.env.BRANDAI_DATA_FILE
  : join(process.cwd(), ".data", "db.json");

/**
 * Read from disk every time, deliberately.
 *
 * An in-memory cache here is wrong, not merely slow: Next splits pages, server
 * actions and route handlers into separate bundles, and each gets its own instance
 * of this module. A cache in one instance does not see writes made by another, so
 * a route handler happily served a brand's files using state from before a password
 * was set on it. Caching this needs invalidation that actually crosses bundles —
 * which is what a real database gives us, and is a reason to move to one rather
 * than to be clever here.
 */
function load(): Database {
  if (!existsSync(DATA_FILE)) return structuredClone(EMPTY_DATABASE);

  try {
    const parsed = JSON.parse(readFileSync(DATA_FILE, "utf8")) as Partial<Database>;
    // Tolerate a file written by an older shape rather than crashing the app.
    return { ...structuredClone(EMPTY_DATABASE), ...parsed };
  } catch {
    return structuredClone(EMPTY_DATABASE);
  }
}

function persist(db: Database): void {
  mkdirSync(dirname(DATA_FILE), { recursive: true });
  // Write and rename, so a crash mid-write cannot leave a truncated file behind.
  const temporary = `${DATA_FILE}.${process.pid}.tmp`;
  writeFileSync(temporary, JSON.stringify(db, null, 2), "utf8");
  renameSync(temporary, DATA_FILE);
}

/** Serializes writes, since a read-modify-write on one file is not atomic. */
let queue: Promise<unknown> = Promise.resolve();

export function read<T>(fn: (db: Database) => T): T {
  return fn(load());
}

export function write<T>(fn: (db: Database) => T): Promise<T> {
  const next = queue.then(() => {
    const db = load();
    const result = fn(db);
    persist(db);
    return result;
  });
  // Keep the chain alive even if one write throws.
  queue = next.catch(() => undefined);
  return next;
}

/** Test and development helper. Drops everything and reseeds on next read. */
export function resetForTests(): void {
  persist(structuredClone(EMPTY_DATABASE));
}

export function newId(): string {
  return crypto.randomUUID();
}

export function now(): string {
  return new Date().toISOString();
}
