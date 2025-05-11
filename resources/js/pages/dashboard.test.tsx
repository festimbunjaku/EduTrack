import { render, screen } from '@testing-library/react';
import Dashboard from './dashboard';

// Mock Inertia.js
jest.mock('@inertiajs/react', () => ({
    Link: ({ children, ...props }: any) => (
        <a data-testid="inertia-link" {...props}>
            {children}
        </a>
    ),
    usePage: jest.fn().mockImplementation(() => ({
        props: {
            auth: {
                user: {
                    id: 1,
                    name: 'Test User',
                    email: 'test@example.com',
                },
            },
        },
    })),
    Head: ({ children }: any) => <>{children}</>,
}));

// Mock the route function since it's used in Link components
global.route = jest.fn((name) => `/${name}`);

describe('Dashboard', () => {
    const defaultProps = {
        userRole: 'student',
        enrolledCourses: [],
        teacherCourses: [],
        pendingHomework: [],
        pendingReviews: [],
        recentActivity: [],
        stats: {
            totalUsers: 100,
            totalCourses: 20,
            totalEnrollments: 250,
            completionRate: 75
        }
    };
    
    it('renders dashboard title', () => {
        render(<Dashboard {...defaultProps} />);
        
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
    
    it('renders welcome message with user name', () => {
        render(<Dashboard {...defaultProps} />);
        
        expect(screen.getByText(/Welcome back, Test User/i)).toBeInTheDocument();
    });
    
    it('shows student-specific content for student role', () => {
        render(<Dashboard {...defaultProps} userRole="student" />);
        
        expect(screen.getByText('Enrolled Courses')).toBeInTheDocument();
        expect(screen.getByText('Pending Homework')).toBeInTheDocument();
    });
    
    it('shows teacher-specific content for teacher role', () => {
        render(<Dashboard {...defaultProps} userRole="teacher" />);
        
        expect(screen.getByText('Your Courses')).toBeInTheDocument();
        expect(screen.getByText('Assignments to Review')).toBeInTheDocument();
    });
    
    it('shows admin-specific content for admin role', () => {
        render(<Dashboard {...defaultProps} userRole="admin" />);
        
        expect(screen.getByText('Platform Overview')).toBeInTheDocument();
        expect(screen.getByText('System Status')).toBeInTheDocument();
    });
    
    it('displays enrolled courses for students', () => {
        const enrolledCourses = [
            { 
                id: 1, 
                title: 'Math 101', 
                description: 'Basic mathematics',
                status: 'active',
                completion_percentage: 65,
                start_date: '2023-01-15',
                end_date: '2023-05-15',
                teacher: { name: 'Dr. Smith' } 
            },
            { 
                id: 2, 
                title: 'History 101', 
                description: 'World history',
                status: 'active',
                completion_percentage: 40, 
                start_date: '2023-01-15',
                end_date: '2023-05-15',
                teacher: { name: 'Dr. Jones' } 
            },
        ];
        
        render(<Dashboard {...defaultProps} userRole="student" enrolledCourses={enrolledCourses} />);
        
        expect(screen.getByText('Math 101')).toBeInTheDocument();
        expect(screen.getByText('History 101')).toBeInTheDocument();
        expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
        expect(screen.getByText('Dr. Jones')).toBeInTheDocument();
    });
    
    it('displays teacher courses for teachers', () => {
        const teacherCourses = [
            { 
                id: 1, 
                title: 'Physics 101', 
                description: 'Basic physics',
                status: 'active',
                students_count: 25, 
                start_date: '2023-01-15',
                end_date: '2023-05-15',
                teacher: { name: 'Dr. Smith' } 
            },
            { 
                id: 2, 
                title: 'Chemistry 101', 
                description: 'Basic chemistry',
                status: 'draft',
                students_count: 15, 
                start_date: '2023-01-15',
                end_date: '2023-05-15',
                teacher: { name: 'Dr. Smith' } 
            },
        ];
        
        render(<Dashboard {...defaultProps} userRole="teacher" teacherCourses={teacherCourses} />);
        
        expect(screen.getByText('Physics 101')).toBeInTheDocument();
        expect(screen.getByText('Chemistry 101')).toBeInTheDocument();
        expect(screen.getByText('25 students •')).toBeInTheDocument();
    });
    
    it('displays empty state message when no courses', () => {
        render(<Dashboard {...defaultProps} userRole="student" enrolledCourses={[]} />);
        
        expect(screen.getByText(/You are not enrolled in any courses/i)).toBeInTheDocument();
    });
    
    it('displays pending homework for students', () => {
        const pendingHomework = [
            { 
                id: 1, 
                title: 'Math Assignment', 
                description: 'Problem set',
                status: 'pending',
                due_date: '2023-04-15', 
                course: { id: 1, title: 'Math 101' } 
            },
            { 
                id: 2, 
                title: 'History Essay', 
                description: 'Essay on World War II',
                status: 'pending',
                due_date: '2023-04-20', 
                course: { id: 2, title: 'History 101' } 
            },
        ];
        
        render(<Dashboard {...defaultProps} userRole="student" pendingHomework={pendingHomework} />);
        
        expect(screen.getByText('Math Assignment')).toBeInTheDocument();
        expect(screen.getByText('History Essay')).toBeInTheDocument();
    });
}); 