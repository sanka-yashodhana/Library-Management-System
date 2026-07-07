# library-management-system
### SWST 32043 - Software Architecture and Concepts | Assignment 02
Faculty of Computing and Technology, University of Kelaniya

---

## Group Members (Group 09)
| Student ID | Full Name | Primary Track |
| :--- | :--- | :--- |
| CT/2021/069 | YASHODHANA A.D.S. | Backend Engineer |
| CT/2021/076 | YALINI V.B. | Frontend Engineer |
| CT/2021/081 | NIRUTHTHIGAN M. | Backend Engineer |
| CT/2021/090 | KALANSOORIYA P.M. | Frontend Engineer |

---

## System Description
The Library Management System (LMS) is a full-stack web application designed to transition traditional, error-prone manual library operations into an automated, highly secure digital workspace. Built following a strict Layered (N-tier) Architecture Pattern, the system manages user lifecycle accounts, book inventories, and circulation metrics across three distinct system roles: Students, Librarians, and Administrators.

The application streamlines day-to-day library counter processes by automatically calculating fine records at a fixed rate of Rs. 20 per day for overdue items, validating double-borrow blocks, maintaining dynamic collection quantities, and presenting customized real-time management data fields.

---

## Technology Used

### Frontend (Presentation Layer)
* React 19 & Vite: Component-based UI compilation library and optimized hot-reloading development server.
* React Router DOM 7: Handles fluid client-side single-page routing workflows and declarative state path guards.
* Lucide React / React Feather: Iconography systems for professional dashboard styling.
* Handwritten CSS (design.css, App.css): Custom design layouts utilizing lightweight styling parameters with zero overhead frameworks.

### Backend (Application & Logic Layers)
* Node.js & Express.js 5: Minimalistic asynchronous server environment managing clean RESTful JSON endpoint interfaces.
* Mongoose 9: Strict Object Data Modeling (ODM) framework providing schematic validations for MongoDB documents.

### Security & Authentication
* JSON Web Tokens (jsonwebtoken): Stateless authorization claims passing role metadata across network middleware wrappers.
* bcrypt: Advanced client-side password encryption utilizing a robust cryptographic salt hashing factor of 10.
* cors: Fine-tuned cross-origin request processing rules blocking untrusted remote environments.

### Database & Version Control
* MongoDB Atlas: Cloud-hosted NoSQL document store capturing collections for Users, Books, Borrowings, and Fines.
* Git & GitHub: Distributed version control monorepo pipelines tracking code lifecycle snapshots.

---

## Installation & Setup

Follow these sequential terminal commands to replicate the production configuration environment locally on your desktop.

### Prerequisite Checklist
* Ensure Node.js LTS engine is installed on your PC.
* Ensure a MongoDB Atlas Cluster instance or local MongoDB instance is active.

### 1. Project Shell Blueprint Download
```bash
git clone [https://github.com/sanka-yashodhana/Library-Management-System.git](https://github.com/sanka-yashodhana/Library-Management-System.git)
cd Library-Management-System

2. Backend Environment Installs & Configurations

Bash
# Navigate to backend process folder and install packages
cd server
npm install

# Create your private environmental configuration key mapping file
touch .env

Open the newly created .env file inside your server directory and supply your secret keys:

Code snippet
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_custom_cryptographic_token_string
CLIENT_URL=http://localhost:5173

3. Frontend App Installs & Routing Setup

Bash
# Return to root then move inside frontend package directory
cd ../client
npm install

###How to Run

Step 1: Populate Local Database (Optional Seeding)
To fill your MongoDB collection structures with mock book inventories and sample role profiles prior to initial launching, execute the automated data seeding wrapper inside the server terminal:

Bash
cd ../server
npm run seed

Step 2: Initialize Server APIs

Bash
# Inside the /server directory, spin up the node engine process via Nodemon
npm run dev

Your backend application will spin live on local gateway address: http://localhost:5000

Step 3: Initialize Frontend Views

Open a secondary terminal process panel and execute your client bundle environment:

Bash
cd client
npm run dev

Your interactive user portals will spin live on local address: http://localhost:5173

###Main Features & Code Ownership Split

Common & Security Modules
User Account Registration & Hashed Login Authentication

          Frontend Owner: Yalini V.B | Backend Owner: Niruthigan M.

Role-Based Access Control Middleware (RBAC Guards & JWT Processing)

          Frontend Owner: Shared | Backend Owner: Niruthigan M.

Automated Rs. 20/Day Late Fine Generation & Calculation Loops

          Frontend Owner: Kalansooriya P.M | Backend Owner: Niruthigan M.


Student Portal Layouts

Life-Cycle History Tracking Dashboards (Active, Returned, & Overdue sheets)

          Frontend Owner: Yalini V.B & Kalansooriya P.M | Backend Owner: Niruthigan M.

Catalogue Inventory Grid Explorer & Case-Insensitive Filtering

          Frontend Owner: Yalini V.B | Backend Owner: Yashodhana A.D.S.

Online Interactive Self-Borrowing Gateways & Multi-Copy Blocks

          Frontend Owner: Yalini V.B | Backend Owner: Yashodhana A.D.S. & Niruthigan M.


Librarian Counter Desk

Full CRUD Operational Forms (Add, Edit, Remove, & Replenish Stock)

         Frontend Owner: Kalansooriya P.M | Backend Owner: Yashodhana A.D.S.

Counter Issue/Return Transaction Management Logs & Student Verification Profiles

         Frontend Owner: Kalansooriya P.M | Backend Owner: Yashodhana A.D.S. & Niruthigan M.


System Administrator Panel

Role Elevation Matrices (Student to Librarian / Admin)

        Frontend Owner: Kalansooriya P.M | Backend Owner: Niruthigan M.

Circulation Summaries, Outstanding Liability Sheets, and Category Data Visualization Charts

        Frontend Owner: Kalansooriya P.M | Backend Owner: Yashodhana A.D.S. & Niruthigan M.



###GitHub Contribution Metrics Summary

The project repository details parallel branch tracking operations demonstrating continuous commit iterations across all participants during the project lifecycles.

Repository Monorepo Structures: Divided seamlessly into separate /client` and /server environments to avoid cross-developer branch merge collisions.
Release Deployments: Production builds are compiled, optimized, and hosted remotely utilizing serverless deployment infrastructure nodes on Vercel.


Application Frontend:  https://library-management-system-3sek.vercel.app

Server Backend API:    https://library-management-system-o5z2.vercel.app


