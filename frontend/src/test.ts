/**
 * Karma Test Bootstrap File
 *
 * @fileoverview
 * Entry point for Karma test runner that initializes the Angular testing environment
 * and dynamically loads all test specifications (.spec.ts files) from the project.
 *
 * This file is required by karma.conf.js and must be present for E2E and unit testing
 * to function properly. It:
 * 1. Imports Zone.js testing utilities for Angular change detection
 * 2. Initializes the Angular testing module (BrowserDynamicTestingModule)
 * 3. Dynamically discovers and loads all .spec.ts test files
 * 4. Executes tests through Karma runner
 *
 * @remarks
 * **Zone.js Purpose**:
 * - Provides asynchronous operation patching required by Angular's change detection
 * - Tracks pending async operations (HTTP, timers, promises)
 * - Signals to Angular when to run change detection
 *
 * **Testing Environment Setup**:
 * - BrowserDynamicTestingModule: Provides dynamic compilation and component testing
 * - platformBrowserDynamicTesting(): Platform factory for browser-based testing
 *
 * **Test Discovery**:
 * - Uses webpack require.context() to find all files matching pattern: *.spec.ts
 * - Recursively searches from root directory (./), including subdirectories
 * - Automatically loads and registers discovered tests with Karma
 *
 * **Configuration**:
 * - Configured in karma.conf.js to use this file as entry point
 * - Works with Karma framework and Jasmine test runner
 * - Supports all Angular 14 testing patterns and utilities
 *
 * @see karma.conf.js - Karma test runner configuration
 * @see karma.conf.js (files array) - Where this file is registered
 * @see angular.json - Build configuration reference
 *
 * @internal This file is part of Angular's testing infrastructure and should not be imported
 * or used in application code.
 *
 * @version 1.0
 * @since Angular 14.2.0
 */

import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

/**
 * Webpack require.context type definition
 *
 * Provides type-safe access to webpack's require.context functionality for module discovery
 * in the test environment.
 *
 * @property {function} context - Webpack context function that discovers modules
 * @property {function} context.keys - Returns array of module IDs matching the pattern
 * @property {function} context.<T> - Dynamic require function for loading specific modules
 */
declare const require: {
  context(path: string, deep?: boolean, filter?: RegExp): {
    <T>(id: string): T;
    keys(): string[];
  };
};

/**
 * Initialize the Angular testing environment
 *
 * Sets up the testing platform with dynamic compilation support and browser testing utilities.
 * This enables component creation, dependency injection, and async operation tracking in tests.
 */
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);

/**
 * Dynamically discover all test specifications
 *
 * Uses webpack require.context to find all .spec.ts files throughout the project
 * and loads them into the test runner. This allows Karma to execute discovered tests
 * without requiring explicit imports or registration.
 *
 * @remarks
 * - Pattern: /\.spec\.ts$/ - Matches files ending with .spec.ts
 * - Deep: true - Recursively searches all subdirectories
 * - Context: ./ - Starts search from src root directory
 */
const context = require.context('./', true, /\.spec\.ts$/);
// Load the modules discovered by webpack context
context.keys().forEach(context);
