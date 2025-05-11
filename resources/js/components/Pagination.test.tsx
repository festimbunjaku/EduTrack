import { render, screen } from '@testing-library/react';
import Pagination from './Pagination';
import userEvent from '@testing-library/user-event';

const mockOnPageChange = jest.fn();

// Mock for Inertia Link component
jest.mock('@inertiajs/react', () => ({
    Link: ({ children, ...props }: any) => (
        <a data-testid="inertia-link" {...props}>
            {children}
        </a>
    ),
}));

describe('Pagination', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    it('renders nothing if only one page', () => {
        const { container } = render(
            <Pagination currentPage={1} totalPages={1} onPageChange={mockOnPageChange} />
        );
        
        expect(container.firstChild).toBeNull();
    });
    
    it('renders correctly with multiple pages', () => {
        render(
            <Pagination currentPage={2} totalPages={5} onPageChange={mockOnPageChange} />
        );
        
        // Should show page numbers
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText('4')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
        
        // Should show prev/next buttons
        expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
        expect(screen.getByLabelText('Next page')).toBeInTheDocument();
    });
    
    it('highlights current page', () => {
        render(
            <Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />
        );
        
        const currentPageButton = screen.getByText('3').closest('button');
        expect(currentPageButton).toHaveClass('bg-primary');
    });
    
    it('calls onPageChange when a page is clicked', async () => {
        const user = userEvent.setup();
        
        render(
            <Pagination currentPage={2} totalPages={5} onPageChange={mockOnPageChange} />
        );
        
        const page4Button = screen.getByText('4').closest('button');
        await user.click(page4Button!);
        
        expect(mockOnPageChange).toHaveBeenCalledWith(4);
    });
    
    it('calls onPageChange when prev button is clicked', async () => {
        const user = userEvent.setup();
        
        render(
            <Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />
        );
        
        const prevButton = screen.getByLabelText('Previous page');
        await user.click(prevButton);
        
        expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });
    
    it('calls onPageChange when next button is clicked', async () => {
        const user = userEvent.setup();
        
        render(
            <Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />
        );
        
        const nextButton = screen.getByLabelText('Next page');
        await user.click(nextButton);
        
        expect(mockOnPageChange).toHaveBeenCalledWith(4);
    });
    
    it('disables prev button on first page', () => {
        render(
            <Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />
        );
        
        const prevButton = screen.getByLabelText('Previous page');
        expect(prevButton).toBeDisabled();
    });
    
    it('disables next button on last page', () => {
        render(
            <Pagination currentPage={5} totalPages={5} onPageChange={mockOnPageChange} />
        );
        
        const nextButton = screen.getByLabelText('Next page');
        expect(nextButton).toBeDisabled();
    });
    
    it('truncates pages with ellipsis when many pages', () => {
        render(
            <Pagination currentPage={5} totalPages={10} onPageChange={mockOnPageChange} />
        );
        
        // Should show ellipsis
        expect(screen.getByText('...')).toBeInTheDocument();
        
        // Should show first, last, and some adjacent pages
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument();
        expect(screen.getByText('4')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('6')).toBeInTheDocument();
    });
}); 