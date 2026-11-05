import * as admin from 'firebase-admin';

let app: admin.App | undefined;

export function getAdminApp(): admin.App {
  if (!app) {
    const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
    const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY son requeridos');
    }
    const credential = {
      projectId,
      clientEmail,
      privateKey,
      getAccessToken: async () => Promise.resolve({ access_token: '', expires_in: 3600 }),
    } as any;
    app = admin.initializeApp({
      credential,
      projectId,
    });
  }
  return app;
}

import { getAuth } from 'firebase-admin/lib/auth/index';
export const adminAuth = getAuth(getAdminApp());
