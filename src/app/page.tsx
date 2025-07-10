
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldCheck } from 'lucide-react';

export default function RootPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Tabs defaultValue="signin" className="w-full max-w-md mx-4">
        <div className="flex flex-col items-center justify-center mb-6 text-center">
            <ShieldCheck className="w-12 h-12 text-primary mb-4" />
            <h1 className="text-2xl font-bold">Welcome to GuardLink</h1>
        </div>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="signin">
          <Card>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>
                Enter your credentials to access your portal.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-in">Email</Label>
                <Input id="email-in" type="email" placeholder="m@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-in">Password</Label>
                <Input id="password-in" type="password" required />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Sign In</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>Sign Up</CardTitle>
              <CardDescription>
                Create an account to get started with GuardLink.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                <Label htmlFor="name-up">Full Name</Label>
                <Input id="name-up" type="text" placeholder="John Doe" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-up">Email</Label>
                <Input id="email-up" type="email" placeholder="m@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-up">Password</Label>
                <Input id="password-up" type="password" required />
              </div>
               <div className="space-y-2">
                <Label>Select Portal</Label>
                <Select>
                    <SelectTrigger>
                        <SelectValue placeholder="Choose your role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="supervisor">Patrolling Officer</SelectItem>
                        <SelectItem value="agency">Agency</SelectItem>
                        <SelectItem value="towerco">TOWERCO/MNO</SelectItem>
                    </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Sign Up</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
