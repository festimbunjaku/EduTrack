import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Todo from './Todo';

// Mock the router and route functions
jest.mock('@inertiajs/react', () => ({
    router: {
        post: jest.fn(),
        delete: jest.fn(),
    },
}));

// Mock the global route function
global.route = jest.fn((name, params) => `/${name}/${params}`);

describe('Todo Component', () => {
    const defaultProps = {
        id: 1,
        title: 'Test Todo',
        description: 'This is a test todo description',
        completed: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the todo item with correct title and description', () => {
        render(<Todo {...defaultProps} />);
        
        expect(screen.getByText('Test Todo')).toBeInTheDocument();
        expect(screen.getByText('This is a test todo description')).toBeInTheDocument();
    });

    it('renders a completed todo with strike-through style', () => {
        render(<Todo {...defaultProps} completed={true} />);
        
        const title = screen.getByText('Test Todo');
        expect(title).toHaveClass('line-through');
    });

    it('renders a todo without description when description is null', () => {
        render(<Todo {...defaultProps} description={null} />);
        
        expect(screen.getByText('Test Todo')).toBeInTheDocument();
        expect(screen.queryByText('This is a test todo description')).not.toBeInTheDocument();
    });

    it('calls toggle function when checkbox is clicked', () => {
        const { router } = require('@inertiajs/react');
        render(<Todo {...defaultProps} />);
        
        const checkbox = screen.getByRole('button', { name: /Mark as complete/i });
        fireEvent.click(checkbox);
        
        expect(router.post).toHaveBeenCalledWith('/todos.toggle/1');
    });

    it('shows a different checkbox icon when todo is completed', () => {
        render(<Todo {...defaultProps} completed={true} />);
        
        expect(screen.getByRole('button', { name: /Mark as incomplete/i })).toBeInTheDocument();
    });

    it('calls delete function with confirmation when delete button is clicked', () => {
        const { router } = require('@inertiajs/react');
        window.confirm = jest.fn(() => true);
        
        render(<Todo {...defaultProps} />);
        
        const deleteButton = screen.getByRole('button', { name: /Delete todo/i });
        fireEvent.click(deleteButton);
        
        expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this todo?');
        expect(router.delete).toHaveBeenCalledWith('/todos.destroy/1');
    });

    it('does not call delete function when confirmation is cancelled', () => {
        const { router } = require('@inertiajs/react');
        window.confirm = jest.fn(() => false);
        
        render(<Todo {...defaultProps} />);
        
        const deleteButton = screen.getByRole('button', { name: /Delete todo/i });
        fireEvent.click(deleteButton);
        
        expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this todo?');
        expect(router.delete).not.toHaveBeenCalled();
    });

    it('has a link to edit the todo', () => {
        render(<Todo {...defaultProps} />);
        
        const editLink = screen.getByRole('link', { name: /Edit todo/i });
        expect(editLink).toHaveAttribute('href', '/todos.edit/1');
    });
}); 