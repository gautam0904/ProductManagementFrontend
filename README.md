# E-commerce Frontend

A modern, responsive e-commerce frontend built with React, TypeScript, Vite, and Tailwind CSS.

## 🚀 Features

- ⚡️ Blazing fast development with Vite
- 🎨 Modern UI with Tailwind CSS
- 🧩 Component-based architecture
- 🔄 State management with React Context
- 🛣️ Client-side routing with React Router
- 🔍 Optimized for SEO and performance
- 📱 Fully responsive design
- 🎨 Dark mode support

## 📦 Prerequisites

- Node.js 18+ and npm 9+ or pnpm 8.14.0+
- Git for version control

## 🛠️ Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   # or
   yarn install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Update the environment variables in .env as needed
   ```

## 🚀 Development

To start the development server:

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to see the result.

## 🏗️ Building for Production

To create a production build:

```bash
npm run build
# or
pnpm build
# or
yarn build
```

The build artifacts will be stored in the `dist/` directory.

## 🧪 Running Tests

To run tests:

```bash
npm test
# or
pnpm test
# or
yarn test
```

## 🧹 Linting

To run ESLint:

```bash
npm run lint
# or
pnpm lint
# or
yarn lint
```

## 🎨 Styling

This project uses [Tailwind CSS](https://tailwindcss.com/) for styling. The configuration can be found in `tailwind.config.js`.

### Adding Custom Styles

- Global styles: `src/styles/global.css`
- Component-specific styles: Co-located with components using CSS Modules or Tailwind `@apply`

## 🏗️ Project Structure

```
src/
├── api/              # API client and services
├── assets/           # Static assets (images, fonts, etc.)
├── components/       # Reusable UI components
│   ├── common/      # Common components (buttons, inputs, etc.)
│   └── layout/      # Layout components (header, footer, etc.)
├── hooks/           # Custom React hooks
├── pages/           # Page components
├── routes/          # Application routes
├── styles/          # Global styles and CSS utilities
├── types/           # TypeScript type definitions
└── utils/           # Utility functions and helpers
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Vite](https://vitejs.dev/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
# productManagementFrontend
# productManagementFrontend
