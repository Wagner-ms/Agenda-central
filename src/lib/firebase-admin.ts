
import * as admin from 'firebase-admin';

// Garante que a inicialização ocorra apenas uma vez.
if (!admin.apps.length) {
  try {
    // Tenta inicializar com credenciais padrão (ideal para App Hosting)
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  } catch (e) {
    console.error('Falha na inicialização padrão do Firebase Admin. Verifique as credenciais.', e);
    // Fallback para desenvolvimento local se GOOGLE_APPLICATION_CREDENTIALS estiver definido
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
       admin.initializeApp({
          credential: admin.credential.applicationDefault(),
        });
    } else {
        console.warn('Credenciais GOOGLE_APPLICATION_CREDENTIALS não definidas. O Admin SDK pode não funcionar localmente.');
    }
  }
}

export const db = admin.firestore();
export const auth = admin.auth();
export default admin;
