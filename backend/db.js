import { Sequelize } from "sequelize";
import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}


// 🔥 Make sure this exists
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
    logging: false,
    pool: {
        max: 5,
        min: 1,
        acquire: 30000,
        idle: 10000
    }
});

// 🔥 Export THIS object
export default sequelize;
