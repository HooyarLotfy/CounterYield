// Must be the FIRST import of every test file. ESM hoists imports, so assigning
// process.env.NODE_ENV in the test body runs too late for config/env.ts.
process.env.NODE_ENV = 'test';
export {};
