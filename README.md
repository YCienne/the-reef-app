# The Reef E-Learning Platform

**The Reef** is a modern, interactive e-learning platform focused on coral reef education. It provides engaging content, quizzes, and resources to make marine science learning accessible and enjoyable for all users.

---

## 🌐 Demo

[Live Site](https://doit-89cb3.web.app)  


---

## 🚀 Features

- Interactive lessons and quizzes 
- User authentication and progress tracking
- Responsive, mobile-friendly design
- Powered by React, Firebase Hosting, and Firebase Functions
- Accessible and easy to use

---

## 📦 Tech Stack

- **Frontend:** React, JavaScript,
- **Backend:** Firebase Functions
- **Hosting:** Firebase Hosting
- **Auth & DB:** Firebase Authentication & Firestore

---

## 🛠️ Getting Started

### Prerequisites

- Node.js & npm
- Firebase CLI installed globally (`npm install -g firebase-tools`)

### Setup Instructions

1. **Clone the repository**

   ```bash
   git clone https://github.com/samuelacquatey/the-reef.git
   cd the-reef
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure Firebase**

   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
   - Copy your Firebase config and set up a `.env` file at the root:
     ```
     REACT_APP_FIREBASE_API_KEY=your-api-key
     REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
     REACT_APP_FIREBASE_PROJECT_ID=your-project-id
     REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
     REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
     REACT_APP_FIREBASE_APP_ID=your-app-id
     ```

4. **Run locally**

   ```bash
   npm start
   ```

5. **Deploy**

   ```bash
   firebase login
   firebase init
   firebase deploy
   ```

---

## 🤝 Contributing

We welcome contributions!  
See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📜 License

Distributed under the [MIT License](LICENSE).

---

## 📞 Contact

Created and maintained by [CRIA EdTech Team, 2026] (https://github.com/samuelacquatey).  
For questions or support, open an issue on GitHub.

---

## 📑 Documentation

- [User Guide](docs/user-guide.md)
- [Developer Guide](docs/dev-guide.md)
- [API Reference](docs/api.md)
- [Roadmap](docs/roadmap.md)
- [Changelog](CHANGELOG.md)

---
