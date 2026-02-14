/** Jest config for TypeScript using ts-jest */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  transform: { '^.+\\.ts$': ['ts-jest', {
    tsconfig: 'tsconfig.spec.json',
    diagnostics: false
  }] },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.ts$',
  moduleFileExtensions: ['ts', 'js', 'json'],
  setupFiles: ['<rootDir>/src/jest.setup.ts'],
  moduleNameMapper: {
    '^@angular/core$': '<rootDir>/src/__mocks__/@angular/core.ts',
    '^@angular/common/http$': '<rootDir>/src/__mocks__/@angular/common/http.ts',
    '^@angular/router$': '<rootDir>/src/__mocks__/@angular/router.ts'
  }
};
