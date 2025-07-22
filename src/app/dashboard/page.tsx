'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LogOut,
  PlusCircle,
  MoreHorizontal,
  Trash2,
  Pencil,
  Briefcase,
  Building2,
  Settings,
  User,
} from 'lucide-react';
import { AddApplicationForm } from './add-application-form';
import { deleteApplication, signOut } from './actions';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

type Application = {
  id: string;
  company: string;
  role: string;
  status: string;
  date_applied: string;
};

type User = {
  id: string;
  email?: string;
};

const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status.toLowerCase()) {
    case 'offer': return 'default';
    case 'interviewing': return 'secondary';
    case 'rejected': return 'destructive';
    default: return 'outline';
  }
};

function DashboardSkeleton() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 p-8">
      <header className="flex items-center justify-between mb-8">
        <Skeleton className="h-8 w-32" />
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </header>
      <main>
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 rounded-lg bg-slate-800/20">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }
        setUser(user);

        const { data } = await supabase.from('applications').select('*').order('date_applied', { ascending: false });
        setApplications(data);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [router, supabase]);

  const refreshApplications = async () => {
    const { data } = await supabase.from('applications').select('*').order('date_applied', { ascending: false });
    setApplications(data);
  };

  const handleSignOut = async () => signOut();
  const handleDeleteApplication = async (id: string) => {
    await deleteApplication(id);
    await refreshApplications();
  };
  const handleFormSubmit = async () => {
    setIsDialogOpen(false);
    await refreshApplications();
  };

  if (isLoading) return <DashboardSkeleton />;
  if (!user) return null;

  const userInitials = user.email?.slice(0, 2).toUpperCase() || '??';

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 p-8">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex items-center justify-between mb-8"
      >
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="font-semibold"><PlusCircle className="mr-2 h-4 w-4" /> Add Application</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Application</DialogTitle>
                <DialogDescription>Track a new internship application.</DialogDescription>
              </DialogHeader>
              <AddApplicationForm onFormSubmit={handleFormSubmit} />
            </DialogContent>
          </Dialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 w-10 rounded-full"><Avatar><AvatarFallback>{userInitials}</AvatarFallback></Avatar></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem><User className="mr-2 h-4 w-4" /> Profile</DropdownMenuItem>
              <DropdownMenuItem><Settings className="mr-2 h-4 w-4" /> Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-500"><LogOut className="mr-2 h-4 w-4" /> Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.header>

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
      >
        <Card>
          <CardHeader>
            <CardTitle>My Applications</CardTitle>
            <CardDescription>{applications?.length || 0} applications being tracked.</CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence>
              {applications && applications.length > 0 ? (
                <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Table>
                    <TableHeader><TableRow><TableHead>Company</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead>Date Applied</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {applications.map((app, index) => (
                        <motion.tr key={app.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
                          className={index % 2 === 0 ? 'bg-slate-900/50' : ''}
                        >
                          <TableCell className="font-medium"><div className="flex items-center"><Building2 className="mr-3 h-4 w-4 text-slate-400" />{app.company}</div></TableCell>
                          <TableCell>{app.role}</TableCell>
                          <TableCell><Badge variant={getStatusVariant(app.status)}>{app.status}</Badge></TableCell>
                          <TableCell>{new Date(app.date_applied).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-500"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem></AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the application.</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteApplication(app.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center p-16 border-2 border-dashed border-slate-800 rounded-lg"
                >
                  <Briefcase className="h-12 w-12 text-slate-500 mb-4" />
                  <h3 className="text-xl font-bold">No applications yet</h3>
                  <p className="text-slate-400 mb-6">Add your first application to get started.</p>
                  <Button onClick={() => setIsDialogOpen(true)}><PlusCircle className="mr-2 h-4 w-4" />Add Application</Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.main>
    </div>
  );
}
