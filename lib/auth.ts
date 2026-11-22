import { betterAuth } from 'better-auth';
import { mongodbAdapter } from '@better-auth/mongo-adapter';
import { jwt } from 'better-auth/plugins';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/equipment_rental';

declare global {
  // eslint-disable-next-line no-var
  var _authMongoClient: MongoClient | undefined;
  var _authDb: any;
}

// Reuse a single MongoClient instance across serverless invocations
if (!global._authMongoClient) {
  global._authMongoClient = new MongoClient(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 10000,
  });
}

const client = global._authMongoClient;
const db = client.db('equipment_rental');

// Determine base URL — supports both alpha and kohl deployments
const getBaseURL = () => {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
};

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || 'heavyrent-secret-key-32-characters-minimum-length',
  baseURL: getBaseURL(),
  // Trust both production URLs so kohl and alpha both work
  trustedOrigins: [
    'http://localhost:3000',
    'https://rental-client-alpha.vercel.app',
    'https://rental-client-kohl.vercel.app',
    'https://rental-client-scarlet13.vercel.app',
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
  ],
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
