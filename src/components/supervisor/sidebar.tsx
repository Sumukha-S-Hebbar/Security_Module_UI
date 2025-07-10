'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  AlertTriangle,
  Users,
  Building2,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const menuItems = [
  { href: '/supervisor/home', label: 'Home', icon: Home },
  { href: '/supervisor/alerts', label: 'Alerts', icon: AlertTriangle },
  { href: '/supervisor/guards', label: 'Security Guards', icon: Users },
  { href: '/supervisor/sites', label: 'Sites', icon: Building2 },
];

export default function PatrollingOfficerSidebar() {
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
                isActive={pathname.startsWith(item.href)}
                className={cn(
                  'w-full justify-start',
                  pathname.startsWith(item.href) &&
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
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="w-full justify-start"
            >
              <Link href="/">
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
