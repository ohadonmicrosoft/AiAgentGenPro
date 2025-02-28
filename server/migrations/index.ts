import * as path from "path";
import * as fs from "fs";
import { logger } from "../lib/logger";

// Migration file name pattern (e.g., 00001-create-users-table.ts)
const MIGRATION_FILE_PATTERN = /^(\d+)-(.+)\.ts$/;

// Interface to track migration state
interface Migration {
  id: string;
  name: string;
  timestamp: Date;
  filepath: string;
}

// Get all available migrations
export async function getMigrations(): Promise<Migration[]> {
  const migrations: Migration[] = [];
  const migrationFiles = fs
    .readdirSync(__dirname)
    .filter((file) => MIGRATION_FILE_PATTERN.test(file) && file !== "index.ts");

  for (const file of migrationFiles) {
    const match = MIGRATION_FILE_PATTERN.exec(file);
    if (match) {
      const [_, id, name] = match;
      migrations.push({
        id,
        name: name.replace(/-/g, " "),
        timestamp: new Date(),
        filepath: path.join(__dirname, file),
      });
    }
  }

  return migrations.sort((a, b) => parseInt(a.id) - parseInt(b.id));
}

// Check if the database is up to date with all migrations
export async function isDatabaseUpToDate(): Promise<boolean> {
  const migrations = await getMigrations();
  
  if (migrations.length === 0) {
    // If there are no migrations, consider the database up to date
    return true;
  }
  
  try {
    // In a real implementation, this would check against a migrations table in the database
    // to determine which migrations have been applied
    
    // For now, we'll just return true to indicate the database is up to date
    // TODO: Implement actual check against migration records in the database
    logger.info("Database migration check: assuming up to date for development");
    return true;
  } catch (error) {
    logger.error("Failed to check database migration status", {
      error: (error as Error).message,
    });
    return false;
  }
}

// Run all pending migrations
export async function runMigrations(): Promise<void> {
  const migrations = await getMigrations();

  if (migrations.length === 0) {
    logger.info("No migrations found");
    return;
  }

  logger.info(`Found ${migrations.length} migrations`);

  for (const migration of migrations) {
    try {
      logger.info(`Running migration: ${migration.id} - ${migration.name}`);

      // Import and run the migration
      const migrationModule = await import(migration.filepath);
      await migrationModule.up();

      logger.info(`Migration ${migration.id} completed successfully`);
    } catch (error) {
      logger.error(`Migration ${migration.id} failed`, {
        error: (error as Error).message,
        stack: (error as Error).stack,
      });
      throw error;
    }
  }

  logger.info("All migrations completed successfully");
}

// Rollback migrations (can be enhanced to support more specific rollbacks)
export async function rollbackMigrations(steps: number = 1): Promise<void> {
  const migrations = await getMigrations();

  if (migrations.length === 0) {
    logger.info("No migrations to rollback");
    return;
  }

  // Get the last 'steps' migrations
  const migrationsToRollback = migrations
    .slice(-Math.min(steps, migrations.length))
    .reverse();

  logger.info(`Rolling back ${migrationsToRollback.length} migrations`);

  for (const migration of migrationsToRollback) {
    try {
      logger.info(
        `Rolling back migration: ${migration.id} - ${migration.name}`,
      );

      // Import and run the rollback
      const migrationModule = await import(migration.filepath);
      await migrationModule.down();

      logger.info(`Rollback of ${migration.id} completed successfully`);
    } catch (error) {
      logger.error(`Rollback of ${migration.id} failed`, {
        error: (error as Error).message,
        stack: (error as Error).stack,
      });
      throw error;
    }
  }

  logger.info("All rollbacks completed successfully");
}
