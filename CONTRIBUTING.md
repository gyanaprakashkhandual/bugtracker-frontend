# Contributing

## Access

CapTest is a **private, proprietary repository**. It is not open source. Public contributions, forks, and unsolicited pull requests are not accepted and are strictly prohibited.

Only individuals who have been **explicitly authorized** by the repository owner may contribute to this project.

---

## For Authorized Contributors

If you have been granted contributor access, please adhere to the following standards:

### Branching

- Never commit directly to `master`.
- Create a dedicated branch for every change using a clear, descriptive name:
  - `feature/chatbot-context-memory`
  - `fix/redux-auth-slice`
  - `ui/dashboard-layout-update`

### Commits

- Write concise, meaningful commit messages in the imperative form: `Add`, `Fix`, `Update`, `Remove`.
- Keep commits focused — one logical change per commit.
- Do not commit environment files, API keys, or secrets.

### Pull Requests

- Open all pull requests against `master` with a clear title and description.
- Describe what changed, why it changed, and any relevant context.
- Ensure the app builds and runs without errors before requesting review.

### Code Standards

**React and Next.js**
- Use functional components and React hooks only.
- Follow the Next.js App Router conventions for routing and layouts.
- Keep components small, focused, and reusable.

**Redux**
- All global state must be managed through Redux slices.
- Avoid direct state mutations — use Redux Toolkit's `createSlice` pattern.

**Tailwind CSS**
- Use Tailwind utility classes exclusively for styling.
- Avoid inline styles and external CSS files unless absolutely necessary.

**Framer Motion**
- Use Framer Motion only for intentional, meaningful animations.
- Keep animation variants organized in a dedicated file or section.

**General**
- Write readable, self-documenting code with clear variable and function names.
- Remove all `console.log` statements before opening a pull request.
- Do not hardcode API URLs, tokens, or environment-specific values in source files.

---

## Confidentiality

All source code, API endpoints, service configurations, and credentials in this repository are **confidential and proprietary**. Contributors must not share, expose, or reuse any repository asset outside of the authorized development environment.

---

## Contact

For contributor access or questions, contact: [@gyanaprakashkhandual](https://github.com/gyanaprakashkhandual)
