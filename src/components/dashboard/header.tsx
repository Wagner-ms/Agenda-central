'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  User,
  PanelLeft,
  CheckSquare,
  Calendar,
  PieChart,
  UserCheck,
  PhoneCall,
  LogOut,
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useAuth, useUser } from '@/firebase';

const navItems = [
  { href: '/dashboard/autorizacoes', icon: UserCheck, label: 'Autorizações', roles: ['coordinator'] },
  { href: '/dashboard/agendamento', icon: PhoneCall, label: 'Agendamento', roles: ['telemarketing'] },
  { href: '/dashboard/agenda', icon: Calendar, label: 'Agenda', roles: ['coordinator', 'telemarketing'] },
  { href: '/dashboard/relatorios', icon: PieChart, label: 'Relatórios', roles: ['coordinator'] },
];

export function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { user } = useUser();

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
    }
    router.push('/');
  };
  
  const userRole = user?.email?.startsWith('coordenadora') ? 'coordinator' : 'telemarketing';
  const dashboardHome = userRole === 'coordinator' ? '/dashboard/autorizacoes' : '/dashboard/agendamento';


  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-card px-4 sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href={dashboardHome}
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
            >
              <CheckSquare className="h-5 w-5 transition-all group-hover:scale-110" />
              <span className="sr-only">Agenda Central</span>
            </Link>
            {navItems.filter(item => item.roles.includes(userRole)).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground",
                  pathname.startsWith(item.href) && "text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="ml-auto flex-1 sm:flex-initial">
          {/* Optional Search Bar */}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback>{userRole === 'coordinator' ? 'C' : 'T'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{userRole === 'coordinator' ? 'Coordenadora' : 'Telemarketing'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Configurações</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
