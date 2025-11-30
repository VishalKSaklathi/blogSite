// backend/config/db.js
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
    process.env.PGDATABASE,   // database name
    process.env.PGUSER,       // username
    process.env.PGPASSWORD,   // password
    {
        host: process.env.PGHOST,
        dialect: "postgres",    // tells Sequelize to use pgsql
        port: process.env.PGPORT,
        logging: false,         // disable SQL logs (optional)
    }
);

export default sequelize;
