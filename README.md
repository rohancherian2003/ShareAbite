# ShareAbite
Connecting donors and receivers to reduce food wastage. Join restaurants, individuals, NGOs, and volunteers in making a difference.

## 🚀 How to Run the Project (Step-by-Step)

There are two ways to run the ShareAbite project: using the provided script or running the frontend and backend manually.

### Option 1: Using the Automated Script (Recommended)
1. Open your terminal and navigate to the root directory of the project (`ShareAbite`).
2. Run the provided shell script:
   ```bash
   ./run.sh
   ```
3. The script will start both the backend and frontend servers in the background.
4. Access the application:
   - **Frontend:** http://localhost:5173
   - **Backend:** http://localhost:5001
5. To stop both servers, simply press `Ctrl+C` in the terminal.

### Option 2: Running Manually

**Step 1: Start the Backend**
1. Open a terminal.
2. Navigate to the backend directory:
   ```bash
   cd "mca project/backend"
   ```
3. Install dependencies (if running for the first time):
   ```bash
   npm install
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

**Step 2: Start the Frontend**
1. Open a new terminal window.
2. Navigate to the frontend directory:
   ```bash
   cd "mca project/frontend"
   ```
3. Install dependencies (if running for the first time):
   ```bash
   npm install
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```

## 🗄️ Firebase Database Integration

ShareAbite uses **Firebase Firestore** as its primary NoSQL database.

### How it works:
- **Firebase Admin SDK:** The backend integrates with Firebase using the `firebase-admin` package.
- **Authentication & Initialization:** The connection is authenticated using a secure `serviceAccountKey.json` file located in `mca project/backend/config/`. 
- **Data Operations:** The application uses this connection to securely read, write, and manage data such as user profiles, food donations, and requests directly to Firestore from the backend server.
- **Security:** Since the Firebase Admin SDK bypasses standard client-side security rules, all data validation and access control logic is handled robustly within our Node.js backend controllers before interacting with the database.

> **Note:** To run this project locally, you must ensure you have your own valid `serviceAccountKey.json` placed in the `mca project/backend/config/` directory, as this file contains sensitive credentials and is ignored by version control.
