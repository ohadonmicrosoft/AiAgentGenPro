/**
 * Migration: 00001-create-users-table.ts
 *
 * Creates the initial users table structure.
 * This is an example migration file for use with a SQL database.
 * In a Firestore project, this would represent the schema design.
 */

// Import database connection (for SQL databases)
// import { db } from '../lib/db';

// In Firestore projects, this would be a Schema Definition file rather than a migration

export async function up() {
  // Example SQL migration:
  // await db.schema.createTable('users', (table) => {
  //   table.string('id').primary(); // Firebase Auth UID
  //   table.string('email').unique().notNullable();
  //   table.string('displayName');
  //   table.string('photoURL');
  //   table.boolean('emailVerified').defaultTo(false);
  //   table.json('preferences').defaultTo('{}');
  //   table.timestamp('createdAt').defaultTo(db.fn.now());
  //   table.timestamp('updatedAt').defaultTo(db.fn.now());
  // });

  // For Firestore, we'd document the schema design:
  console.log("Migrating: Create users collection structure");

  /*
    Collection: users
    Document ID: Firebase Auth UID
    
    Schema:
    {
      id: string (Firebase Auth UID),
      email: string,
      displayName: string (optional),
      photoURL: string (optional),
      emailVerified: boolean,
      preferences: {
        theme: 'light' | 'dark' | 'system',
        notifications: boolean,
        timezone: string,
      },
      createdAt: timestamp,
      updatedAt: timestamp,
    }
    
    Indexes:
    - email (ASC)
    - createdAt (DESC)
  */

  return Promise.resolve();
}

export async function down() {
  // Example SQL rollback:
  // await db.schema.dropTable('users');

  // For Firestore, we'd document the rollback procedure:
  console.log("Rolling back: Drop users collection structure");

  // Note: In Firestore, we don't typically drop collections in rollbacks,
  // but we would document the process for removing data if needed.

  return Promise.resolve();
}
