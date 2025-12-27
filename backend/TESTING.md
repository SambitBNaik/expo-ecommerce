# Testing Guide

This document provides instructions for running and maintaining the test suite for the backend application.

## Installation

First, install the test dependencies:

```bash
npm install --save-dev @jest/globals@^29.7.0 jest@^29.7.0 supertest@^7.0.0
```

## Running Tests

### Basic Test Commands

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with verbose output
npm run test:verbose
```

### Running Specific Tests

```bash
# Run tests for a specific file
npm test -- src/__tests__/config/env.test.js

# Run tests matching a pattern
npm test -- --testNamePattern="should load all environment variables"

# Run only tests in a specific directory
npm test -- src/__tests__/config/
```

## Understanding Test Output

### Successful Test Run