import { betterAuth } from 'better-auth';
import { mongodbAdapter } from '@better-auth/mongo-adapter';
import { jwt } from 'better-auth/plugins';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/equipment_rental';

declare global {
  // eslint-disable-next-line no-var
  var _authMongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (!global._authMongoClientPromise) {
  const client = new MongoClient(uri);
  global._authMongoClientPromise = client.connect().catch((err) => {
    global._authMongoClientPromise = undefined;
    throw err;
  });
}
clientPromise = global._authMongoClientPromise;

const client = new MongoClient(uri);
const db = client.db('equipment_rental');

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || 'heavyrent-secret-key-32-characters-minimum-length',
  baseURL:
    process.env.BETTER_AUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'),
  database: mongodbAdapter(db, {
    client,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || 'dummy-google-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy-google-client-secret',
    },
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'customer',
        required: false,
      },
    },
  },
  plugins: [
    jwt(),
  ],
});

export default auth;
