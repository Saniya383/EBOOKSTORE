import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

// Make Redis optional
let redis;
try {
  if (process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL);
    console.log("Redis connected successfully");
  } else {
    console.log("Redis URL not provided, Redis functionality will be disabled");
  }
} catch (error) {
  console.log("Failed to connect to Redis:", error.message);
  console.log("Continuing without Redis functionality");
}

export { redis };
