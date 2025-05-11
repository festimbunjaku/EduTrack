import { render, screen } from '@testing-library/react';
import AdminDashboard from './AdminDashboard';
import { InertiaApp } from '@inertiajs/inertia-react';
import { createInertiaApp } from '@inertiajs/react';

// Mock the Inertia and route functions
jest.mock('@inertiajs/react', () => ({
  usePage: () => ({
    props: {
      auth: {
        user: {
          id: 1,
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
        },
      },
    },
  }),
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  createInertiaApp: jest.fn(),
  Head: ({ title }: { title: string }) => <title>{title}</title>,
}));

global.route = jest.fn((name, params) => {
  if (name === 'admin.users.index') return '/admin/users';
  if (name === 'admin.users.create') return '/admin/users/create';
  if (name === 'admin.courses.index') return '/admin/courses';
  if (name === 'admin.courses.create') return '/admin/courses/create';
  if (name === 'admin.logs') return '/admin/logs';
  return `/${name}`;
});

describe('AdminDashboard', () => {
  const defaultProps = {
    userStats: {
      total: 100,
      students: 80,
      teachers: 15,
      admins: 5,
      activeThisMonth: 20,
      growthRate: 5.2,
    },
    courseStats: {
      total: 30,
      active: 20,
      completed: 10,
      averageEnrollment: 15,
      completionRate: 75,
    },
    systemStats: {
      homeworkCompletionRate: 82,
      averageTeacherResponseTime: 1.5,
      systemHealth: 95,
      activeUsers: 60,
    },
    recentActivity: [
      {
        id: 'user_1',
        type: 'user',
        description: 'New user registered: John Doe',
        created_at: '2023-03-30T12:00:00Z',
        user: {
          id: 2,
          name: 'John Doe',
          role: 'student',
        },
      },
      {
        id: 'course_1',
        type: 'course',
        description: 'New course created: Web Development',
        created_at: '2023-03-29T15:30:00Z',
        user: {
          id: 3,
          name: 'Jane Smith',
          role: 'teacher',
        },
      },
    ],
  };

  it('renders the admin dashboard', () => {
    render(<AdminDashboard {...defaultProps} />);
    
    // Check if the title is rendered
    expect(document.title).toBe('Admin Dashboard');
    
    // Check if welcome message is rendered
    expect(screen.getByText(/Welcome, Administrator/)).toBeInTheDocument();
    
    // Check if user stats are rendered
    expect(screen.getByText('100')).toBeInTheDocument(); // Total Users
    expect(screen.getByText('30')).toBeInTheDocument(); // Total Courses
    
    // Check if system health is rendered
    expect(screen.getByText('95%')).toBeInTheDocument();
    
    // Check if there are tabs
    expect(screen.getByRole('tab', { name: /Overview/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Users/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Courses/i })).toBeInTheDocument();
    
    // Check if recent activity is rendered
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText('New user registered: John Doe')).toBeInTheDocument();
  });

  it('renders user stats correctly', () => {
    render(<AdminDashboard {...defaultProps} />);
    
    // Check if user stats are displayed
    expect(screen.getByText('100')).toBeInTheDocument(); // Total Users
    expect(screen.getByText('80')).toBeInTheDocument(); // Students
    expect(screen.getByText('15')).toBeInTheDocument(); // Teachers
    expect(screen.getByText('5')).toBeInTheDocument(); // Admins
  });

  it('renders course stats correctly', () => {
    render(<AdminDashboard {...defaultProps} />);
    
    // Check if course stats are displayed
    expect(screen.getByText('30')).toBeInTheDocument(); // Total Courses
    expect(screen.getByText('20')).toBeInTheDocument(); // Active Courses
    expect(screen.getByText('10')).toBeInTheDocument(); // Completed Courses
    expect(screen.getByText('75%')).toBeInTheDocument(); // Completion Rate
  });

  it('renders system stats correctly', () => {
    render(<AdminDashboard {...defaultProps} />);
    
    // Check if system stats are displayed
    expect(screen.getByText('95%')).toBeInTheDocument(); // System Health
    expect(screen.getByText('82%')).toBeInTheDocument(); // Homework Completion
    expect(screen.getByText('1.5 days')).toBeInTheDocument(); // Teacher Response Time
  });
}); 