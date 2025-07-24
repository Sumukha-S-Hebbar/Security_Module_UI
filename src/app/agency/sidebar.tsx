
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Building2,
  Users,
  UserCheck,
  ShieldAlert,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export const menuItems = [
  { href: '/agency/home', label: 'Home', icon: Home },
  { href: '/agency/sites', label: 'Sites', icon: Building2 },
  { href: '/agency/patrolling-officers', label: 'Patrolling Officers', icon: UserCheck },
  { href: '/agency/guards', label: 'Security Guards', icon: Users },
  { href: '/agency/incidents', label: 'Incidents', icon: ShieldAlert },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {menuItems.map((item) => (
        <Button key={item.href} asChild variant="ghost" className={cn(
            "relative text-base text-header-foreground hover:text-header-foreground hover:bg-header-background/50",
             pathname.startsWith(item.href) && "font-semibold"
        )}>
          <Link href={item.href}>
            {item.label}
            {pathname.startsWith(item.href) && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-destructive animate-slide-in" />
            )}
          </Link>
        </Button>
      ))}
    </>
  );
}
