# API Reference: The Reef E-Learning Platform

This document describes the APIs and integrations available in The Reef.  
It includes endpoints powered by Firebase Functions and Firestore as well as any third-party integrations.

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Lesson & Quiz Management](#lesson--quiz-management)
4. [User Progress](#user-progress)
5. [Endpoints](#endpoints)
6. [Error Handling](#error-handling)
7. [Third-Party Integrations](#third-party-integrations)

---

## 1. Overview

- The Reef uses Firebase Functions for backend logic.
- Firestore is used for storing/retrieving lesson data, user progress, and quiz results.
- Authentication is handled via Firebase Auth.

---

## 2. Authentication

- **Sign Up / Log In:**  
  Via Firebase Authentication SDK (email/password, Google).
- **Endpoint:**  
  All authenticated routes require a valid Firebase JWT in the request headers.

---

## 3. Lesson & Quiz Management

- Lessons and quizzes are stored in Firestore, retrieved via client SDK or serverless endpoints.
- Typical workflows:
    - Get list of lessons
    - Retrieve single lesson by ID
    - Submit quiz answers

---

## 4. User Progress

- Progress is tracked per user, saved in Firestore under user collections.
- Endpoints exist for updating and retrieving this information.

---

## 5. Endpoints

> **Note:** Endpoints may be deployed under `https://us-central1-<firebase-project-id>.cloudfunctions.net/`

### `GET /lessons`

- **Description:** Retrieve all lessons.
- **Auth:** Required
- **Example:**
    ```http
    GET https://us-central1-your-project.cloudfunctions.net/getLessons
    Headers: Authorization: Bearer <JWT>
    ```

### `GET /lessons/:id`

- **Description:** Retrieve a specific lesson by ID.
- **Auth:** Required
- **Example:**
    ```http
    GET https://us-central1-your-project.cloudfunctions.net/getLessonById?id=abc123
    ```

### `POST /quiz/submit`

- **Description:** Submit quiz answers for evaluation.
- **Payload:**
    ```json
    {
      "userId": "<uid>",
      "lessonId": "<lesson-id>",
      "answers": [{...}]
    }
    ```
- **Response:** Score, feedback, correct answers.

### `GET /user/progress`

- **Description:** Fetch progress for logged-in user.
- **Auth:** Required

### `POST /user/progress/update`

- **Description:** Update progress after completing a lesson/quiz.

---

## 6. Error Handling

- All endpoints return HTTP status codes (200, 400, 401, 500) with JSON error messages if applicable.
- For authentication errors, `401 Unauthorized` is returned.

---

## 7. Third-Party Integrations

- **Google Analytics** (optional): Used for tracking usage patterns.
- **Email (SendGrid, Gmail API):** For notifications or password resets (if implemented).

---

## References

- [Firebase Cloud Functions Docs](https://firebase.google.com/docs/functions)
- [Firestore API Docs](https://firebase.google.com/docs/firestore)
- [Firebase Auth Docs](https://firebase.google.com/docs/auth)

---

*For further support or advanced API usage, contact the maintainer or open a [GitHub Issue](https://github.com/samuelacquatey/the-reef/issues).*
