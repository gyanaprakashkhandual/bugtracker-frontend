# Caffetest — Bug Tracker Frontend

Caffetest is an intelligent, AI-powered bug tracking and test management web application. It automatically generates test cases from your Selenium test code, logs bugs on test failure, and provides a complete project management ecosystem — all from a single platform.

Live: [caffetest.vercel.app](https://caffetest.vercel.app)

---

## What Caffetest Does

Caffetest transforms your Selenium test code into structured test cases and bug reports automatically, without any manual input. It combines the intelligence of an AI chatbot with the discipline of a full project management and bug tracking platform.

**How it works:**

1. Install the **Capitus Tracker** extension from the VS Code Marketplace.
2. Connect your project to Caffetest via the extension.
3. Write your Selenium test code inside VS Code as usual.
4. AI automatically reads your test code and generates test cases inside your Caffetest project.
5. When a test runs and **fails**, a bug is automatically created and logged to the project.
6. When a test **passes**, the test case is marked resolved — no manual update needed.

---

## Core Features

| Feature | Description |
|---|---|
| AI Test Case Generation | Generates test cases automatically from your Selenium test code |
| Auto Bug Logging | Creates and logs bugs on test failure in real time |
| Vibe Tracker Chatbot | Conversational AI to manage bugs, tasks, and content via natural language |
| Inbuilt Log System | Structured log viewer integrated directly into the project |
| Sheet System | Built-in spreadsheet-style view for test case and bug management |
| Project Management | Full project lifecycle — creation, sprints, milestones, and tracking |
| User Management | Role-based access, team management, and permissions |
| VS Code Integration | Capitus Tracker extension bridges your IDE and the platform seamlessly |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| UI Library | React |
| State Management | Redux |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Language | JavaScript |

---

## Project Structure

```
bugtracker-frontend/
├── src/
│   └── app/
│       ├── components/        # Reusable UI components
│       ├── pages/             # Next.js app routes
│       ├── store/             # Redux store and slices
│       ├── hooks/             # Custom React hooks
│       └── utils/             # Helper functions
├── public/                    # Static assets
├── next.config.mjs
├── tailwind.config.js
└── package.json
```

---

## Getting Started

**Prerequisites**
- Node.js v18+
- npm or yarn

**Installation**

```bash
git clone https://github.com/gyanaprakashkhandual/bugtracker-frontend.git
cd bugtracker-frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Build for Production**

```bash
npm run build
npm start
```

---

## VS Code Extension

To use the AI test case generation and auto bug logging features:

1. Open VS Code.
2. Search for **Capitus Tracker** in the Extensions Marketplace.
3. Install and configure it with your Caffetest project credentials.
4. Write Selenium tests — Caffetest handles everything from there.

---

## License and Usage

This repository is **proprietary software**. The frontend source code is available for viewing and reference only. The APIs, backend services, and all internal endpoints are strictly confidential and may not be used, accessed, or reproduced under any circumstances. See [LICENSE.md](LICENSE.md) for full terms.

---

## Contact

Repository owner: [@gyanaprakashkhandual](https://github.com/gyanaprakashkhandual)
