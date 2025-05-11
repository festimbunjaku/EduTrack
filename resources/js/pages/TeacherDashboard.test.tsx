import { render, screen } from '@testing-library/react';
import TeacherDashboard from './TeacherDashboard';

// Mock the Inertia and route functions
jest.mock('@inertiajs/react', () => ({
  usePage: () => ({
    props: {
      auth: {
        user: {
          id: 1,
          name: 'Teacher User',
          email: 'teacher@example.com',
          role: 'teacher',
        },
      },
    },
  }),
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  Head: ({ title }: { title: string }) => <title>{title}</title>,
}));

global.route = jest.fn((name, params) => {
  if (name === 'teacher.courses.index') return '/teacher/courses';
  if (name === 'teacher.courses.show') return `/teacher/courses/${params}`;
  if (name === 'teacher.courses.create') return '/teacher/courses/create';
  if (name === 'teacher.reviews.index') return '/teacher/reviews';
  if (name === 'teacher.reviews.show') return `/teacher/reviews/${params}`;
  if (name === 'teacher.courses.students') return `/teacher/courses/${params}/students`;
  if (name === 'teacher.courses.homework') return `/teacher/courses/${params}/homework`;
  if (name === 'teacher.reviews.history') return '/teacher/reviews/history';
  return `/${name}`;
});

describe('TeacherDashboard', () => {
  const defaultProps = {
    teacherCourses: [
      {
        id: 1,
        title: 'Web Development Fundamentals',
        description: 'Learn the basics of web development',
        status: 'active',
        student_count: 25,
        completion_rate: 65,
        start_date: '2023-01-15T00:00:00Z',
        end_date: '2023-06-15T00:00:00Z',
      },
      {
        id: 2,
        title: 'Advanced JavaScript',
        description: 'Master JavaScript and modern frameworks',
        status: 'upcoming',
        student_count: 15,
        completion_rate: 0,
        start_date: '2023-07-01T00:00:00Z',
        end_date: '2023-12-15T00:00:00Z',
      },
    ],
    pendingReviews: [
      {
        id: 1,
        title: 'JavaScript Basics Assignment',
        student: {
          id: 10,
          name: 'John Smith',
        },
        course: {
          id: 1,
          title: 'Web Development Fundamentals',
        },
        submitted_at: '2023-03-29T14:30:00Z',
      },
      {
        id: 2,
        title: 'CSS Layouts Project',
        student: {
          id: 11,
          name: 'Jane Doe',
        },
        course: {
          id: 1,
          title: 'Web Development Fundamentals',
        },
        submitted_at: '2023-03-30T09:15:00Z',
      },
    ],
    recentActivity: [
      {
        id: 'enrollment_1',
        type: 'student',
        description: 'Alex Johnson enrolled in Web Development Fundamentals',
        created_at: '2023-03-30T11:20:00Z',
      },
      {
        id: 'submission_1',
        type: 'submission',
        description: 'John Smith submitted homework for JavaScript Basics Assignment',
        created_at: '2023-03-29T14:30:00Z',
      },
    ],
    stats: {
      totalStudents: 40,
      totalCourses: 2,
      completionRate: 65,
      pendingReviews: 2,
    },
  };

  it('renders the teacher dashboard', () => {
    render(<TeacherDashboard {...defaultProps} />);
    
    // Check if the title is rendered
    expect(document.title).toBe('Teacher Dashboard');
    
    // Check if welcome message is rendered
    expect(screen.getByText(/Welcome, Professor/)).toBeInTheDocument();
    
    // Check if stats are rendered
    expect(screen.getByText('40')).toBeInTheDocument(); // Total Students
    expect(screen.getByText('2')).toBeInTheDocument(); // Total Courses
    
    // Check if tabs are rendered
    expect(screen.getByRole('tab', { name: /Overview/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /My Courses/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Pending Reviews/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Activity/i })).toBeInTheDocument();
    
    // Check if courses are rendered
    expect(screen.getByText('Web Development Fundamentals')).toBeInTheDocument();
    expect(screen.getByText('Advanced JavaScript')).toBeInTheDocument();
    
    // Check if pending reviews are rendered
    expect(screen.getByText('JavaScript Basics Assignment')).toBeInTheDocument();
    expect(screen.getByText('CSS Layouts Project')).toBeInTheDocument();
    
    // Check if recent activity is rendered
    expect(screen.getByText('Alex Johnson enrolled in Web Development Fundamentals')).toBeInTheDocument();
  });

  it('renders teacher stats correctly', () => {
    render(<TeacherDashboard {...defaultProps} />);
    
    // Check if stats are displayed
    expect(screen.getByText('40')).toBeInTheDocument(); // Total Students
    expect(screen.getByText('2')).toBeInTheDocument(); // Total Courses
    expect(screen.getByText('65%')).toBeInTheDocument(); // Completion Rate
    expect(screen.getByText('2')).toBeInTheDocument(); // Pending Reviews
  });

  it('renders courses correctly', () => {
    render(<TeacherDashboard {...defaultProps} />);
    
    // Check if course details are displayed
    expect(screen.getByText('Web Development Fundamentals')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument(); // Student count
    expect(screen.getByText('65%')).toBeInTheDocument(); // Completion rate
    expect(screen.getByText('active')).toBeInTheDocument(); // Status
  });

  it('renders pending reviews correctly', () => {
    render(<TeacherDashboard {...defaultProps} />);
    
    // Check if pending review details are displayed
    expect(screen.getByText('JavaScript Basics Assignment')).toBeInTheDocument();
    expect(screen.getByText('John Smith')).toBeInTheDocument(); // Student name
    expect(screen.getByText('Web Development Fundamentals')).toBeInTheDocument(); // Course title
  });
}); 