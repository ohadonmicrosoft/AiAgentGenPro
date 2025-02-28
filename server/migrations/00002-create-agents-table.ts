/**
 * Migration: 00002-create-agents-table.ts
 *
 * Creates the agents table structure.
 * This is an example migration file for use with a SQL database.
 * In a Firestore project, this would represent the schema design.
 */

// Import database connection (for SQL databases)
// import { db } from '../lib/db';

// In Firestore projects, this would be a Schema Definition file rather than a migration

export async function up() {
  // Example SQL migration:
  // await db.schema.createTable('agents', (table) => {
  //   table.string('id').primary();
  //   table.string('name').notNullable();
  //   table.text('description');
  //   table.text('promptTemplate').notNullable();
  //   table.string('ownerId').notNullable().references('id').inTable('users');
  //   table.boolean('isPublic').defaultTo(false);
  //   table.string('category');
  //   table.json('tags').defaultTo('[]');
  //   table.json('inputVariables').defaultTo('[]');
  //   table.json('settings').defaultTo('{}');
  //   table.json('metadata').defaultTo('{}');
  //   table.timestamp('createdAt').defaultTo(db.fn.now());
  //   table.timestamp('updatedAt').defaultTo(db.fn.now());
  // });

  // For Firestore, we'd document the schema design:
  console.log("Migrating: Create agents collection structure");

  /*
    Collection: agents
    Document ID: Auto-generated
    
    Schema:
    {
      id: string,
      name: string,
      description: string,
      promptTemplate: string,
      ownerId: string (reference to users collection),
      isPublic: boolean,
      category: string,
      tags: string[],
      inputVariables: string[],
      settings: {
        model: string,
        temperature: number,
        maxTokens: number,
        topP: number,
        frequencyPenalty: number,
        presencePenalty: number,
      },
      metadata: object,
      createdAt: timestamp,
      updatedAt: timestamp,
    }
    
    Indexes:
    - ownerId (ASC)
    - isPublic (ASC), createdAt (DESC)
    - category (ASC), createdAt (DESC)
    - tags (array-contains)
  */

  return Promise.resolve();
}

export async function down() {
  // Example SQL rollback:
  // await db.schema.dropTable('agents');

  // For Firestore, we'd document the rollback procedure:
  console.log("Rolling back: Drop agents collection structure");

  // Note: In Firestore, we don't typically drop collections in rollbacks,
  // but we would document the process for removing data if needed.

  return Promise.resolve();
}
