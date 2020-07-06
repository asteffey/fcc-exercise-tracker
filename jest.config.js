const tsPreset = require('ts-jest/jest-preset')
const jestPreset = require('@shelf/jest-mongodb/jest-preset')

module.exports = {
  ...tsPreset,
  ...jestPreset,
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['<rootDir>/lib/', '<rootDir>/node_modules/']
}
