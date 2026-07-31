import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    function signup(email, password, name) {
        return createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Update profile with name
                return updateProfile(userCredential.user, {
                    displayName: name
                }).then(() => {
                    return userCredential;
                });
            });
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    function logout() {
        return signOut(auth);
    }

    const fetchAndSetRole = async (uid) => {
        try {
            setLoading(true);
            const apiUrl = process.env.REACT_APP_API_URL;
            const res = await axios.get(`${apiUrl}/api/users/profile/${uid}`);
            setUserRole(res.data.role || 'student');
        } catch (error) {
            console.error("Error fetching user role from API:", error);
            // If 404, the document is likely still being created by Signup.js
            // In that case, we don't overwrite the role with 'student' blindly.
            if (error.response && error.response.status === 404) {
                console.log("[DEBUG] Profile not found yet (likely during signup). Waiting for Signup component to set role.");
            } else {
                setUserRole('student');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                await fetchAndSetRole(user.uid);
            } else {
                setUserRole(null);
                setLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userRole,
        isAdmin: userRole === 'admin',
        loading,
        signup,
        login,
        logout,
        setUserRole
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
