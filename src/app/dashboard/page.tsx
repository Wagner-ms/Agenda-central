import { redirect } from 'next/navigation';

export default function DashboardPage() {
  // Default to coordinator's view for the main dashboard URL
  redirect('/dashboard/autorizacoes');
}
