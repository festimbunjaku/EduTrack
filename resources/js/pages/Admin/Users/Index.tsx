import { useState, useEffect } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { type BreadcrumbItem, PageProps, User } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Eye, Pencil, Trash2, UserPlus, Search, RefreshCw, ChevronLeft, ChevronRight, X, AlertTriangle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import AppLogoIcon from '@/components/app-logo-icon';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Admin',
    href: '/admin/dashboard',
  },
  {
    title: 'Users',
    href: '/admin/users',
  },
];

interface Role {
  id: number;
  name: string;
}

interface UsersIndexProps extends Record<string, unknown> {
  users: {
    data: (User & { roles?: (Role | string)[] })[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  roles: (string | { id?: number; name?: string })[];
  filters: {
    search: string;
    role: string;
  };
}

export default function Index({ users = { data: [], current_page: 1, last_page: 1, per_page: 10, total: 0, from: 0, to: 0 }, roles = [], filters = { search: '', role: 'all' } }: PageProps<UsersIndexProps>) {
  const [searchTerm, setSearchTerm] = useState(filters?.search || '');
  const [selectedRole, setSelectedRole] = useState(filters?.role || 'all');
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  
  // Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<null | { id: number; name: string }>(null);

  // Handle search term debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Apply filters when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== filters?.search) {
      applyFilters();
    }
  }, [debouncedSearch]);

  const applyFilters = () => {
    if (isLoading) return;
    
    setIsLoading(true);
    router.post(route('admin.users.search'), {
      search: debouncedSearch,
      role: selectedRole === 'all' ? '' : selectedRole,
      page: 1
    }, {
      preserveState: true,
      preserveScroll: true,
      only: ['users', 'filters'],
      onFinish: () => setIsLoading(false),
      onError: () => setIsLoading(false)
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedRole('all');
    
    // Apply immediately when clearing filters
    setIsLoading(true);
    router.post(route('admin.users.search'), {
      search: '',
      role: '',
      page: 1
    }, {
      preserveState: true,
      preserveScroll: true,
      only: ['users', 'filters'],
      onFinish: () => setIsLoading(false),
      onError: () => setIsLoading(false)
    });
  };

  const handleRoleFilter = (value: string) => {
    setSelectedRole(value);
    
    // Apply filters immediately when role changes
    setIsLoading(true);
    router.post(route('admin.users.search'), {
      search: debouncedSearch,
      role: value === 'all' ? '' : value,
      page: 1
    }, {
      preserveState: true,
      preserveScroll: true,
      only: ['users', 'filters'],
      onFinish: () => setIsLoading(false),
      onError: () => setIsLoading(false)
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      applyFilters();
    }
  };

  const handleDeleteClick = (user: { id: number; name: string }) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!userToDelete) return;
    
    setIsLoading(true);
    router.delete(route('admin.users.destroy', userToDelete.id), {
      preserveScroll: true,
      onFinish: () => {
        setIsLoading(false);
        setDeleteModalOpen(false);
        setUserToDelete(null);
      }
    });
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const goToPage = (page: number) => {
    setIsLoading(true);
    router.post(route('admin.users.search'), {
      search: debouncedSearch,
      role: selectedRole === 'all' ? '' : selectedRole,
      page: page
    }, {
      preserveState: true,
      preserveScroll: true,
      only: ['users'],
      onFinish: () => setIsLoading(false),
      onError: () => setIsLoading(false)
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
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
      <Head title="User Management" />
      
      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="gap-2">
            <div className="h-10 w-10 rounded-full bg-red-100/80 flex items-center justify-center mx-auto dark:bg-red-900/20">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <DialogTitle className="text-center">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to delete user <span className="font-medium">{userToDelete?.name}</span>?
              <p className="mt-2 text-sm text-muted-foreground">This action cannot be undone.</p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={cancelDelete}
              disabled={isLoading}
              className="border-primary/20 hover:bg-primary/10 hover:text-primary transition-colors mr-2"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              disabled={isLoading}
              className="gap-1"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className="flex flex-col gap-6 p-6">
        {/* Header Section */}
        <section className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">User Management</h1>
            <p className="text-muted-foreground max-w-xl">Manage user accounts, permissions, and roles across your platform</p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="default" size="sm" className="gap-1 shadow-md transition-all hover:shadow-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary">
              <Link href={route('admin.users.create')}>
                <UserPlus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Add User</span>
              </Link>
            </Button>
          </div>
        </section>

        {/* Content Section */}
        <Card className="border shadow-md bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-center sm:justify-between border-b">
            <CardTitle className="flex items-center gap-3">
              <div className="flex items-center justify-center h-9 w-9 rounded-xl shadow-md">
                <AppLogoIcon className="h-7 w-7 text-primary" />
              </div>
              <span className="font-semibold">User Accounts</span>
            </CardTitle>
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <div className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/70">
                  {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </div>
                {searchTerm && (
                  <button 
                    className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground/70 hover:text-muted-foreground"
                    onClick={() => {
                      setSearchTerm('');
                      setDebouncedSearch('');
                    }}
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <Input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-8 pr-8 border-primary/20 focus:border-primary/30 focus-visible:ring-primary/20 shadow-sm transition-all"
                  aria-label="Search users"
                />
              </div>
              <div className="w-full sm:w-auto">
                <Select value={selectedRole} onValueChange={handleRoleFilter}>
                  <SelectTrigger className="w-full sm:w-[160px] border-primary/20 focus:border-primary/30 focus-visible:ring-primary/20 shadow-sm transition-all">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="focus:bg-primary/10">All Roles</SelectItem>
                    {Array.isArray(roles) && roles.length > 0 ? roles.map((role: string | { name?: string }) => {
                      const roleName = typeof role === 'string' ? role : role?.name || '';
                      const roleValue = (typeof role === 'string' ? role : role?.name || '') || 'unknown';
                      
                      if (roleValue === '') return null;
                      
                      return (
                        <SelectItem key={roleValue} value={roleValue} className="focus:bg-primary/10">
                          {roleName.charAt(0).toUpperCase() + roleName.slice(1)}
                        </SelectItem>
                      );
                    }) : null}
                  </SelectContent>
                </Select>
              </div>
              {(searchTerm || selectedRole !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="gap-1 border-primary/20 hover:bg-primary/10 hover:text-primary transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  <span className="sm:inline">Clear All</span>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="rounded-md">
              <div className="h-[calc(100vh-350px)] min-h-[400px] overflow-auto scrollbar-thin scrollbar-thumb-muted-foreground/10 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/20">
                <Table>
                  <TableHeader className="bg-muted/30 backdrop-blur-sm sticky top-0 z-10">
                    <TableRow className="border-b-primary/10 hover:bg-transparent">
                      <TableHead className="w-[60px]">Avatar</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="w-[100px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.data?.length > 0 ? (
                      users.data.map((user) => (
                        <TableRow key={user.id} className="group hover:bg-muted/30 cursor-default transition-colors border-b-primary/5">
                          <TableCell>
                            <Avatar className="h-10 w-10 border-2 border-primary/10 bg-primary-900/10 text-primary-foreground shadow-sm transition-all group-hover:border-primary/20 group-hover:shadow-md">
                              {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="rounded-full object-cover" />
                              ) : (
                                <AvatarFallback className="text-sm font-semibold  text-gray-600">
                                  {getInitials(user.name)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                          </TableCell>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell className="text-muted-foreground">{user.email}</TableCell>
                          <TableCell>
                            {user.roles && user.roles.length > 0 ? (
                              user.roles.map((role: string | { id?: number; name?: string }) => {
                                const roleName = typeof role === 'string' ? role : role?.name || '';
                                const roleId = typeof role === 'string' ? role : role?.id || roleName;
                                
                                return (
                                  <Badge 
                                    key={roleId} 
                                    variant="outline" 
                                    className={`${getRoleBadgeColor(roleName)} mr-1 shadow-sm font-medium`}
                                  >
                                    {roleName.charAt(0).toUpperCase() + roleName.slice(1)}
                                  </Badge>
                                );
                              })
                            ) : (
                              <Badge variant="outline" className="bg-gray-500/10 text-gray-600 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800">
                                No Role
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {user.created_at && (
                              <div className="flex flex-col">
                                <span>{format(new Date(user.created_at), 'PP')}</span>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(user.created_at), 'p')}
                                </span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-primary/70 hover:text-primary hover:bg-primary/10 transition-colors"
                                      onClick={() => router.get(route('admin.users.show', user.id))}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-primary text-primary-foreground border-primary/20">
                                    <p>View Details</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-blue-500/70 hover:text-blue-500 hover:bg-blue-500/10 transition-colors"
                                      onClick={() => router.get(route('admin.users.edit', user.id))}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-blue-500 text-white border-blue-500/20">
                                    <p>Edit User</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                      onClick={() => handleDeleteClick(user)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-red-500 text-white border-red-500/20">
                                    <p>Delete User</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-60 text-center">
                          {isLoading ? (
                            <div className="flex flex-col justify-center items-center space-y-3 text-muted-foreground">
                              <div className="h-12 w-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin"></div>
                              <span>Loading users...</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-10 space-y-4">
                              <div className="h-16 w-16 rounded-full bg-muted/30 flex items-center justify-center">
                                <Search className="h-8 w-8 text-muted-foreground/50" />
                              </div>
                              <p className="text-lg font-medium">No users found</p>
                              <p className="text-sm text-muted-foreground max-w-md">
                                We couldn't find any users matching your search criteria.
                              </p>
                              {(searchTerm || selectedRole !== 'all') && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={clearFilters}
                                  className="mt-2 border-primary/20 hover:bg-primary/10 hover:text-primary"
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Clear filters and try again
                                </Button>
                              )}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            {/* Pagination */}
            {users?.last_page > 1 && (
              <div className="flex items-center justify-between px-4 py-4 border-t border-primary/5">
                <div className="text-sm text-muted-foreground">
                  Showing <span className="font-medium text-foreground">{users?.from}</span> to{" "}
                  <span className="font-medium text-foreground">{users?.to}</span> of{" "}
                  <span className="font-medium text-foreground">{users?.total}</span> users
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(users?.current_page - 1)}
                    disabled={users?.current_page === 1 || isLoading}
                    className="border-primary/20 hover:bg-primary/10 hover:text-primary"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center">
                    {Array.from({ length: users?.last_page || 1 }, (_, i) => i + 1).map((page) => {
                      // Show first, last, current, and pages around current
                      if (
                        page === 1 ||
                        page === users?.last_page ||
                        (page >= users?.current_page - 1 && page <= users?.current_page + 1)
                      ) {
                        return (
                          <Button
                            key={page}
                            variant={page === users?.current_page ? "default" : "outline"}
                            size="sm"
                            className={`mx-0.5 h-8 w-8 ${
                              page === users?.current_page 
                                ? "bg-primary hover:bg-primary/90" 
                                : "border-primary/20 hover:bg-primary/10 hover:text-primary"
                            }`}
                            onClick={() => goToPage(page)}
                            disabled={isLoading}
                          >
                            {page}
                          </Button>
                        );
                      } else if (
                        page === users?.current_page - 2 ||
                        page === users?.current_page + 2
                      ) {
                        return (
                          <Button
                            key={page}
                            variant="outline"
                            size="sm"
                            className="mx-0.5 h-8 w-8 cursor-default border-0 hover:bg-transparent"
                            disabled
                          >
                            ...
                          </Button>
                        );
                      }
                      return null;
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(users?.current_page + 1)}
                    disabled={users?.current_page === users?.last_page || isLoading}
                    className="border-primary/20 hover:bg-primary/10 hover:text-primary"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
