'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating attendance reports.
 * It connects to Firestore to fetch real data and then uses an AI model to generate
 * a comprehensive report based on that data.
 *
 * - generateAttendanceReport - A function to generate attendance reports based on specified criteria.
 * - GenerateAttendanceReportInput - The input type for the generateAttendanceReport function.
 * - GenerateAttendanceReportOutput - The return type for the generateAttendanceReport function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as admin from 'firebase-admin';
import { firebaseConfig } from '@/firebase/config';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
}
const db = admin.firestore();


const GenerateAttendanceReportInputSchema = z.object({
  reportType: z.enum(['school', 'agent']).describe('The type of report to generate: school or agent.'),
  schoolName: z.string().optional().describe('The name of the school to filter by (required if reportType is school).'),
  agentId: z.string().optional().describe('The ID of the telemarketing agent to filter by (required if reportType is agent).'),
  authorizations: z.string().describe('A JSON string of authorization data to be analyzed.'),
});

export type GenerateAttendanceReportInput = z.infer<typeof GenerateAttendanceReportInputSchema>;

const GenerateAttendanceReportOutputSchema = z.object({
  report: z.string().describe('The generated attendance report in plain text or markdown.'),
});

export type GenerateAttendanceReportOutput = z.infer<typeof GenerateAttendanceReportOutputSchema>;

export async function generateAttendanceReport(
  input: Omit<GenerateAttendanceReportInput, 'authorizations'>
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

  const snapshot = await query.get();
  const authorizations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Convert data to a JSON string to be passed to the flow
  const authorizationsJson = JSON.stringify(authorizations, null, 2);

  const flowInput: GenerateAttendanceReportInput = {
    ...input,
    authorizations: authorizationsJson,
  };
  
  return generateAttendanceReportFlow(flowInput);
}

const generateAttendanceReportPrompt = ai.definePrompt({
  name: 'generateAttendanceReportPrompt',
  input: { schema: GenerateAttendanceReportInputSchema },
  output: { schema: GenerateAttendanceReportOutputSchema },
  prompt: `
    You are an expert data analyst specializing in school attendance and telemarketing performance.
    Your task is to generate a clear and concise report based on the provided data.

    Analyze the following dataset of authorizations, which is provided as a JSON string:
    {{{authorizations}}}

    Your report should be generated for the following context:
    - Report Type: {{{reportType}}}
    - Filter: {{#if schoolName}}"{{{schoolName}}}"{{/if}}{{#if agentId}}"{{{agentId}}}"{{/if}}

    Based on the data, calculate and present the following key metrics:
    1.  **Total de Agendamentos:** O número total de registros no dataset.
    2.  **Taxa de Comparecimento:** A porcentagem de agendamentos com status "compareceu".
    3.  **Taxa de Não Comparecimento (No-Show):** A porcentagem de agendamentos com status "nao_compareceu".
    4.  **Agendamentos Remarcados:** A porcentagem e o total de agendamentos com status "remarcado".
    5.  **Status "Agendado":** O total de compromissos que ainda estão com o status "agendado" e não foram concluídos.

    Structure the report in a professional and easy-to-read format using Markdown.
    Start with a summary of the key metrics, followed by any interesting observations or insights you can derive from the data.
    If the dataset is empty, state that no data was found for the given criteria.
  `,
});


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
