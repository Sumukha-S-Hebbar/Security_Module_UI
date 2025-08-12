
'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Module = {
  name: string;
  href: string;
};

const allModules: Module[] = [
  { name: 'Real Estate', href: 'https://ken.towerbuddy.tel/authorization' },
  { name: 'Security', href: '#' }, // Href will be replaced by portal-specific home
  { name: 'Energy', href: '#' },
  { name: 'Incident Management', href: '#' },
  { name: 'Preventive Maintenance', href: '#' },
  { name: 'Site Master', href: '#' },
];

// In a real app, this would come from a user context or API call
const MOCK_ENABLED_MODULES_FOR_USER = ['Security'];

export function ModuleSwitcher({ portalHome }: { portalHome: '/agency/home' | '/towerco/home' }) {
  const pathname = usePathname();

  const isModuleEnabled = (moduleName: string) => {
    return MOCK_ENABLED_MODULES_FOR_USER.includes(moduleName);
  };
  
  const getModuleHref = (module: Module) => {
    if (module.name === 'Security') {
      return portalHome;
    }
    return module.href;
  }

  const isSecurityModuleActive = () => {
      return pathname.startsWith('/agency') || pathname.startsWith('/towerco');
  }

  return (
    <div className="bg-background border-b">
      <div className="container mx-auto px-4 md:px-6">
        <nav className="flex items-center justify-center gap-4 sm:gap-6 text-sm">
          {allModules.map((module) => {
            const enabled = isModuleEnabled(module.name);
            const isActive = module.name === 'Security' && isSecurityModuleActive();

            return (
              <Link
                key={module.name}
                href={enabled ? getModuleHref(module) : '#'}
                className={cn(
                  'px-3 py-1 font-semibold transition-colors rounded-md',
                  enabled
                    ? 'text-primary hover:text-primary/80'
                    : 'text-muted-foreground/60 cursor-not-allowed',
                  isActive && 'bg-destructive/10 border border-destructive text-destructive'
                )}
                aria-disabled={!enabled}
                onClick={(e) => !enabled && e.preventDefault()}
                target={module.name === 'Real Estate' ? '_blank' : undefined}
                rel={module.name === 'Real Estate' ? 'noopener noreferrer' : undefined}
              >
                {module.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
