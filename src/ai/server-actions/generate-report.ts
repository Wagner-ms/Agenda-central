'use server';

import 'server-only';

import {
  generateAttendanceReportPrompt,
  GenerateAttendanceReportInputSchema,
  GenerateAttendanceReportOutputSchema,
  type GenerateAttendanceReportInput,
  type GenerateAttendanceReportOutput,
} from '@/ai/flows/generate-attendance-report';
import { initializeFirebase } from '@/firebase';
import { ai } from '@/ai/genkit';
import {
  collection,
  query,
  where,
  getDocs,
  Firestore,
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

// Define the flow within the server action file
const generateAttendanceReportFlow = ai.defineFlow(
  {
    name: 'generateAttendanceReportFlow',
    inputSchema: GenerateAttendanceReportInputSchema,
    outputSchema: GenerateAttendanceReportOutputSchema,
  },
  async (input) => {
    const { output } = await generateAttendanceReportPrompt(input);
    return output!;
  }
);

type ReportActionInput = {
  reportType: 'school' | 'agent';
  schoolName?: string;
  agentId?: string;
};

// This function now uses the client SDK and authenticates anonymously
async function getAuthorizations(
  db: Firestore,
  input: ReportActionInput
): Promise<any[]> {
  let q = query(collection(db, 'authorizations'));

  // Apply filters based on report type
  if (input.reportType === 'school' && input.schoolName) {
    q = query(q, where('escola', '==', input.schoolName));
  } else if (input.reportType === 'agent' && input.agentId) {
    q = query(q, where('atendenteId', '==', input.agentId));
  }

  // We are only interested in statuses that are part of the scheduling flow
  q = query(
    q,
    where('status', 'in', [
      'agendado',
      'compareceu',
      'nao_compareceu',
      'remarcado',
    ])
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    // Firestore Timestamps need to be converted to serializable format (ISO strings)
    const sanitizedData = Object.fromEntries(
      Object.entries(data).map(([key, value]) => {
        if (value && typeof value.toDate === 'function') {
          return [key, value.toDate().toISOString()];
        }
        return [key, value];
      })
    );
    return { id: doc.id, ...sanitizedData };
  });
}

export async function generateReportAction(
  input: ReportActionInput
): Promise<GenerateAttendanceReportOutput> {
  const { firestore, auth } = initializeFirebase();

  try {
    // Authenticate as an anonymous user to access Firestore from the server
    await signInAnonymously(auth);

    const authorizations = await getAuthorizations(firestore, input);

    // Convert data to a JSON string to be passed to the flow
    const authorizationsJson = JSON.stringify(authorizations, null, 2);

    const flowInput: GenerateAttendanceReportInput = {
      reportType: input.reportType,
      schoolName: input.schoolName,
      agentId: input.agentId,
      authorizations: authorizationsJson,
    };

    // Call the flow defined within this server action
    return generateAttendanceReportFlow(flowInput);
  } catch (error: any) {
    console.error('Error generating report:', error);
    // You might want to throw a more specific error or return a structured error object
    throw new Error(
      `Failed to generate report from Firestore: ${error.message}`
    );
  }
}
