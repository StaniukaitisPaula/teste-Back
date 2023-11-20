"use strict";

const { DataSource } = require('typeorm');
const path = require('path');

Object.defineProperty(exports, "esModule", { value: true });
exports.AppDataSource = void 0;
require("dotenv/config");
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const port = process.env.DB_PORT;
exports.AppDataSource = new DataSource({
    type: 'mysql',
    host: "db-proliseum.mysql.database.azure.com",
    port: 3306,
    username: "proliseum",
    password: "Banco2023",
    database: "db-proliseum",
    entities: [path.join(__dirname, 'entities', '*.{ts,js}')],
    migrations: [path.join(__dirname, 'migrations', '*.{ts,js}')],
    connectTimeout: 30000, // 30 segundos
  });
  