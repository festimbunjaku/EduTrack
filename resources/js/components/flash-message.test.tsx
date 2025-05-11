import { render, screen, waitFor } from '@testing-library/react';
import FlashMessage from './flash-message';
import userEvent from '@testing-library/user-event';

describe('FlashMessage', () => {
    it('renders success message correctly', () => {
        render(<FlashMessage message="Operation successful" type="success" />);
        
        expect(screen.getByText('Operation successful')).toBeInTheDocument();
        expect(screen.getByRole('alert')).toHaveClass('bg-green-50');
    });
    
    it('renders error message correctly', () => {
        render(<FlashMessage message="An error occurred" type="error" />);
        
        expect(screen.getByText('An error occurred')).toBeInTheDocument();
        expect(screen.getByRole('alert')).toHaveClass('bg-red-50');
    });
    
    it('renders warning message correctly', () => {
        render(<FlashMessage message="Warning message" type="warning" />);
        
        expect(screen.getByText('Warning message')).toBeInTheDocument();
        expect(screen.getByRole('alert')).toHaveClass('bg-yellow-50');
    });
    
    it('renders info message correctly', () => {
        render(<FlashMessage message="Information message" type="info" />);
        
        expect(screen.getByText('Information message')).toBeInTheDocument();
        expect(screen.getByRole('alert')).toHaveClass('bg-blue-50');
    });
    
    it('does not render when message is null', () => {
        const { container } = render(<FlashMessage message={null} type="success" />);
        
        expect(container.firstChild).toBeNull();
    });
    
    it('does not render when message is empty string', () => {
        const { container } = render(<FlashMessage message="" type="success" />);
        
        expect(container.firstChild).toBeNull();
    });
    
    it('can be dismissed by clicking the close button', async () => {
        const user = userEvent.setup();
        render(<FlashMessage message="Dismissible message" type="success" />);
        
        const closeButton = screen.getByRole('button', { name: /close/i });
        
        await user.click(closeButton);
        
        await waitFor(() => {
            expect(screen.queryByText('Dismissible message')).not.toBeInTheDocument();
        });
    });
    
    it('auto-dismisses after the specified timeout', async () => {
        jest.useFakeTimers();
        
        render(<FlashMessage message="Auto-dismiss message" type="success" timeout={1000} />);
        
        expect(screen.getByText('Auto-dismiss message')).toBeInTheDocument();
        
        jest.advanceTimersByTime(1100);
        
        await waitFor(() => {
            expect(screen.queryByText('Auto-dismiss message')).not.toBeInTheDocument();
        });
        
        jest.useRealTimers();
    });
}); 