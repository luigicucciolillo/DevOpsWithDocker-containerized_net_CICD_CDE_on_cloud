const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { createClient } = require("redis");
/************************************************************************************/
const app = express();
app.use(cors());
app.use(bodyParser.json());
/************************************************************************************/
const pool = new Pool({
    user: "postgres",
    host: "db",
    database: "messages",
    password: "password",
    port: 5432,
});
/*** REDIS **************************************************************************/
const redisClient = createClient({ url: "redis://redis:6379", });
redisClient.on("error", (err) => console.error("Redis Error:", err));
redisClient.connect();
/************************************************************************************/
app.post("/messages", async (req, res) => {
    const { text } = req.body;
    await pool.query("INSERT INTO messages (text) VALUES ($1)", [text]);
    await redisClient.del("messages_cache");
    const pad = (num) => num.toString().padStart(2, '0');
    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${pad(currentDate.getMonth() + 1)}-${pad(currentDate.getDate())} ${pad(currentDate.getHours())}:${pad(currentDate.getMinutes())}:${pad(currentDate.getSeconds())}`;
    res.send({ status: "Message stored: " + text+ " on date: " + formattedDate});
});
/************************************************************************************/
app.get("/messages", async (req, res) => {
    const cachedMessages = await redisClient.get("messages_cache");
    console.log("Cached messages:", cachedMessages);
    if (cachedMessages) {
        return res.json(JSON.parse(cachedMessages));
    }
    console.log("Cache MISS: Fetching messages from PostgreSQL...");
    const result = await pool.query("SELECT * FROM messages");
    await redisClient.set("messages_cache", JSON.stringify(result.rows), { EX: 60 });
    console.log("Cache SET: Messages saved in Redis.");
    console.log("✅ Redis Cache SET: ", JSON.stringify(result.rows));
    res.json(result.rows);
});
/************************************************************************************/
app.get("/messages-cache", async (req, res) => {
    try {
        const cachedMessages = await redisClient.get("messages_cache");
        if (cachedMessages) {
            const messages = JSON.parse(cachedMessages);
            console.log("🚀 Retrieved Cached Messages:", messages);
            return res.json(messages);
        }
        console.log("⚡ Cache MISS: No cached messages found.");
        res.status(404).json({ status: "Cache empty" });
    } catch (error) {
        console.error("Error fetching cache:", error);
        res.status(500).json({ status: "Error fetching cache", error });
    }
});
/** TESTED AND WORKING ******************************************************************************/
app.get("/messages/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const cachedMessages = await redisClient.get("messages_cache");
        if (cachedMessages) {
            const messages = JSON.parse(cachedMessages);
            const message = messages.find(msg => msg.id === parseInt(id));
            if (message) {
                console.log(`🔍 Found message with ID "${id}"`);
                return res.json({ status: "Found", message });
            } else {
                console.log(`⚡ Message with ID "${id}" not found in cache`);
                return res.status(404).json({ status: "Message not found", id });
            }
        }
        console.log(`❌ Cache MISS: No cached messages found`);
        res.status(404).json({ status: "Cache empty" });
    } catch (error) {
        console.error("Error fetching message from Redis:", error);
        res.status(500).json({ status: "Error", error });
    }
});
/* TESTED AND WORKING************************************************************************************/
app.delete("/messages", async (req, res) => {
    try {
        await pool.query("DELETE FROM messages");
        await redisClient.del("messages_cache");
        res.send({ status: "All messages have been deleted" });
    } catch (error) {
        console.error("Error deleting messages:", error);
        res.status(500).send({ status: "Error deleting messages" });
    }
});
/** HEALTH CHECKS ***************************************************************************************/
app.get("/health", async (req, res) => {
    const status = {
      backend: ": Up",
      postgres: ": Down",
      redis: ": Down",
      frontend: ": Unknown",
      nginx: ": Unknown",
    };
   // PostgreSQL check with timeout ********************************************************************
  const timeoutPromise2 = (ms) =>
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), ms)
      );
  try {
    await Promise.race([
      pool.query("SELECT 1"),
      timeoutPromise2(1000),
    ]);
    status.postgres = ": Up";
  } catch (err) {
    console.log("PostgreSQL check failed:", err.message);
  }
   // Redis check with timeout **************************************************************************
  const timeoutPromise = (ms) =>
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), ms)
      );
  try {
    const redisPing = await Promise.race([
      redisClient.ping(),
      timeoutPromise(1000),
    ]);
    if (redisPing === "PONG") status.redis = ": Up";
  } catch (err) {
    console.error("Redis check failed:", err.message);
  }
    // Frontend check ***********************************************************************************
      function fetchWithTimeout(url, timeout = 2000) {
        return Promise.race([
          fetch(url),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), timeout)
          ),
        ]);
      }
      try {
        const res = await fetchWithTimeout("http://frontend:3000", 1000);
        status.frontend = res.ok ? ": Up" : ": Unhealthy";
      } catch (err) {
        status.frontend = ": Down";
        console.warn("Frontend not reachable:", err.message);
      }
    // Nginx check *************************************************************************************
    try {
      const nginxRes = await fetch("http://nginx")
      if (nginxRes.ok) {
        status.nginx = ": Up";
      } else {
        status.nginx = `: Responded with ${nginxRes.status}, backend/frontend it proxies is missing`;
      }
    } catch (err) {
      status.nginx = ": Down";
      console.warn("Nginx not reachable:", err.message);
    }
    // **************************************************************************************************
    res.json(status);
  });
  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection:", reason);
    console.log("Unhandled Rejection:", reason);
  });
  process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    console.log("Uncaught Exception:", err);
  });
app.listen(5000, () => {
    console.log("Server running on port 5000");
});