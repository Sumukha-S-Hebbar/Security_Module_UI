
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { alerts as initialAlerts, guards } from '@/lib/data';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertTriangle,
  CameraOff,
  LogOut,
  Phone,
  Eye,
  ShieldAlert,
  CheckCircle,
  ChevronDown,
  FileDown,
} from 'lucide-react';
import type { Alert } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const { toast } = useToast();

  const emergencyAlerts = alerts.filter((alert) => alert.type === 'Emergency');
  const otherAlerts = alerts.filter((alert) => alert.type !== 'Emergency');

  const getGuardByName = (name: string) => guards.find((g) => g.name === name);

  const handleStatusChange = (alertId: string, status: Alert['status']) => {
    setAlerts((prevAlerts) =>
      prevAlerts.map((alert) =>
        alert.id === alertId ? { ...alert, status } : alert
      )
    );
  };

  const handleDownloadReport = (alert: Alert) => {
    toast({
      title: 'Report Download Started',
      description: `Downloading report for incident #${alert.id}.`,
    });
    // In a real app, this would trigger a file download.
  };

  const alertTypeDisplay = (type: Alert['type']) => {
    switch (type) {
      case 'Missed Selfie':
        return (
          <div className="flex items-center gap-2">
            <CameraOff className="h-4 w-4 text-muted-foreground" />
            <span>Missed Selfie</span>
          </div>
        );
      case 'Guard Out of Premises':
        return (
          <div className="flex items-center gap-2">
            <LogOut className="h-4 w-4 text-muted-foreground" />
            <span>Guard Out of Premises</span>
          </div>
        );
      case 'Emergency':
      default:
        return null;
    }
  };

  const getStatusBadge = (status: Alert['status']) => {
    switch (status) {
      case 'Active':
        return <Badge variant="destructive">Active</Badge>;
      case 'Under Review':
        return <Badge variant="default">Under Review</Badge>;
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
          <h1 className="text-3xl font-bold tracking-tight">Alerts Log</h1>
          <p className="text-muted-foreground">
            A historical record of all system alerts.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Emergency Alerts
            </CardTitle>
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
                  <TableHead>Report</TableHead>
                  <TableHead>Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emergencyAlerts.map((alert) => {
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              Actions <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(alert.id, 'Under Review')
                              }
                              disabled={
                                alert.status === 'Under Review' ||
                                alert.status === 'Resolved'
                              }
                            >
                              <ShieldAlert className="mr-2 h-4 w-4" />
                              Start Review
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(alert.id, 'Resolved')
                              }
                              disabled={isResolved}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Resolved
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadReport(alert)}
                        >
                          <FileDown className="mr-2 h-4 w-4" />
                          Download Report
                        </Button>
                      </TableCell>
                      <TableCell>
                        {guardDetails ? (
                          <Button asChild variant="outline" size="sm">
                            <a href={`tel:${guardDetails.phone}`}>
                              <Phone />
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
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Guard Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {otherAlerts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alert ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>Guard</TableHead>
                    <TableHead>Contact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {otherAlerts.map((alert) => {
                    const guardDetails = getGuardByName(alert.guard);
                    return (
                      <TableRow key={alert.id}>
                        <TableCell className="font-medium">
                          {alert.id}
                        </TableCell>
                        <TableCell>{alertTypeDisplay(alert.type)}</TableCell>
                        <TableCell>{alert.date}</TableCell>
                        <TableCell>{alert.site}</TableCell>
                        <TableCell>{alert.guard}</TableCell>
                        <TableCell>
                          {guardDetails ? (
                            <Button asChild variant="outline" size="sm">
                              <a href={`tel:${guardDetails.phone}`}>
                                <Phone />
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
                  })}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-sm">
                No general alerts found.
              </p>
            )}
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
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
