import { betterAuth } from 'better-auth';
import { mongodbAdapter } from '@better-auth/mongo-adapter';
import { jwt } from 'better-auth/plugins';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/equipment_rental';

declare global {
  // eslint-disable-next-line no-var
  var _authMongoClient: MongoClient | undefined;
  var _authDb: unknown;
}

// Reuse a single MongoClient instance across serverless invocations
if (!global._authMongoClient) {
  global._authMongoClient = new MongoClient(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 20000,
    connectTimeoutMS: 20000,
    socketTimeoutMS: 20000,
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
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            if (!user?.email) return;
            const normalizedEmail = user.email.toLowerCase().trim();
            const now = new Date();
            const isSuperAdmin = normalizedEmail === 'admin@heavyrent.com';
            const picture = user.image || undefined;

            await db.collection('users').findOneAndUpdate(
              { email: normalizedEmail },
              {
                $set: {
                  updatedAt: now,
                  ...(user.name ? { name: user.name } : {}),
                  ...(picture ? { photo: picture, avatar: picture } : {}),
                  ...(user.id ? { id: user.id } : {}),
                  ...(isSuperAdmin ? { role: 'admin' } : {}),
                },
                $setOnInsert: {
                  email: normalizedEmail,
                  role: (user as { role?: string }).role || 'customer',
                  createdAt: now,
                },
              },
              { upsert: true }
            );
          } catch (err) {
            console.error('[BetterAuth Hook] Failed to sync user to users collection:', err);
          }
        },
      },
    },
  },
});

export default auth;
