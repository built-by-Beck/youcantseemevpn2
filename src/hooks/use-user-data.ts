'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import type { PlanName } from '@/types';

interface UserData {
  uid: string;
  email: string;
  membershipTier: PlanName;
  isActive: boolean;
}

export function useUserData() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setUserData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const userRef = doc(firestore, 'users', user.uid);

    const unsubscribe = onSnapshot(
      userRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setUserData(docSnap.data() as UserData);
        } else {
          setUserData(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching user data:', error);
        setUserData(null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return { userData, setUserData, loading };
}
