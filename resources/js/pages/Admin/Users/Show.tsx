import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem, PageProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, CheckCircle, Edit, Mail, Shield, User, UserRound } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';

interface UserData {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  roles: string[];
}

interface ShowUserProps {
  user: UserData;
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Admin',
    href: '/admin/dashboard',
  },
  {
    title: 'Users',
    href: '/admin/users',
  },
  {
    title: 'User Details',
    href: '#',
  },
];

const getRoleBadgeColor = (role: string) => {
  switch (role?.toLowerCase()) {
    case 'admin':
      return 'bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 dark:border-red-800';
    case 'teacher':
      return 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:border-blue-800';
    case 'student':
      return 'bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 dark:border-green-800';
    default:
      return 'bg-gray-500/10 text-gray-600 hover:bg-gray-500/20 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:hover:bg-gray-900/30 dark:border-gray-800';
  }
};

export default function Show({ user }: PageProps<ShowUserProps>) {
  // Check if user is provided and valid
  if (!user || typeof user !== 'object' || !user.id) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="User Details" />
        <div className="flex h-full flex-1 flex-col gap-6 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">User Details</h1>
              <p className="text-muted-foreground">View detailed information about this user</p>
            </div>
            
            <Button variant="outline" asChild>
              <Link href={route('admin.users.index')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Users
              </Link>
            </Button>
          </div>
          
          <Card className="mx-auto max-w-3xl border shadow-md bg-card/50 backdrop-blur-sm">
            <CardContent className="p-10 text-center">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="rounded-full bg-destructive/10 p-3">
                  <User className="h-10 w-10 text-destructive" />
                </div>
                <h2 className="text-xl font-bold">User Not Found</h2>
                <p className="text-muted-foreground">
                  The requested user could not be found or the data is invalid.
                </p>
                <Button variant="default" asChild className="mt-4">
                  <Link href={route('admin.users.index')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Return to Users List
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const getInitials = (name: string) => {
    try {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    } catch (e) {
      return 'U';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'Not available';
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      return dateString || 'Not available';
    }
  };
  
  const roleDescriptions: Record<string, string> = {
    admin: 'Full access to all system features, user management, and settings.',
    teacher: 'Can create and manage courses, assignments, and grade student work.',
    student: 'Can enroll in courses, submit assignments, and view their progress.',
  };

  const rolePermissions: Record<string, string[]> = {
    admin: [
      'Create, edit, and delete users',
      'Manage all courses and content',
      'Access system settings',
      'Generate reports',
      'Manage user roles and permissions',
    ],
    teacher: [
      'Create and edit courses',
      'Create assignments and assessments',
      'Grade student work',
      'Message students',
      'View student progress',
    ],
    student: [
      'Enroll in courses',
      'Submit assignments',
      'View grades and feedback',
      'Access learning materials',
      'Communicate with teachers',
    ],
  };

  // Ensure user has roles property
  const roles = Array.isArray(user.roles) ? user.roles : [];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`User: ${user.name}`} />

      <div className="flex h-full flex-1 flex-col gap-6 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">User Details</h1>
            <p className="text-muted-foreground">View detailed information about this user</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" asChild className="border-primary/20 hover:bg-primary/10 hover:text-primary transition-colors">
              <Link href={route('admin.users.index')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Users
              </Link>
            </Button>
            <Button asChild className="bg-blue-500 hover:bg-blue-600 transition-colors">
              <Link href={route('admin.users.edit', user.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit User
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card className="border shadow-md bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-primary/10 p-1.5 text-primary">
                    <UserRound className="h-5 w-5" />
                  </div>
                  <CardTitle>Profile Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-shrink-0">
                    <Avatar className="h-24 w-24 border-4 border-primary/10 bg-primary/5 text-primary shadow-md">
                      <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-primary/80 to-primary/50 text-white">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="grid flex-1 gap-1">
                    <div className="flex flex-col gap-4">
                      <div>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <User className="h-3.5 w-3.5" />
                          <span>Full Name</span>
                        </div>
                        <p className="font-medium">{user.name}</p>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          <span>Email Address</span>
                        </div>
                        <p className="font-medium">{user.email}</p>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Joined</span>
                        </div>
                        <p className="font-medium">{formatDate(user.created_at)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-md bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-primary/10 p-1.5 text-primary">
                    <Shield className="h-5 w-5" />
                  </div>
                  <CardTitle>Roles & Permissions</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-4">
                  {roles.length > 0 ? roles.map((role, index) => (
                    <div key={index} className="rounded-lg border p-4 hover:border-primary/30 transition-colors">
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="font-semibold">{typeof role === 'string' ? (role.charAt(0).toUpperCase() + role.slice(1)) : 'Unknown'}</h3>
                        <Badge className={getRoleBadgeColor(typeof role === 'string' ? role : '')} variant="secondary">
                          {typeof role === 'string' ? role : 'unknown'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {typeof role === 'string' && roleDescriptions[role.toLowerCase()] 
                          ? roleDescriptions[role.toLowerCase()] 
                          : 'No description available.'}
                      </p>

                      <div className="mt-3">
                        <h4 className="text-xs font-medium text-muted-foreground">Permissions:</h4>
                        <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                          {typeof role === 'string' && rolePermissions[role.toLowerCase()] 
                            ? rolePermissions[role.toLowerCase()].map((permission, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <CheckCircle className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                                <span>{permission}</span>
                              </li>
                            ))
                            : <li className="text-center py-2">No permissions defined</li>
                          }
                        </ul>
                      </div>
                    </div>
                  )) : (
                    <div className="rounded-lg border border-dashed p-4 text-center text-muted-foreground">
                      <p>No roles assigned to this user.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border shadow-md bg-card/50 backdrop-blur-sm sticky top-6">
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-primary/10 p-1.5 text-primary">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <CardTitle>Activity</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <div className="rounded-lg border p-3 hover:border-primary/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">Account Created</h3>
                    <Badge variant="outline" className="text-xs border-primary/20">
                      {formatDate(user.created_at)}
                    </Badge>
                  </div>
                </div>
                
                <div className="rounded-lg border p-3 hover:border-primary/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">Last Updated</h3>
                    <Badge variant="outline" className="text-xs border-primary/20">
                      {formatDate(user.updated_at)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4 bg-muted/20">
                <p className="w-full text-center text-xs text-muted-foreground">
                  User ID: <span className="font-mono bg-primary/5 px-1.5 py-0.5 rounded">{user.id}</span>
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 