import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, appId } from '../config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);

    const showNotification = (msg, type = 'info') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 4000);
    };

    useEffect(() => {
        let profileUnsub;
        const authUnsub = onAuthStateChanged(auth, async (u) => {
            setUser(u);
            if (profileUnsub) profileUnsub();

            if (u) {
                try {
                    // Modular SDK syntax for doc ref
                    const userRef = doc(db, 'artifacts', appId, 'users', u.uid);

                    profileUnsub = onSnapshot(userRef, async (docSnap) => {
                        if (docSnap.exists()) {
                            setUserData(docSnap.data());
                        } else {
                            console.log("Profile missing. Attempting auto-repair...");
                            const email = u.email || '';
                            let recoveredData = null;

                            // Auto-Repair Logic (Ported from legacy)
                            if (email.includes('admincmcf')) {
                                recoveredData = {
                                    username: 'admincmcf', role: 'admin', fullName: 'Administrador',
                                    membershipStatus: 'active', balance: 0, cedula: 'ADMIN-01', phone: '000-0000000', email: email,
                                    joinedAt: serverTimestamp()
                                };
                            } else if (email.includes('prueba')) {
                                recoveredData = {
                                    username: 'prueba', role: 'user', fullName: 'Usuario Prueba',
                                    membershipStatus: 'active', balance: 0, cedula: 'TEST-01', phone: '000-0000000', email: email,
                                    membershipExpiry: Timestamp.fromDate(new Date(Date.now() + 86400000 * 30)),
                                    joinedAt: serverTimestamp()
                                };
                            }

                            if (recoveredData) {
                                await setDoc(userRef, recoveredData);
                                showNotification("PERFIL RECUPERADO", "success");
                            } else {
                                // Fallback for regular users
                                setUserData({
                                    username: 'error', role: 'user', fullName: 'Usuario Sin Perfil',
                                    membershipStatus: 'inactive', balance: 0, cedula: 'ERROR',
                                    email: email, isError: true
                                });
                            }
                        }
                    }, (error) => {
                        console.error("Profile sync error:", error);
                        setUserData({ fullName: 'Error de Conexión', role: 'user', isError: true });
                    });
                } catch (e) {
                    console.error(e);
                }
            } else {
                setUserData(null);
            }
            setLoading(false);
        });

        return () => {
            authUnsub();
            if (profileUnsub) profileUnsub();
        };
    }, []);

    const logout = async () => {
        await signOut(auth);
        setUser(null);
        setUserData(null);
    };

    const value = {
        user,
        userData,
        loading,
        logout,
        notification,
        showNotification
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
            {/* Global Notification Component could go here or in Layout */}
        </AuthContext.Provider>
    );
};
