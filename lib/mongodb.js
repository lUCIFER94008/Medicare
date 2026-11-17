import "./dns-setup";
import dns from "dns";
import mongoose from "mongoose";

try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {
  // Ignored in environments where setServers is restricted
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local"
    );
  }
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    // Ensure DNS servers are set before connect
    try {
      dns.setServers(["8.8.8.8", "8.8.4.4"]);
    } catch (e) {}

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log("[MongoDB] Connection established successfully");
        return mongoose;
      })
      .catch(async (err) => {
        if (err.message && err.message.includes("querySrv")) {
          console.warn("[MongoDB] SRV query failed with local DNS, retrying with Google DNS...");
          dns.setServers(["8.8.8.8", "8.8.4.4"]);
          return mongoose.connect(MONGODB_URI, opts);
        }
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
