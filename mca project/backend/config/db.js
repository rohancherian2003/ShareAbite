const admin = require("firebase-admin");

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (error) {
    console.error("Error parsing FIREBASE_SERVICE_ACCOUNT env var:", error);
  }
} else {
  try {
    serviceAccount = require("./serviceAccountKey.json");
  } catch (error) {
    console.error("serviceAccountKey.json not found and FIREBASE_SERVICE_ACCOUNT not set.");
  }
}

if (!admin.apps.length && serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

module.exports = db;
