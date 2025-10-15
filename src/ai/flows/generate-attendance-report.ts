'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating attendance reports.
 *
 * - generateAttendanceReport - A function to generate attendance reports based on specified criteria.
 * - GenerateAttendanceReportInput - The input type for the generateAttendanceReport function.
 * - GenerateAttendanceReportOutput - The return type for the generateAttendanceReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAttendanceReportInputSchema = z.object({
  reportType: z.enum(['school', 'agent']).describe('The type of report to generate: school or agent.'),
  schoolName: z.string().optional().describe('The name of the school to filter by (required if reportType is school).'),
  agentId: z.string().optional().describe('The ID of the telemarketing agent to filter by (required if reportType is agent).'),
});

export type GenerateAttendanceReportInput = z.infer<typeof GenerateAttendanceReportInputSchema>;

const GenerateAttendanceReportOutputSchema = z.object({
  report: z.string().describe('The generated attendance report.'),
});

export type GenerateAttendanceReportOutput = z.infer<typeof GenerateAttendanceReportOutputSchema>;

export async function generateAttendanceReport(input: GenerateAttendanceReportInput): Promise<GenerateAttendanceReportOutput> {
  return generateAttendanceReportFlow(input);
}

const generateAttendanceReportPrompt = ai.definePrompt({
  name: 'generateAttendanceReportPrompt',
  input: {schema: GenerateAttendanceReportInputSchema},
  output: {schema: GenerateAttendanceReportOutputSchema},
  prompt: `You are an expert data analyst specializing in generating reports for school attendance.

  Generate a report based on the following criteria:

  Report Type: {{{reportType}}}
  School Name: {{#if schoolName}}{{{schoolName}}}{{else}}All Schools{{/if}}
  Agent ID: {{#if agentId}}{{{agentId}}}{{else}}All Agents{{/if}}

  The report should include key statistics such as total scheduled appointments, total confirmed attendance, no-show rate, and any other relevant information.

  Ensure the report is well-formatted and easy to understand.
  `,
});

const generateAttendanceReportFlow = ai.defineFlow(
  {
    name: 'generateAttendanceReportFlow',
    inputSchema: GenerateAttendanceReportInputSchema,
    outputSchema: GenerateAttendanceReportOutputSchema,
  },
  async input => {
    const {output} = await generateAttendanceReportPrompt(input);
    return output!;
  }
);
