'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckSquare, Calendar, PieChart, UserCheck, PhoneCall } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';

const navItems = [
  { href: '/dashboard/autorizacoes', icon: UserCheck, label: 'Autorizações', roles: ['coordinator'] },
  { href: '/dashboard/agendamento', icon: PhoneCall, label: 'Agendamento', roles: ['telemarketing'] },
  { href: '/dashboard/agenda', icon: Calendar, label: 'Agenda', roles: ['coordinator', 'telemarketing'] },
  { href: '/dashboard/relatorios', icon: PieChart, label: 'Relatórios', roles: ['coordinator'] },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  // In a real app, get role from user session.
  // For demo purposes, we infer the role from the path.
  const userRole = user?.email?.startsWith('coordenadora') ? 'coordinator' : 'telemarketing';

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-card sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          href="/dashboard"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <CheckSquare className="h-4 w-4 transition-all group-hover:scale-110" />
          <span className="sr-only">Agenda Central</span>
        </Link>
        <TooltipProvider>
          {navItems.filter(item => item.roles.includes(userRole)).map((item) => (
            <Tooltip key={item.href} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                    pathname.startsWith(item.href) && "bg-accent text-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </nav>
    </aside>
  );
}
