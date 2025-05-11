module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/resources/js/$1',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
            tsconfig: 'tsconfig.json',
            isolatedModules: true,
            useESM: true,
        }],
    },
    testMatch: ['**/resources/js/**/*.test.(ts|tsx)'],
    setupFilesAfterEnv: ['<rootDir>/resources/js/setup-tests.ts'],
    collectCoverageFrom: [
        'resources/js/**/*.{ts,tsx}',
        '!resources/js/bootstrap.ts',
        '!resources/js/app.tsx',
        '!**/node_modules/**',
        '!**/vendor/**',
    ],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },
} 