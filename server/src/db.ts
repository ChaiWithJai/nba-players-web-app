import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// don't log SQL Statements in test environment, unless DB_LOGGING environment
// variable is explicitly set
const logging = getLoggingOption();

// Use SQLite database file in the project directory
const dbPath = path.join(__dirname, '..', '..', 'database.sqlite');

export const db = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging
});

function getLoggingOption() {
  const { DB_LOGGING, NODE_ENV } = process.env;
  const log = console.log;
  if (DB_LOGGING && DB_LOGGING !== 'false') return log;
  if (NODE_ENV === 'test') return false;
  return log;
}
