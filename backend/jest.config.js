module.exports = {
    testEnvironment: 'node',
    transform: {},  // Disable transformations if not needed
    moduleFileExtensions: ['js', 'json', 'node'],
    testMatch: ['<rootDir>/tests/**/*.test.js'], // Matches test files
    forceExit: true, // force jest to exit after tests complete
};