'use server';

import 'server-only';
import { z } from 'zod';
import * as admin from 'firebase-admin';

// Schema for input validation with all fields required and no age limit
const authorizationSchema = z.object({
  nomeAluno: z.string().min(3, "O nome do aluno é obrigatório."),
  idade: z.coerce.number({ invalid_type_error: "A idade é obrigatória." }).positive("A idade deve ser um número positivo."),
  serie: z.string().min(1, "A série é obrigatória."),
  turno: z.string().min(1, "O turno é obrigatório."),
  escola: z.string().min(3, "O nome da escola é obrigatório."),
  nomeResponsavel: z.string().min(3, "O nome do responsável é obrigatório."),
  telefone: z.string().min(10, "O telefone é obrigatório."),
  consent: z.literal<boolean>(true, {
    errorMap: () => ({ message: "Você deve marcar o campo de consentimento." }),
  }),
});

type AuthorizationData = z.infer<typeof authorizationSchema>;

function initializeAdmin() {
  if (!admin.apps.length) {
    // When deployed to App Hosting, the SDK is automatically initialized.
    // In a local environment, you need to provide credentials.
    try {
      admin.initializeApp();
    } catch (e) {
      console.error(
        "initializeApp failed, probably because we are not in App Hosting. Let's try with creds."
      );
      // For local development, ensure GOOGLE_APPLICATION_CREDENTIALS is set
      // e.g., export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-file.json"
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
        });
      } else {
        console.warn(
          'GOOGLE_APPLICATION_CREDENTIALS not set. Firebase Admin SDK might not work locally.'
        );
      }
    }
  }
}

export async function createAuthorizationAction(
  data: AuthorizationData
): Promise<{ success: boolean; error?: string; errors?: any }> {
  // 1. Initialize Admin SDK
  initializeAdmin();
  const db = admin.firestore();

  // 2. Validate the input data against the schema
  const validationResult = authorizationSchema.safeParse(data);

  if (!validationResult.success) {
    const fieldErrors = validationResult.error.flatten().fieldErrors;
    console.error('Validation failed:', fieldErrors);
    return {
      success: false,
      error: 'Dados inválidos. Por favor, verifique as informações.',
      errors: fieldErrors,
    };
  }

  try {
    // 3. Prepare the data for Firestore
    const validatedData = validationResult.data;
    const docData = {
      ...validatedData,
      status: 'pendente',
      criadoPor: 'sistema',
      dataCadastro: admin.firestore.FieldValue.serverTimestamp(),
      atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
    };

    // 4. Add the document to the 'authorizations' collection
    await db.collection('authorizations').add(docData);

    return { success: true };
  } catch (error: any) {
    console.error('Firestore Error:', error);
    // Return a generic error message to the client
    return {
      success: false,
      error: 'Ocorreu um erro no servidor ao processar sua solicitação.',
    };
  }
}
