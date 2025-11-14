import { redirect } from 'next/navigation';

export default function DashboardPage() {
  // The user will be redirected to their specific dashboard home by the login logic 
  // and the layout file's useEffect hook handles unauthenticated users.
  // A default redirect can still be useful as a fallback.
  redirect('/dashboard/distribuicao');
}
