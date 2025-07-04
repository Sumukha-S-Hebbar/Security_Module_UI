import type { Guard } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Briefcase } from 'lucide-react';

export function GuardLeaveTracker({ guards }: { guards: Guard[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-muted-foreground" />
          <CardTitle>Guard Leave Tracker</CardTitle>
        </div>
        <CardDescription>
          Annual leave status for all security guards.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Guard</TableHead>
              <TableHead className="text-center">Leaves Taken</TableHead>
              <TableHead className="w-[200px]">Leave Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guards.map((guard) => (
              <TableRow key={guard.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={guard.avatar} alt={guard.name} />
                      <AvatarFallback>{guard.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{guard.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ID: {guard.id}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center font-medium">
                  {guard.leavesTaken} / {guard.annualLeave}
                </TableCell>
                <TableCell>
                  <Progress
                    value={(guard.leavesTaken / guard.annualLeave) * 100}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
