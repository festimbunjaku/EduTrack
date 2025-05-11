import { render, screen } from '@testing-library/react';
import NavUser from './nav-user';
import userEvent from '@testing-library/user-event';

// Mock the Inertia.js functions
jest.mock('@inertiajs/react', () => ({
    Link: ({ children, ...props }: any) => (
        <a data-testid="inertia-link" {...props}>
            {children}
        </a>
    ),
    router: {
        post: jest.fn(),
    },
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
}));

describe('NavUser', () => {
    it('renders user information correctly', () => {
        render(<NavUser />);
        
        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
    
    it('displays user menu when clicked', async () => {
        const user = userEvent.setup();
        render(<NavUser />);
        
        const menuButton = screen.getByRole('button', { name: /user menu/i });
        
        // Initially, menu should be hidden
        expect(screen.queryByText('Settings')).not.toBeInTheDocument();
        
        // Click to open menu
        await user.click(menuButton);
        
        // Menu should be visible
        expect(screen.getByText('Settings')).toBeInTheDocument();
        expect(screen.getByText('Profile')).toBeInTheDocument();
        expect(screen.getByText('Log out')).toBeInTheDocument();
    });
    
    it('closes menu when clicking outside', async () => {
        const user = userEvent.setup();
        render(
            <div>
                <NavUser />
                <div data-testid="outside">Outside</div>
            </div>
        );
        
        // Open the menu
        const menuButton = screen.getByRole('button', { name: /user menu/i });
        await user.click(menuButton);
        
        // Menu should be visible
        expect(screen.getByText('Settings')).toBeInTheDocument();
        
        // Click outside
        await user.click(screen.getByTestId('outside'));
        
        // Menu should be hidden
        expect(screen.queryByText('Settings')).not.toBeInTheDocument();
    });
    
    it('has working navigation links', async () => {
        const user = userEvent.setup();
        render(<NavUser />);
        
        // Open the menu
        const menuButton = screen.getByRole('button', { name: /user menu/i });
        await user.click(menuButton);
        
        // Check for links
        const profileLink = screen.getByText('Profile').closest('a');
        const settingsLink = screen.getByText('Settings').closest('a');
        
        expect(profileLink).toHaveAttribute('href', '/profile');
        expect(settingsLink).toHaveAttribute('href', '/settings');
    });
    
    it('calls logout function when log out is clicked', async () => {
        const user = userEvent.setup();
        const { router } = require('@inertiajs/react');
        
        render(<NavUser />);
        
        // Open the menu
        const menuButton = screen.getByRole('button', { name: /user menu/i });
        await user.click(menuButton);
        
        // Click log out
        const logoutButton = screen.getByText('Log out');
        await user.click(logoutButton);
        
        // Should call router.post for logout
        expect(router.post).toHaveBeenCalledWith('/logout');
    });
}); 