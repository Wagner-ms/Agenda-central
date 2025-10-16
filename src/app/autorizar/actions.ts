
'use server';

import 'server-only';
import { z } from 'zod';
import { db } from '@/lib/firebase-admin'; // Importa a instância do DB inicializada
import { FieldValue } from 'firebase-admin/firestore';

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

export async function createAuthorizationAction(
  data: AuthorizationData
): Promise<{ success: boolean; error?: string; errors?: any }> {

  // 1. Validate the input data against the schema
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
    // 2. Prepare the data for Firestore
    const validatedData = validationResult.data;
    const docData = {
      ...validatedData,
      status: 'pendente',
      criadoPor: 'sistema',
      dataCadastro: FieldValue.serverTimestamp(),
      atualizadoEm: FieldValue.serverTimestamp(),
    };

    // 3. Add the document to the 'authorizations' collection using the imported db instance
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
