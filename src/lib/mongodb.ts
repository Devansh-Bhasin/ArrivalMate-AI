import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "arrivalmate";

let cachedClient: MongoClient | null = null;

export async function getMongoClient() {
  if (!uri) {
    throw new Error("Missing MONGODB_URI. Add it to your environment to enable data persistence.");
  }

  if (cachedClient) {
    return cachedClient;
  }

  cachedClient = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  await cachedClient.connect();
  return cachedClient;
}

export async function getDatabase() {
  const client = await getMongoClient();
  return client.db(dbName);
}

export function getDatabaseName() {
  return dbName;
}

export async function closeMongoClient() {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
  }
}
