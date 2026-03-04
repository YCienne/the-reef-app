# Developer Guide: The Reef E-Learning Platform

This guide is intended for developers who want to contribute, maintain, or extend The Reef E-Learning Platform.  
It covers the architecture, project structure, development workflows, and key concepts.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Tech Stack Overview](#tech-stack-overview)
3. [Architecture](#architecture)
4. [Development Workflow](#development-workflow)
5. [Environment Setup](#environment-setup)
6. [Core Components](#core-components)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [Common Tasks](#common-tasks)
10. [Troubleshooting](#troubleshooting)
11. [Resources](#resources)

---

## 1. Project Structure

```
the-reef/
 ├── public/             # Static assets, index.html
 ├── src/
 │   ├── components/     # React components
 │   ├── pages/          # Route-based React pages
 │   ├── services/       # API calls and Firebase functions
 │   ├── utils/          # Utility functions
 │   ├── App.js          # Main app entry
 │   └── index.js        # React root
 ├── functions/          # Firebase Functions (Node.js)
 ├── docs/               # Project documentation
 ├── package.json
 ├── .env                # Environment variables
 └── README.md
```

---

## 2. Tech Stack Overview

- **Frontend:** React, JavaScript, CSS
- **Backend:** Firebase Functions (Node.js)
- **Authentication & Database:** Firebase Auth, Firestore
- **Hosting:** Firebase Hosting
- **Other:** ESLint (linting), Jest/React Testing Library (testing)

---

## 3. Architecture

- **SPA:** Single Page Application, client-side routed via React Router.
- **Cloud Functions:** Backend logic, e.g., user scoring, analytics integrations.
- **Firestore:** Stores user data, lesson content, quiz results.

*See diagrams or API specs in [docs/api.md](api.md) for details.*

---

## 4. Development Workflow

1. Fork and clone the repository.
2. Install dependencies:  
   `npm install`
3. Set up environment variables as in `.env.example`.
4. Start the development server:  
   `npm start`
5. For Firebase Functions:  
   - Install functions deps: `cd functions && npm install`
   - Emulate locally: `firebase emulators:start`

---

## 5. Environment Setup

- Copy `.env.example` to `.env` and add your Firebase config.
- See [README.md](../README.md#getting-started) for details.

---

## 6. Core Components

### Key Files/Folders

- `src/components/`: Reusable UI building blocks.
- `src/pages/`: Lesson, quiz, dashboard, profile, login, etc.
- `src/services/`: API interaction, Firebase utility methods.
- `functions/`: Serverless backend logic (Node.js).

### Adding a Lesson

1. Add lesson data in Firestore.
2. Update lesson listing in `src/pages/LessonLibrary.js`.

---

## 7. Testing

- **Unit tests:**  
  Located in `src/__tests__/`  
  Run: `npm test`

- **Component tests:**  
  Use [React Testing Library](https://testing-library.com/).

- **CI/CD:**  
  Automatic tests may run via [GitHub Actions](../.github/workflows/).

---

## 8. Deployment

- Deploy frontend & functions:  
  ```
  firebase login
  firebase deploy
  ```

- For details, see [README.md](../README.md#deploy).

---

## 9. Common Tasks

- **Add a component:** Create/modify under `src/components/`.
- **Update a Firebase Function:** Edit `functions/index.js`, deploy with `firebase deploy --only functions`.
- **Add a lesson or quiz:** Through Firestore, update lesson management page.

---

## 10. Troubleshooting

- **Build fails:**  
  - Check node version, dependencies, lint errors.
- **Firebase errors:**  
  - Verify `.env` config.
  - Check Firebase project settings.
- **Development server not starting:**  
  - Delete `node_modules`, run `npm install` again.

---

## 11. Resources

- [React Docs](https://react.dev/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Firestore Data Modeling](https://firebase.google.com/docs/firestore/data-model)
- [Repository Issues](https://github.com/samuelacquatey/the-reef/issues)

---

Happy coding!
