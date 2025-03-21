import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { type BreadcrumbItem, PageProps } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Eye, Loader2, Mail, Shield, User, UserCog } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
    title: 'Edit',
    href: '#',
  },
];

interface EditUserProps {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  roles: string[];
}

export default function Edit({ user, roles }: PageProps<EditUserProps>) {
  const { data, setData, errors, put, processing, reset } = useForm({
    name: user.name,
    email: user.email,
    password: '',
    password_confirmation: '',
    role: user.role,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('admin.users.update', user.id), {
      onSuccess: () => {
        // Flash message will be handled by the FlashMessage component
      },
      preserveScroll: true,
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
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

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Edit User" />

      <div className="flex h-full flex-1 flex-col gap-6 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Edit User</h1>
            <p className="text-muted-foreground">Update user account information and permissions</p>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => router.get(route('admin.users.index'))} 
            className="border-primary/20 hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Button>
        </div>

        <div className="mx-auto w-full max-w-3xl">
          <Card className="border shadow-md bg-card/50 backdrop-blur-sm overflow-hidden">
            <form onSubmit={handleSubmit}>
              <CardHeader className="pb-6 border-b">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <UserCog className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Account Information</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      Update {user.name}'s account details and permissions
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className={errors.name ? "text-destructive" : ""}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <User className="h-3.5 w-3.5" />
                      <span>Full Name</span>
                    </div>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    required
                    placeholder="John Doe"
                    className={`h-11 ${errors.name ? "border-destructive ring-destructive" : "border-primary/20 focus-visible:ring-primary/20"}`}
                    disabled={processing}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive mt-1">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className={errors.email ? "text-destructive" : ""}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      <span>Email Address</span>
                    </div>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    required
                    placeholder="user@example.com"
                    className={`h-11 ${errors.email ? "border-destructive ring-destructive" : "border-primary/20 focus-visible:ring-primary/20"}`}
                    disabled={processing}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="pt-3 pb-2">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Password</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className={errors.password ? "text-destructive" : ""}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Eye className="h-3.5 w-3.5" />
                      <span>New Password</span>
                      <span className="text-xs text-muted-foreground ml-1">(leave blank to keep current)</span>
                    </div>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    placeholder="••••••••"
                    className={`h-11 ${errors.password ? "border-destructive ring-destructive" : "border-primary/20 focus-visible:ring-primary/20"}`}
                    disabled={processing}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive mt-1">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password_confirmation" className={errors.password_confirmation ? "text-destructive" : ""}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Eye className="h-3.5 w-3.5" />
                      <span>Confirm New Password</span>
                    </div>
                  </Label>
                  <Input
                    id="password_confirmation"
                    type="password"
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    placeholder="••••••••"
                    className={`h-11 ${errors.password_confirmation ? "border-destructive ring-destructive" : "border-primary/20 focus-visible:ring-primary/20"}`}
                    disabled={processing}
                  />
                  {errors.password_confirmation && (
                    <p className="text-sm text-destructive mt-1">{errors.password_confirmation}</p>
                  )}
                </div>

                <div className="pt-3 pb-2">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Permissions</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className={errors.role ? "text-destructive" : ""}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Shield className="h-3.5 w-3.5" />
                      <span>User Role</span>
                    </div>
                  </Label>
                  <Select 
                    value={data.role} 
                    onValueChange={(value) => setData('role', value)}
                    disabled={processing}
                  >
                    <SelectTrigger 
                      id="role"
                      className={`h-11 ${errors.role ? "border-destructive ring-destructive" : "border-primary/20 focus-visible:ring-primary/20"}`}
                    >
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role} value={role} className="focus:bg-primary/10">
                          <div className="flex items-center gap-2">
                            <span>{role.charAt(0).toUpperCase() + role.slice(1)}</span>
                            <Badge className={getRoleBadgeColor(role)} variant="secondary">
                              {role}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-sm text-destructive mt-1">{errors.role}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t px-6 py-4 bg-muted/20">
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.get(route('admin.users.index'))}
                    disabled={processing}
                    className="border-primary/20 hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={processing}
                    className="bg-blue-500 hover:bg-blue-600 transition-colors shadow-md"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <UserCog className="mr-2 h-4 w-4" />
                        Update User
                      </>
                    )}
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
} 