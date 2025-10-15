# **App Name**: Agenda Central

## Core Features:

- QR Code Enrollment: Capture parent information via QR code and store it directly in Firestore, with initial status set to 'pending'.
- Coordinator Panel: Enable coordinators to filter, approve, and release parent data in batches, updating the status to 'released' and logging the release date.
- Telemarketing Interface: Provide telemarketing staff with an interface to view released records, schedule appointments, update statuses to 'scheduled,' and add relevant observations.
- Shared Interactive Calendar: Develop a shared calendar that displays all scheduled appointments, allowing coordinators to reorder, reschedule, and cancel appointments, while telemarketing can view and mark attendance as 'confirmed.'
- Attendance Tracking: Allow coordinators or reception to mark attendance status (e.g., 'attended,' 'no show,' 'rescheduled'), automatically recording the actual service date.
- PDF Generation: Generate PDF forms with captured data for easy record-keeping.
- Report Generation Tool: The app will use reasoning to generate stats based on information stored in the database. The report could break the info down by school or by agent.

## Style Guidelines:

- Primary color: A calm blue (#64B5F6), reflecting trust and organization.
- Background color: Light gray (#F5F5F5), to keep the screen uncluttered and the important data clearly in view.
- Accent color: Soft green (#A5D6A7) for positive actions such as confirmation or attendance.
- Body and headline font: 'PT Sans' (sans-serif) for clear and accessible readability across all interfaces. 'Source Code Pro' (monospace) should be used when displaying snippets of computer code.
- A clean and structured layout to ensure intuitive navigation and quick access to key functions.
- Consistent and easily recognizable icons to aid in navigation and quickly identify status updates.
- Subtle transitions and animations for a smooth and engaging user experience.