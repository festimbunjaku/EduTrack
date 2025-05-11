import { render, screen } from '@testing-library/react';
import AppLogo from './app-logo';

// Mock Inertia Link
jest.mock('@inertiajs/react', () => ({
    Link: ({ children, ...props }: any) => (
        <a data-testid="inertia-link" {...props}>
            {children}
        </a>
    ),
}));

describe('AppLogo', () => {
    it('renders logo with correct link', () => {
        render(<AppLogo />);
        
        const logoLink = screen.getByTestId('inertia-link');
        expect(logoLink).toHaveAttribute('href', '/');
    });
    
    it('renders logo with correct text content', () => {
        render(<AppLogo />);
        
        expect(screen.getByText('EduTrack')).toBeInTheDocument();
    });
    
    it('uses provided className', () => {
        render(<AppLogo className="custom-class" />);
        
        const logoContainer = screen.getByText('EduTrack').closest('div');
        expect(logoContainer).toHaveClass('custom-class');
    });
    
    it('has app logo icon', () => {
        render(<AppLogo />);
        
        // The AppLogoIcon component should be rendered
        const svgElement = document.querySelector('svg');
        expect(svgElement).toBeInTheDocument();
    });
}); 