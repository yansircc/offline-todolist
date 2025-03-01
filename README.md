# Offline Todo List

A hierarchical todo list application with stages, tasks, and subtasks that works offline. Built with Next.js, React, TypeScript, Zustand, and Tailwind CSS.

## Features

- **Hierarchical Structure**: Organize your tasks into stages, tasks, and subtasks
- **Offline Support**: All data is stored in localStorage, so it works offline
- **Admin Mode**: Edit the todo list structure using Markdown
- **Progress Tracking**: See completion percentage for each stage
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+

### Installation

1. Clone the repository
2. Install dependencies:

```bash
bun install
```

3. Start the development server:

```bash
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Regular Mode

In regular mode, you can:

- View the todo list structure
- Mark tasks and subtasks as completed
- Expand/collapse stages and tasks

### Admin Mode

To access admin mode, add `?user=admin` to the URL: [http://localhost:3000/?user=admin](http://localhost:3000/?user=admin)

In admin mode, you can:

- Edit the todo list structure using Markdown
- Use the following syntax:
  - `# Heading 1` - Stage
  - `## Heading 2` - Task
  - `### Heading 3` - Subtask
  - Regular text - Description for the item above

Example:

```markdown
# Getting Started
This is a description for the Getting Started stage.

## Setup Environment
Make sure you have all the necessary tools installed.

### Install Node.js
Download and install the latest version of Node.js.
```

## Building for Production

To create a production build:

```bash
bun build
```

To start the production server:

```bash
bun start
```

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [React](https://reactjs.org/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Bun](https://bun.sh/) - JavaScript runtime and package manager
