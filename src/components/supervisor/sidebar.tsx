'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  AlertTriangle,
  Users,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const menuItems = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/alerts', label: 'Alerts', icon: AlertTriangle },
  { href: '/guards', label: 'Security Guards', icon: Users },
  { href: '/sites', label: 'Sites', icon: Building2 },
];

export default function SupervisorSidebar() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-8 h-8 text-primary" />
          <h1 className="text-xl font-bold">GuardLink</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                className={cn(
                  'w-full justify-start',
                  pathname === item.href &&
                    'bg-primary/10 text-primary hover:bg-primary/20'
                )}
              >
                <Link href={item.href}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
