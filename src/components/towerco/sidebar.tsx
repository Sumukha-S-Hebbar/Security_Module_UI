
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Building2,
  Shield,
  Briefcase,
  BarChart,
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
  { href: '/towerco/home', label: 'Home', icon: Home },
  { href: '/towerco/agencies', label: 'Security Agencies', icon: Briefcase },
  { href: '/towerco/sites', label: 'Sites', icon: Building2 },
  { href: '/towerco/reports', label: 'Reports', icon: BarChart },
];

export default function TowercoSidebar() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold">GuardLink</h1>
            <p className="text-xs text-muted-foreground">TOWERCO/MNO Portal</p>
          </div>
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
    </>
  );
}
