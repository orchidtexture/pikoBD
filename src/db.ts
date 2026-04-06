import Dexie, { type Table } from 'dexie';
import { Client } from './types';

export class MyDatabase extends Dexie {
  clients!: Table<Client>;

  constructor() {
    super('PikoBDDatabase');
    this.version(1).stores({
      clients: 'id, name, lastContactedAt, createdAt' // Primary key and indexed fields
    });
  }
}

export const db = new MyDatabase();
