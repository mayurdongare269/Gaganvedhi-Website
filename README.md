# 🌌 Gaganvedhi Astronomy Club Website

Welcome to the official repository for the **Gaganvedhi Astronomy Club Website**, built to bring the cosmic experience closer to students of KITCOEK, Kolhapur. This platform serves as a digital hub for stargazers, space enthusiasts, and aspiring astronomers.

---

## 🚀 Project Overview

Gaganvedhi is an astronomy club that connects students with the vast universe through events, discussions, blogs, and more. This website enables the club to:

- Showcase upcoming events and past highlights
- Share cosmic news and astronomy blogs
- Collect membership applications
- Handle event proposals
- Provide an interactive space for enthusiasts
- Manage everything securely with admin controls

---

## 🧰 Tech Stack

| Category       | Technology Used             |
|----------------|-----------------------------|
| Frontend       | React.js, Tailwind CSS      |
| Backend        | Firebase Functions          |
| Authentication | Firebase Auth               |
| Database       | Firebase Firestore          |
| Hosting        | Netlify                     |
| UI Enhancements| Framer Motion, Heroicons    |
| Version Control| Git, GitHub                 |

---

## 🌟 Features

### 👨‍🚀 For Users:
- Dynamic homepage with cosmic UI
- Membership form submission
- Contact/Query form
- Event proposal form
- Blogs and news on astronomy
- Quiz and trivia zone (optional module)
- Responsive design (mobile + desktop)

### 🛠 For Admins:
- Admin dashboard with login
- View and manage membership, queries, and event forms
- Approve/reject applications
- Add/edit/delete events, blogs, and gallery content
- Assign/revoke admin roles
- Secure routes and access management

---

## 🔒 Firestore Rules (Sample Snippet)

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Allow only authenticated users
    match /{document=**} {
      allow read, write: if request.auth != null;
    }

    // Membership applications
    match /membershipApplications/{docId} {
      allow create: if request.auth != null;
      allow read: if resource.data.userId == request.auth.uid;
      allow update, delete: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Admin-only collections
    match /admin/{docId} {
      allow read, write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
