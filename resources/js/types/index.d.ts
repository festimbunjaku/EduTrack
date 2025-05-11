import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    roles?: string[];
    permissions?: string[];
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Course {
    id: number;
    title: string;
    description: string;
    feature_1: string;
    feature_2: string;
    feature_3: string;
    price: number;
    start_date: string;
    end_date: string;
    schedule: Record<string, any>;
    teacher_id: number;
    teacher?: User;
    max_enrollment: number;
    status: 'upcoming' | 'active' | 'completed' | 'cancelled';
    location: string;
    image?: string;
    created_at: string;
    updated_at: string;
    enrollments_count?: number;
    student_count?: number;
    completion_rate?: number;
    progress?: number;
    instructor?: {
        name: string;
        id?: number;
    };
    [key: string]: unknown;
}

export interface CourseMaterial {
    id: number;
    course_id: number;
    title: string;
    description: string | null;
    type: 'document' | 'video' | 'link' | 'image' | 'audio' | 'other';
    file_path: string | null;
    file_name: string | null;
    file_size: number | null;
    file_extension: string | null;
    created_at: string;
    updated_at: string;
    course?: Course;
}

export interface Homework {
    id: number;
    course_id: number;
    title: string;
    description: string;
    deadline: string;
    due_date?: string;
    attachment_path: string | null;
    created_at: string;
    updated_at: string;
    course?: Course;
    submissions?: HomeworkSubmission[];
    status?: 'pending' | 'completed' | 'overdue';
    student?: {
        id: number;
        name: string;
    };
}

export interface HomeworkSubmission {
    id: number;
    homework_id: number;
    user_id: number;
    submission_file: string | null;
    comments: string | null;
    status: 'pending' | 'approved' | 'denied';
    teacher_comments: string | null;
    created_at: string;
    updated_at: string;
    user?: User;
    homework?: Homework;
    submitted_at?: string;
}

export interface Certificate {
    id: number;
    course_id: number;
    user_id: number;
    certificate_number: string;
    issued_at: string;
    pdf_path: string | null;
    signature: string | null;
    created_at: string;
    updated_at: string;
    course?: Course;
    user?: User;
}

export interface Enrollment {
    id: number;
    user_id: number;
    course_id: number;
    status: 'pending' | 'approved' | 'denied' | 'waitlisted';
    waitlist_position: number | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    user?: User;
    course?: Course;
}

export interface RecentActivity {
    id: string | number;
    type: 'enrollment' | 'grade' | 'submission' | 'certificate' | 'course' | 'student' | 'user' | string;
    description: string;
    created_at: string;
    course_id?: number;
    user_id?: number;
    homework_id?: number;
}

export interface DashboardStats {
    totalUsers?: number;
    totalCourses?: number;
    totalEnrollments?: number;
    completionRate?: number;
    totalStudents?: number;
    pendingReviews?: number;
    enrolledCourses?: number;
    completedCourses?: number;
    averageGrade?: number;
    pendingAssignments?: number;
}

export interface StudentDashboardProps {
    enrolledCourses: Course[];
    pendingHomework: Homework[];
    recentActivity: RecentActivity[];
    stats: DashboardStats;
}

export interface TeacherDashboardProps {
    teacherCourses: Course[];
    pendingReviews: HomeworkSubmission[];
    recentActivity: RecentActivity[];
    stats: DashboardStats;
}

export interface AdminDashboardProps {
    userStats: {
        totalUsers: number;
        newUsersToday: number;
        activeUsers: number;
        usersByRole: Record<string, number>;
    };
    courseStats: {
        totalCourses: number;
        activeCourses: number;
        upcomingCourses: number;
        completedCourses: number;
    };
    systemStats: {
        totalEnrollments: number;
        completionRate: number;
        averageRating: number;
        certificatesIssued: number;
    };
    recentActivity: RecentActivity[];
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: Auth;
    ziggy: Config & { location: string };
    flash?: {
        success?: string;
        error?: string;
        warning?: string;
    };
};
