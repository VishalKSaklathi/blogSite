import sequelize from "./db.js";  //  import DB connection
import "./module/associations.js"
import { router as Blogrouter } from "./module/index.js";
import { commentRouter } from "./module/index.js";
import categoryRoutes from "./module/categories/category.routes.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";

if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api/blogs", Blogrouter);
app.use("/api/comments", commentRouter);
app.use("/api/categories", categoryRoutes);

// Test route
app.get("/", (req, res) => {
    res.send("Backend is running!");
});

// Connect to DB and start server
(async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Database connected");

        // Sync only in dev environment
        if (process.env.NODE_ENV !== "production") {
            await sequelize.sync({ alter: true });
            console.log("🔧 Database synced (dev)");
        } else {
            console.log("🚀 Production mode — skipping DB sync");
        }

        app.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("❌ Unable to connect to DB:", error.message);
    }
})();
