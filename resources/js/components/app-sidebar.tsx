import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Users, User, GraduationCap, ClipboardList, FileText, Award, Book, Database } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
];

// Admin-specific navigation items
const adminNavItems: NavItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/admin/dashboard',
        icon: Database,
    },
    {
        title: 'Users',
        href: '/admin/users',
        icon: Users,
    },
    {
        title: 'Courses',
        href: '/admin/courses',
        icon: GraduationCap,
    },
    {
        title: 'Enrollments',
        href: '/admin/enrollments',
        icon: ClipboardList,
    },
    {
        title: 'Materials',
        href: '/admin/courses?view=materials',
        icon: Book,
    },
    {
        title: 'Homework',
        href: '/admin/courses?view=homework',
        icon: FileText,
    },
    {
        title: 'Certificates',
        href: '/admin/courses?view=certificates',
        icon: Award,
    },
];

// Teacher-specific navigation items
const teacherNavItems: NavItem[] = [
    {
        title: 'My Students',
        href: '/teacher/students',
        icon: User,
    },
];

// Student-specific navigation items
const studentNavItems: NavItem[] = [
    {
        title: 'My Courses',
        href: '/student/courses',
        icon: BookOpen,
    },
    {
        title: 'My Certificates',
        href: '/student/certificates',
        icon: Award,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props;
    const userRoles = auth.user?.roles || [];
    
    // Determine which nav items to show based on user role
    let navItems = [];
    
    if (userRoles.includes('admin')) {
        // Admin gets admin-specific nav items instead of the general dashboard
        navItems = [...adminNavItems];
    } else if (userRoles.includes('teacher')) {
        navItems = [...mainNavItems, ...teacherNavItems];
    } else if (userRoles.includes('student')) {
        navItems = [...mainNavItems, ...studentNavItems];
    } else {
        // Regular users just get the main nav items
        navItems = [...mainNavItems];
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={userRoles.includes('admin') ? "/admin/dashboard" : "/dashboard"} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
