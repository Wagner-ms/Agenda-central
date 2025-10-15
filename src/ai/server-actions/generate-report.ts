'use server';

import 'server-only';

import { 
  generateAttendanceReportPrompt, 
  GenerateAttendanceReportInputSchema,
  GenerateAttendanceReportOutputSchema,
  type GenerateAttendanceReportInput,
  type GenerateAttendanceReportOutput 
} from '@/ai/flows/generate-attendance-report';
import * as admin from 'firebase-admin';
import { firebaseConfig } from '@/firebase/config';
import { ai } from '@/ai/genkit';
import { z } from 'zod';

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


// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
}
const db = admin.firestore();

type ReportActionInput = {
    reportType: 'school' | 'agent';
    schoolName?: string;
    agentId?: string;
};

export async function generateReportAction(
  input: ReportActionInput
): Promise<GenerateAttendanceReportOutput> {
  let query: admin.firestore.Query = db.collection('authorizations');

  // Apply filters based on report type
  if (input.reportType === 'school' && input.schoolName) {
    query = query.where('escola', '==', input.schoolName);
  } else if (input.reportType === 'agent' && input.agentId) {
    query = query.where('atendenteId', '==', input.agentId);
  }
  
  // We are only interested in statuses that are part of the scheduling flow
  query = query.where('status', 'in', ['agendado', 'compareceu', 'nao_compareceu', 'remarcado']);

  try {
    const snapshot = await query.get();
    const authorizations = snapshot.docs.map(doc => {
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
    console.error("Error generating report:", error);
    // You might want to throw a more specific error or return a structured error object
    throw new Error(`Failed to generate report from Firestore: ${error.message}`);
  }
}
