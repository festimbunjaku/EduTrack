import '@testing-library/jest-dom';
import React from 'react';

// Mock Inertia
window.route = (name: string, params: Record<string, any> = {}, absolute = true) => {
    return `${absolute ? 'http://localhost' : ''}/routes/${name}?${new URLSearchParams(
        params
    ).toString()}`;
};

// Mock global fetch
global.fetch = jest.fn().mockImplementation(() => {
    return Promise.resolve({
        json: () => Promise.resolve({}),
        ok: true,
    });
});

// Mock Inertia functions
jest.mock('@inertiajs/react', () => ({
    usePage: jest.fn().mockImplementation(() => ({
        props: {
            auth: {
                user: {
                    id: 1,
                    name: 'Test User',
                    email: 'test@example.com',
                },
            },
            flash: {
                message: null,
                error: null,
            },
            errors: {},
        },
    })),
    Link: ({ children, ...props }: any) => React.createElement('a', props, children),
    router: {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
        visit: jest.fn(),
        reload: jest.fn(),
    },
    Head: ({ children }: any) => React.createElement(React.Fragment, null, children),
})); 