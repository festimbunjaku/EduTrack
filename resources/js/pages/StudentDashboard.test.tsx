import { render, screen } from '@testing-library/react';
import StudentDashboard from './StudentDashboard';

// Mock the Inertia and route functions
jest.mock('@inertiajs/react', () => ({
  usePage: () => ({
    props: {
      auth: {
        user: {
          id: 1,
          name: 'Student User',
          email: 'student@example.com',
          role: 'student',
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
  if (name === 'student.courses.index') return '/student/courses';
  if (name === 'student.courses.show') return `/student/courses/${params}`;
  if (name === 'student.homework.index') return '/student/homework';
  if (name === 'student.homework.show') return `/student/homework/${params}`;
  if (name === 'student.homework.submit') return `/student/homework/${params}/submit`;
  if (name === 'student.courses.browse') return '/student/courses/browse';
  if (name === 'student.profile') return '/student/profile';
  return `/${name}`;
});

describe('StudentDashboard', () => {
  const defaultProps = {
    enrolledCourses: [
      {
        id: 1,
        title: 'Web Development Fundamentals',
        description: 'Learn the basics of web development',
        status: 'active',
        progress: 65,
        instructor: {
          name: 'Dr. Smith',
        },
        start_date: '2023-01-15T00:00:00Z',
        end_date: '2023-06-15T00:00:00Z',
      },
      {
        id: 2,
        title: 'Mathematics 101',
        description: 'Introduction to college mathematics',
        status: 'active',
        progress: 30,
        instructor: {
          name: 'Dr. Johnson',
        },
        start_date: '2023-01-15T00:00:00Z',
        end_date: '2023-06-15T00:00:00Z',
      },
    ],
    pendingHomework: [
      {
        id: 1,
        title: 'JavaScript Basics Assignment',
        course: {
          id: 1,
          title: 'Web Development Fundamentals',
        },
        due_date: '2023-04-15T23:59:59Z',
        status: 'pending',
      },
      {
        id: 2,
        title: 'Introduction to Functions',
        course: {
          id: 2,
          title: 'Mathematics 101',
        },
        due_date: '2023-04-10T23:59:59Z',
        status: 'pending',
      },
    ],
    recentActivity: [
      {
        id: 'enrollment_1',
        type: 'enrollment',
        description: 'You enrolled in Web Development Fundamentals',
        created_at: '2023-01-15T10:30:00Z',
      },
      {
        id: 'grade_1',
        type: 'grade',
        description: 'You received a grade on HTML Basics assignment: 95%',
        created_at: '2023-03-25T14:45:00Z',
      },
    ],
    stats: {
      enrolledCourses: 2,
      completedCourses: 0,
      averageGrade: 92,
      pendingAssignments: 2,
    },
  };

  it('renders the student dashboard', () => {
    render(<StudentDashboard {...defaultProps} />);
    
    // Check if the title is rendered
    expect(document.title).toBe('Student Dashboard');
    
    // Check if welcome message is rendered
    expect(screen.getByText(/Welcome, Student/)).toBeInTheDocument();
    
    // Check if stats are rendered
    expect(screen.getByText('2')).toBeInTheDocument(); // Enrolled Courses
    expect(screen.getByText('92%')).toBeInTheDocument(); // Average Grade
    
    // Check if tabs are rendered
    expect(screen.getByRole('tab', { name: /Overview/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /My Courses/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Homework/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Activity/i })).toBeInTheDocument();
    
    // Check if courses are rendered
    expect(screen.getByText('Web Development Fundamentals')).toBeInTheDocument();
    expect(screen.getByText('Mathematics 101')).toBeInTheDocument();
    
    // Check if pending homework is rendered
    expect(screen.getByText('JavaScript Basics Assignment')).toBeInTheDocument();
    expect(screen.getByText('Introduction to Functions')).toBeInTheDocument();
    
    // Check if recent activity is rendered
    expect(screen.getByText('You enrolled in Web Development Fundamentals')).toBeInTheDocument();
    expect(screen.getByText('You received a grade on HTML Basics assignment: 95%')).toBeInTheDocument();
  });

  it('renders student stats correctly', () => {
    render(<StudentDashboard {...defaultProps} />);
    
    // Check if stats are displayed
    expect(screen.getByText('2')).toBeInTheDocument(); // Enrolled Courses
    expect(screen.getByText('0')).toBeInTheDocument(); // Completed Courses
    expect(screen.getByText('92%')).toBeInTheDocument(); // Average Grade
    expect(screen.getByText('2')).toBeInTheDocument(); // Pending Assignments
  });

  it('renders enrolled courses correctly', () => {
    render(<StudentDashboard {...defaultProps} />);
    
    // Check if course details are displayed
    expect(screen.getByText('Web Development Fundamentals')).toBeInTheDocument();
    expect(screen.getByText('Mathematics 101')).toBeInTheDocument();
    expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
    expect(screen.getByText('Dr. Johnson')).toBeInTheDocument();
    expect(screen.getByText('65%')).toBeInTheDocument(); // Progress
    expect(screen.getByText('30%')).toBeInTheDocument(); // Progress
  });

  it('renders pending homework correctly', () => {
    render(<StudentDashboard {...defaultProps} />);
    
    // Check if homework details are displayed
    expect(screen.getByText('JavaScript Basics Assignment')).toBeInTheDocument();
    expect(screen.getByText('Introduction to Functions')).toBeInTheDocument();
    expect(screen.getByText('Web Development Fundamentals')).toBeInTheDocument();
    expect(screen.getByText('Mathematics 101')).toBeInTheDocument();
  });

  it('renders empty state when no courses are enrolled', () => {
    const propsWithNoEnrolledCourses = {
      ...defaultProps,
      enrolledCourses: [],
    };
    
    render(<StudentDashboard {...propsWithNoEnrolledCourses} />);
    
    // Check if empty state message is displayed
    expect(screen.getByText(/You haven't enrolled in any courses yet/i)).toBeInTheDocument();
  });

  it('renders empty state when no homework is pending', () => {
    const propsWithNoPendingHomework = {
      ...defaultProps,
      pendingHomework: [],
    };
    
    render(<StudentDashboard {...propsWithNoPendingHomework} />);
    
    // Check if empty state message is displayed
    expect(screen.getByText(/You don't have any pending homework/i)).toBeInTheDocument();
  });
}); 