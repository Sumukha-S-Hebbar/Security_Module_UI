
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
            "text-base text-header-foreground/70 hover:text-header-foreground hover:bg-header-background/50",
            pathname.startsWith(item.href) && "text-header-foreground font-semibold"
        )}>
          <Link href={item.href}>
            {item.label}
          </Link>
        </Button>
      ))}
    </>
  );
}
