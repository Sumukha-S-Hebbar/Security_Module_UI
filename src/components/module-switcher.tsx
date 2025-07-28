'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';

type Module = {
  name: string;
  href: string;
};

const allModules: Module[] = [
  { name: 'Real Estate', href: '#' },
  { name: 'Security', href: '#' }, // Href will be replaced by portal-specific home
  { name: 'Energy', href: '#' },
  { name: 'Incident Management', href: '/incidents' }, // Example link
  { name: 'Preventive Maintenance', href: '#' },
  { name: 'Site Master', href: '#' },
];

// In a real app, this would come from a user context or API call
const MOCK_ENABLED_MODULES_FOR_USER = ['Security', 'Incident Management'];

export function ModuleSwitcher({ portalHome }: { portalHome: '/agency/home' | '/towerco/home' }) {
  const isModuleEnabled = (moduleName: string) => {
    return MOCK_ENABLED_MODULES_FOR_USER.includes(moduleName);
  };
  
  const getModuleHref = (module: Module) => {
    if (module.name === 'Security') {
      return portalHome;
    }
    if (module.name === 'Incident Management') {
        const incidentPath = portalHome.startsWith('/agency') ? '/agency/incidents' : '/towerco/incidents';
        return incidentPath;
    }
    return module.href;
  }

  return (
    <div className="bg-background border-b">
      <div className="container mx-auto px-4 md:px-6">
        <nav className="flex items-center gap-4 sm:gap-6 text-sm">
          {allModules.map((module) => {
            const enabled = isModuleEnabled(module.name);
            return (
              <Link
                key={module.name}
                href={enabled ? getModuleHref(module) : '#'}
                className={cn(
                  'py-2 font-semibold transition-colors',
                  enabled
                    ? 'text-primary hover:text-primary/80'
                    : 'text-muted-foreground/60 cursor-not-allowed'
                )}
                aria-disabled={!enabled}
                onClick={(e) => !enabled && e.preventDefault()}
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
