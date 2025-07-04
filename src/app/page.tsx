
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';

export default function RootPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ShieldCheck className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to GuardLink</CardTitle>
          <CardDescription>Please select your portal</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button asChild size="lg">
            <Link href="/supervisor/home">Supervisor Portal</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/agency/home">Agency Portal</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/towerco/home">TOWERCO/MNO Portal</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
