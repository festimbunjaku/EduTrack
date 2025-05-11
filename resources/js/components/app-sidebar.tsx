import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Users, User, GraduationCap, ClipboardList, FileText, Award, Book, Database, Settings, ChevronRight, PieChart, UserPlus, Layers, Calendar, Search } from 'lucide-react';
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
        title: 'Dashboard',
        href: route('admin.dashboard'),
        icon: PieChart,
    },
    {
        title: 'Users',
        href: route('admin.users.index'),
        icon: Users,
        children: [
            {
                title: 'All Users',
                href: route('admin.users.index'),
                icon: ChevronRight,
            },
            {
                title: 'Add User',
                href: route('admin.users.create'),
                icon: UserPlus,
            },
            {
                title: 'Roles & Permissions',
                href: route('admin.users.index') + '?tab=roles',
                icon: ChevronRight,
            }
        ]
    },
    {
        title: 'Courses',
        href: route('admin.courses.index'),
        icon: GraduationCap,
        children: [
            {
                title: 'All Courses',
                href: route('admin.courses.index'),
                icon: ChevronRight,
            },
            {
                title: 'Create Course',
                href: route('admin.courses.create'),
                icon: ChevronRight,
            },
        ]
    },
    {
        title: 'Enrollments',
        href: route('admin.enrollments.index'),
        icon: ClipboardList,
        children: [
            {
                title: 'Enrollment Requests',
                href: route('admin.enrollment-requests.index'),
                icon: ChevronRight,
            },
            {
                title: 'Request History',
                href: route('admin.enrollment-requests.history'),
                icon: ChevronRight,
            },
            {
                title: 'Active Enrollments',
                href: route('admin.enrollments.index'),
                icon: ChevronRight,
            },
            {
                title: 'Enrollment History',
                href: route('admin.enrollments.history'),
                icon: ChevronRight,
            },
        ]
    },
    {
        title: 'Course Materials',
        href: route('admin.courses.index') + '?view=materials',
        icon: Book,
    },
    {
        title: 'Homework',
        href: route('admin.courses.index') + '?view=homework',
        icon: FileText,
    },
    {
        title: 'Certificates',
        href: route('admin.courses.index') + '?view=certificates',
        icon: Award,
    },
    {
        title: 'Calendar',
        href: route('admin.dashboard') + '?view=calendar',
        icon: Calendar,
    },
    {
        title: 'System Settings',
        href: route('admin.dashboard') + '?view=settings',
        icon: Settings,
    },
];

// Teacher-specific navigation items
const teacherNavItems: NavItem[] = [
    {
        title: 'My Dashboard',
        href: route('teacher.dashboard'),
        icon: LayoutGrid,
    },
    {
        title: 'My Courses',
        href: route('teacher.courses.index'),
        icon: GraduationCap,
        children: [
            {
                title: 'Active Courses',
                href: route('teacher.courses.index') + '?filter=active',
                icon: ChevronRight,
            },
            {
                title: 'Upcoming Courses',
                href: route('teacher.courses.index') + '?filter=upcoming',
                icon: ChevronRight,
            },
            {
                title: 'Completed Courses',
                href: route('teacher.courses.index') + '?filter=completed',
                icon: ChevronRight,
            }
        ]
    },
    {
        title: 'Homework',
        href: route('teacher.courses.index') + '?view=homework',
        icon: FileText,
        children: [
            {
                title: 'Pending Review',
                href: route('teacher.courses.index') + '?view=homework&filter=pending',
                icon: ChevronRight,
            },
            {
                title: 'Manage Assignments',
                href: route('teacher.courses.index') + '?view=homework&filter=all',
                icon: ChevronRight,
            }
        ]
    },
    {
        title: 'Course Materials',
        href: route('teacher.courses.index') + '?view=materials',
        icon: Book,
    },
    {
        title: 'Certificates',
        href: route('teacher.courses.index') + '?view=certificates',
        icon: Award,
    },
    {
        title: 'Calendar',
        href: route('teacher.dashboard') + '?view=calendar',
        icon: Calendar,
    },
];

// Student-specific navigation items
const studentNavItems: NavItem[] = [
    {
        title: 'My Dashboard',
        href: route('student.dashboard'),
        icon: LayoutGrid,
    },
    {
        title: 'Discover Courses',
        href: route('student.courses.discover'),
        icon: Search,
    },
    {
        title: 'My Courses',
        href: route('student.courses.index'),
        icon: BookOpen,
        children: [
            {
                title: 'My Enrolled Courses',
                href: route('student.courses.index'),
                icon: ChevronRight,
            },
            {
                title: 'Discover Courses',
                href: route('student.courses.discover'),
                icon: ChevronRight,
            }
        ]
    },
    {
        title: 'My Homework',
        href: route('student.homework.index'),
        icon: FileText,
        children: [
            {
                title: 'Pending Assignments',
                href: route('student.homework.index'),
                icon: ChevronRight,
            },
            {
                title: 'Completed Assignments',
                href: route('student.homework.index', { filter: 'completed' }),
                icon: ChevronRight,
            }
        ]
    },
    {
        title: 'Course Materials',
        href: route('student.materials.index'),
        icon: Book,
    },
    {
        title: 'My Certificates',
        href: route('student.certificates.index'),
        icon: Award,
    }
];

const footerNavItems: NavItem[] = [
    {
        title: 'Documentation',
        href: '/docs',
        icon: BookOpen,
    },
    {
        title: 'Support',
        href: '/support',
        icon: Layers,
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
        navItems = [...teacherNavItems];
    } else if (userRoles.includes('student')) {
        navItems = [...studentNavItems];
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
                            <Link href={userRoles.includes('admin') ? route('admin.dashboard') : route('dashboard')} prefetch>
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
