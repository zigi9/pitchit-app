import { collection, doc, setDoc, getDocs, getDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export const saveSessionToFirestore = async (uid, sessionData) => {
  if (!db) return;
  try {
    const sessionRef = doc(collection(db, `users/${uid}/sessions`), sessionData.id);
    await setDoc(sessionRef, sessionData);
  } catch (error) {
    console.error("Error saving session to Firestore", error);
  }
};

export const getUserSessions = async (uid) => {
  if (!db) return [];
  try {
    const q = query(collection(db, `users/${uid}/sessions`), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error("Error getting sessions from Firestore", error);
    return [];
  }
};

export const getUserProfile = async (uid) => {
  if (!db) return null;
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Error getting user profile", error);
    return null;
  }
};

export const updateUserProfile = async (uid, data) => {
  if (!db) return;
  try {
    const docRef = doc(db, 'users', uid);
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    console.error("Error updating user profile", error);
  }
};
