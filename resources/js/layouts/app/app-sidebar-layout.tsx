import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import FlashMessage from '@/components/flash-message';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';
import { LayoutDashboard, BookOpen, Search, Users, Home, Calendar, UserCheck, GraduationCap, FileText, Award, CheckSquare, ClipboardCheck } from 'lucide-react';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    // Create an array of sidebar links (adjust as needed)
    const sidebarLinks = [
        { href: route('admin.dashboard'), label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" />, roles: ['admin'] },
        { href: route('teacher.dashboard'), label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" />, roles: ['teacher'] },
        { href: route('dashboard'), label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" />, roles: ['student'] },
        { href: route('admin.courses.index'), label: 'Courses', icon: <BookOpen className="h-5 w-5" />, roles: ['admin'] },
        { href: route('teacher.courses.index'), label: 'My Courses', icon: <BookOpen className="h-5 w-5" />, roles: ['teacher'] },
        { href: route('student.courses.index'), label: 'My Courses', icon: <BookOpen className="h-5 w-5" />, roles: ['student'] },
        { href: route('student.courses.discover'), label: 'Course Catalog', icon: <Search className="h-5 w-5" />, roles: ['student'] },
        { href: route('admin.users.index'), label: 'Users', icon: <Users className="h-5 w-5" />, roles: ['admin'] },
        { href: route('admin.rooms.index'), label: 'Rooms', icon: <Home className="h-5 w-5" />, roles: ['admin'] },
        { href: route('admin.rooms.all-schedules'), label: 'Room Availability', icon: <Calendar className="h-5 w-5" />, roles: ['admin'] },
        { href: route('admin.enrollments.index'), label: 'Enrollments', icon: <UserCheck className="h-5 w-5" />, roles: ['admin'] },
        { href: route('teacher.students.index'), label: 'Students', icon: <GraduationCap className="h-5 w-5" />, roles: ['teacher'] },
        { href: route('admin.all.homework.index'), label: 'All Homework', icon: <FileText className="h-5 w-5" />, roles: ['admin'] },
        { href: route('admin.all.materials.index'), label: 'All Materials', icon: <FileText className="h-5 w-5" />, roles: ['admin'] },
        { href: route('admin.all.certificates.index'), label: 'All Certificates', icon: <Award className="h-5 w-5" />, roles: ['admin'] },
        { href: route('todos.index'), label: 'My Tasks', icon: <CheckSquare className="h-5 w-5" />, roles: ['admin', 'teacher', 'student'] },
        { href: route('teacher.homework.pending'), label: 'Pending Reviews', icon: <ClipboardCheck className="h-5 w-5" />, roles: ['teacher'] },
        { href: route('student.certificates.index'), label: 'My Certificates', icon: <Award className="h-5 w-5" />, roles: ['student'] },
    ];

    return (
        <AppShell variant="sidebar">
            <FlashMessage />
            <AppSidebar />
            <AppContent variant="sidebar">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}
