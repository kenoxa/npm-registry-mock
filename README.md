# @kenoxa/npm-registry-mock

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Features](#features)
- [Available Scripts](#available-scripts)
- [Create a release](#create-a-release)
- [Folder Structure](#folder-structure)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Features

- Mock the NPM Registry for testing

## Available Scripts

### npm start

Runs the app in the development mode.

### npm test

Two sub scripts will came in handy from time to time:

- `npm start test.watch`: re-run tests on change
- `npm start test.coverage`: creates a coverage report at `coverage/lcov-report/index.html`

### npm run format

Formats all sources using prettier.

## Create a release

1. Update changelog
2. `npm run format`
3. `npm test`
4. git commit -a -m "chore: prepare release`
5. [npm version [\<newversion> | major | minor | patch] -m "chore: release"](https://docs.npmjs.com/cli/version)
6. `npm run release`

## Folder Structure

### `src/`

Put all your source code including your test files here. Test files
are matched using the following regexp:

- `src/**/__tests__/*.{js,jsx,ts,tsx}`: matches every file within a `__tests__` directory but not in child directories
- `src/**/*.{spec,test}.{js,jsx,ts,tsx}`: matches `*.test.js` and `*.spec.js` files; some for the other extensions
