import { render, screen } from '@testing-library/react';
import InputError from './input-error';

describe('InputError', () => {
    it('renders error message when provided', () => {
        render(<InputError message="This field is required" />);
        
        expect(screen.getByText('This field is required')).toBeInTheDocument();
    });
    
    it('uses className prop if provided', () => {
        render(<InputError message="Error message" className="custom-class" />);
        
        const errorElement = screen.getByText('Error message');
        expect(errorElement).toHaveClass('custom-class');
    });
    
    it('renders nothing when message is undefined', () => {
        const { container } = render(<InputError message={undefined} />);
        
        expect(container.firstChild).toBeNull();
    });
    
    it('renders nothing when message is empty string', () => {
        const { container } = render(<InputError message="" />);
        
        expect(container.firstChild).toBeNull();
    });
    
    it('renders with default styling', () => {
        render(<InputError message="Error message" />);
        
        const errorElement = screen.getByText('Error message');
        expect(errorElement).toHaveClass('text-sm');
        expect(errorElement).toHaveClass('text-red-600');
    });
}); 