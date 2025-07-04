
'use client';

import { useState } from 'react';
import { guards, supervisors } from '@/lib/data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GuardUploader } from './_components/guard-uploader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function AgencyGuardsPage() {
  const { toast } = useToast();
  const [selectedSupervisors, setSelectedSupervisors] = useState<{
    [key: string]: string;
  }>({});

  const getSupervisorById = (id?: string) =>
    supervisors.find((s) => s.id === id);

  const assignedGuards = guards.filter((guard) => guard.supervisorId);
  const unassignedGuards = guards.filter((guard) => !guard.supervisorId);

  const handleSupervisorSelect = (guardId: string, supervisorId: string) => {
    setSelectedSupervisors((prev) => ({
      ...prev,
      [guardId]: supervisorId,
    }));
  };

  const handleAssignSupervisor = (guardId: string) => {
    const supervisorId = selectedSupervisors[guardId];
    if (!supervisorId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a supervisor first.',
      });
      return;
    }
    const guardName = guards.find((g) => g.id === guardId)?.name;
    const supervisorName = supervisors.find((s) => s.id === supervisorId)?.name;

    toast({
      title: 'Supervisor Assigned',
      description: `${supervisorName} has been assigned to ${guardName}. The guard will be moved to the assigned list on next refresh.`,
    });
    // In a real app, you would make an API call here to update the database
    // and then refetch the data or update the state locally.
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Security Guard Management
        </h1>
        <p className="text-muted-foreground">
          Add, view, and manage guard profiles and their assignments.
        </p>
      </div>

      <GuardUploader />

      <Card>
        <CardHeader>
          <CardTitle>Assigned Security Guards</CardTitle>
          <CardDescription>
            A list of all guards with an assigned supervisor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guard</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Supervisor</TableHead>
                <TableHead>Perimeter Accuracy</TableHead>
                <TableHead>Selfie Check-in Accuracy</TableHead>
                <TableHead>Phone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignedGuards.map((guard) => {
                const supervisor = getSupervisorById(guard.supervisorId);
                const selfieAccuracy =
                  guard.totalSelfieRequests > 0
                    ? Math.round(
                        ((guard.totalSelfieRequests - guard.missedSelfieCount) /
                          guard.totalSelfieRequests) *
                          100
                      )
                    : 100;
                return (
                  <TableRow key={guard.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={guard.avatar} alt={guard.name} />
                          <AvatarFallback>
                            {guard.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{guard.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ID: {guard.id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{guard.site}</TableCell>
                    <TableCell>{supervisor?.name || 'Unassigned'}</TableCell>
                    <TableCell>
                      {guard.performance?.perimeterAccuracy}%
                    </TableCell>
                    <TableCell>{selfieAccuracy}%</TableCell>
                    <TableCell>{guard.phone}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {unassignedGuards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Unassigned Security Guards</CardTitle>
            <CardDescription>
              A list of guards that do not have a supervisor assigned.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guard</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Assign Supervisor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unassignedGuards.map((guard) => (
                  <TableRow key={guard.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={guard.avatar} alt={guard.name} />
                          <AvatarFallback>
                            {guard.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{guard.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ID: {guard.id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{guard.site}</TableCell>
                    <TableCell>{guard.phone}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Select
                          value={selectedSupervisors[guard.id] || ''}
                          onValueChange={(value) =>
                            handleSupervisorSelect(guard.id, value)
                          }
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Supervisor" />
                          </SelectTrigger>
                          <SelectContent>
                            {supervisors.map((supervisor) => (
                              <SelectItem
                                key={supervisor.id}
                                value={supervisor.id}
                              >
                                {supervisor.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          onClick={() => handleAssignSupervisor(guard.id)}
                          disabled={!selectedSupervisors[guard.id]}
                        >
                          Assign
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
