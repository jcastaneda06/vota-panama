import { MongoClient, ServerApiVersion, Db } from "mongodb";
import config from "@/config/config";

interface ConnectType {
  db: Db;
  client: MongoClient;
}

const globalWithMongo = global as typeof globalThis & {
  mongo: { conn: ConnectType | null; promise: Promise<ConnectType> | null };
};

let cached = globalWithMongo.mongo;

if (!cached) {
  cached = globalWithMongo.mongo = { conn: null, promise: null };
}

export async function connectToDatabase(): Promise<ConnectType> {
  const { serverUrl, dbName } = config();
  if (!serverUrl) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local"
    );
  }
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    };

    cached.promise = MongoClient.connect(serverUrl, opts).then((client) => {
      const db: Db = client.db(dbName);
      return { client, db };
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
