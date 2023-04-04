import { MongoClient } from 'mongodb';

import * as dotenv from 'dotenv';
import findConfig from 'find-config';
dotenv.config({ path: findConfig('.env') });

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let db;

async function connect() {
  try {
    await client.connect();
    console.log('Connected to database');
    db = client.db('users');
    //console.log("db", db)
  } catch (err) {
    console.log('Error connecting to database:', err);
  }
}

async function close() {
  try {
    await client.close();
    console.log('Disconnected from database');
  } catch (err) {
    console.log('Error disconnecting from database:', err);
  }
}

export { db, connect, close };

