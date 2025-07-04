'use client';

import { useState } from 'react';
import Image from 'next/image';
import { alerts as initialAlerts, guards } from '@/lib/data';
import type { Alert, Guard } from '@/types';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Eye, Phone, ShieldAlert, CheckCircle } from 'lucide-react';

export default function AgencyIncidentsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(
    initialAlerts.filter((alert) => alert.type === 'Emergency')
  );
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const getGuardByName = (name: string): Guard | undefined => {
    return guards.find((g) => g.name === name);
  };

  const handleStatusChange = (alertId: string, status: Alert['status']) => {
    setAlerts((prevAlerts) =>
      prevAlerts.map((alert) =>
        alert.id === alertId ? { ...alert, status } : alert
      )
    );
  };
  
  const getStatusBadge = (status: Alert['status']) => {
    switch (status) {
      case 'Active':
        return <Badge variant="destructive">Active</Badge>;
      case 'Investigating':
        return <Badge variant="default">Investigating</Badge>;
      case 'Resolved':
        return <Badge variant="secondary">Resolved</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Incidents</h1>
          <p className="text-muted-foreground">
            A log of all emergency incidents reported across sites.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Emergency Incidents</CardTitle>
            <CardDescription>
              Review and manage all high-priority alerts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alert ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Guard</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Actions</TableHead>
                  <TableHead>Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.length > 0 ? (
                  alerts.map((alert) => {
                    const guardDetails = getGuardByName(alert.guard);
                    const isResolved = alert.status === 'Resolved';

                    return (
                      <TableRow key={alert.id}>
                        <TableCell className="font-medium">{alert.id}</TableCell>
                        <TableCell>{alert.date}</TableCell>
                        <TableCell>{alert.site}</TableCell>
                        <TableCell>{alert.guard}</TableCell>
                        <TableCell>{getStatusBadge(alert.status)}</TableCell>
                        <TableCell>
                          {alert.images && alert.images.length > 0 ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedAlert(alert)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              No Media
                            </span>
                          )}
                        </TableCell>
                         <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleStatusChange(alert.id, 'Investigating')
                              }
                              disabled={
                                alert.status === 'Investigating' ||
                                alert.status === 'Resolved'
                              }
                            >
                              <ShieldAlert className="mr-2 h-4 w-4" />
                              Investigate
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleStatusChange(alert.id, 'Resolved')
                              }
                              disabled={isResolved}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Resolved
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          {guardDetails ? (
                            <Button asChild variant="outline" size="sm">
                              <a href={`tel:${guardDetails.phone}`}>
                                <Phone className="mr-2 h-4 w-4" />
                                Contact Guard
                              </a>
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              N/A
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-muted-foreground"
                    >
                      No emergency incidents found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {selectedAlert && (
        <Dialog
          open={!!selectedAlert}
          onOpenChange={(isOpen) => !isOpen && setSelectedAlert(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Details for Alert #{selectedAlert.id}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4 grid-cols-1 sm:grid-cols-2">
              {selectedAlert.images?.map((src, index) => (
                <div key={index} className="relative aspect-video">
                  <Image
                    src={src}
                    alt={`Emergency detail ${index + 1}`}
                    fill
                    className="rounded-md object-cover"
                    data-ai-hint={
                      selectedAlert.id === 'A001'
                        ? 'security camera'
                        : 'fire alarm'
                    }
                  />
                </div>
              ))}
            </div>
            {selectedAlert.callDetails && (
              <div className="space-y-2">
                <h4 className="font-medium">Call Summary</h4>
                <p className="text-sm text-muted-foreground">{selectedAlert.callDetails}</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
