"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider, githubProvider } from "../lib/firebase";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Save user data to Firestore on first login
  const saveUserToFirestore = async (userResult) => {
    if (!userResult) return;
    const userRef = doc(db, "users", userResult.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: userResult.uid,
        email: userResult.email,
        displayName: userResult.displayName,
        photoURL: userResult.photoURL,
        createdAt: serverTimestamp(),
      });
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await saveUserToFirestore(result.user);
      return result.user;
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    }
  };

  const loginWithGithub = async () => {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      await saveUserToFirestore(result.user);
      return result.user;
    } catch (error) {
      console.error("GitHub login error:", error);
      throw error;
    }
  };

  const signupWithEmail = async (email, password, displayName) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      // Optional: Add displayName immediately to the result.user if needed, but we save it to Firestore
      const userToSave = { ...result.user, displayName: displayName || result.user.displayName };
      await saveUserToFirestore(userToSave);
      return result.user;
    } catch (error) {
      console.error("Email signup error:", error);
      throw error;
    }
  };

  const loginWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      console.error("Email login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loginWithGoogle, loginWithGithub, signupWithEmail, loginWithEmail, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
