import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (!uri) {
  // In development without env configured yet, provide lazy placeholder promise
  clientPromise = Promise.reject(new Error('MONGODB_URI is not defined in environment variables.'));
} else {
  // Preserve cached connection promise across warm serverless invocations to prevent 504 timeouts
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    global._mongoClientPromise = client.connect().catch((err) => {
      global._mongoClientPromise = undefined;
      throw err;
    });
  }
  clientPromise = global._mongoClientPromise;
}

export default clientPromise;

