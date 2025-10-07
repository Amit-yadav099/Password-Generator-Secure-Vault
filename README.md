<div>🔐 Secure Vault - Password Manager</div>

A privacy-first, end-to-end encrypted password manager built with Next.js, TypeScript, and MongoDB. Your sensitive data is encrypted client-side before it ever reaches the server.

https://img.shields.io/badge/Secure-Encrypted-brightgreen
https://img.shields.io/badge/TypeScript-Ready-blue
https://img.shields.io/badge/Next.js-14-black

✨ Features

🔒 Security First
 Client-Side Encryption - All data encrypted before sending to server

Zero-Knowledge Architecture - Server only stores encrypted blobs

Stable Encryption Keys - Derived from user credentials (email + password)

Secure Clipboard - Auto-clears copied passwords after 15 seconds

No Secrets in Logs - Comprehensive security practices


🎯 Core Functionality

Strong Password Generator - Customizable length and character sets

Secure Vault Storage - Save passwords with titles, usernames, URLs, and notes

Full CRUD Operations - Create, read, update, and delete vault items

Real-time Search - Instant search across all vault items

Copy to Clipboard - One-click copying with security timers


🎨 User Experience

Dark/Light Mode - System preference detection with manual toggle

Responsive Design - Works perfectly on desktop and mobile

Password Strength Meter - Visual feedback on generated passwords

Loading States - Smooth user experience with proper feedback

Modern UI - Clean, minimal interface using shadcn/ui components

🛠 Tech Stack

Frontend
Next.js 14 - React framework with App Router

TypeScript - Type-safe development

Tailwind CSS - Utility-first styling

shadcn/ui - Modern component library

Lucide React - Beautiful icons

Backend

Next.js API Routes - Full-stack capabilities

MongoDB - Database for user and vault storage

Mongoose - MongoDB object modeling

JWT - Secure authentication tokens

bcryptjs - Password hashing

Security

CryptoJS - Client-side AES-256 encryption

PBKDF2 - Key derivation from user credentials

HTTP Security Headers - Production security measures

🚀 Quick Start
Prerequisites
Node.js 18+

MongoDB (local or Atlas)

npm or yarn

Installation
Clone the repository

bash
git clone <your-repo-url>
cd password-vault
Install dependencies

bash
npm install
Set up environment variables
Create .env.local in the root directory:

env
MONGODB_URI=mongodb://localhost:27017/password-vault
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000
Run the development server

bash
npm run dev
Open your browser
Navigate to http://localhost:3000

📁 Project Structure
text
password-vault/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   └── vault/         # Vault item management
│   ├── auth/              # Authentication pages
│   └── vault/             # Main vault interface
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── PasswordGenerator.tsx
│   ├── VaultItemForm.tsx
│   └── VaultItemCard.tsx
├── lib/                  # Utility libraries
│   ├── encryption.ts     # Client-side encryption
│   ├── mongodb.ts        # Database connection
│   └── clipboard.ts      # Clipboard management
├── models/               # MongoDB models
│   ├── User.ts
│   └── VaultItem.ts
└── public/              # Static assets
🔐 Security Implementation

Encryption Details
We use AES-256-CBC encryption with the following approach:

typescript
// Key derivation from user credentials
const key = CryptoJS.PBKDF2(password, email, {
  keySize: 256 / 32,
  iterations: 100000,
  hasher: CryptoJS.algo.SHA256
});

// Encryption process
const encrypted = CryptoJS.AES.encrypt(data, key, {
  iv: randomIV,
  padding: CryptoJS.pad.Pkcs7,
  mode: CryptoJS.mode.CBC
});

Why this approach?

Stable Keys: Encryption keys derived from user credentials remain consistent across sessions

Client-Side Only: Server never sees plaintext data or encryption keys

Zero-Knowledge: We cannot access or recover your encrypted data without your credentials

Security Features

✅ All sensitive data encrypted before database storage

✅ Passwords hashed with bcrypt (12 rounds)

✅ JWT tokens for secure authentication

✅ Automatic clipboard clearing

✅ HTTPS headers for production

✅ No secrets in client-side bundles

🗄 API Endpoints
Authentication
POST /api/auth/signup - Create new user account

POST /api/auth/signin - User login

Vault Management
GET /api/vault/items - Get user's vault items

POST /api/vault/items - Create new vault item

PUT /api/vault/items/[id] - Update vault item

DELETE /api/vault/items/[id] - Delete vault item

🎮 Usage Guide
1. Account Creation
Sign up with email and password

Your credentials are immediately used to generate encryption keys

No separate master password required

2. Password Generation
Use the built-in generator with customizable options

Adjust length (6-32 characters)

Select character types (uppercase, lowercase, numbers, symbols)

Exclude similar characters for better readability

3. Saving Passwords
Fill in the vault item form with:

Title (required)

Username/Email

Password (generate or enter manually)

Website URL

Notes

Data is encrypted locally before saving

4. Managing Vault
View all items in a clean, searchable list

Use search to filter by title, username, or website

Edit items with inline editing

Delete items with confirmation

Copy credentials with auto-clearing clipboard

🚀 Deployment
Vercel (Recommended)
Push your code to GitHub

Connect repository to Vercel

Add environment variables in Vercel dashboard

Deploy!

Environment Variables for Production
env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=very_long_random_secret_key
NEXTAUTH_URL=https://your-domain.vercel.app
🧪 Testing
Manual Testing Checklist
User registration and login

Password generation with different settings

Creating, reading, updating, deleting vault items

Search functionality

Copy to clipboard with auto-clear

Dark/light mode toggle

Responsive design on mobile

Security Verification
Verify encrypted data in MongoDB

Test logout clears session data

Confirm clipboard auto-clearing

Verify no plaintext passwords in network requests

🤝 Contributing
Fork the repository

Create a feature branch (git checkout -b feature/amazing-feature)

Commit your changes (git commit -m 'Add amazing feature')

Push to the branch (git push origin feature/amazing-feature)

Open a Pull Request

📝 License
This project is licensed under the MIT License - see the LICENSE file for details.

🛡️ Security Notice
This is a pre-internship project demonstrating secure development practices. For production use:

Always use HTTPS in production

Consider additional security audits

Implement rate limiting

Add two-factor authentication

Regular security updates

👨‍💻 Developer
Built as part of a pre-internship assessment focusing on:

Full-stack development with Next.js

TypeScript implementation

Security best practices

Modern UI/UX principles

Database design and integration

🔒 Your Passwords Are Safe With Us - All encryption happens in your browser, ensuring maximum privacy and security.


