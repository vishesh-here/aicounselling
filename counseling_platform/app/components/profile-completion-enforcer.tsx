'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ProfileCompletion from './profile-completion';

interface UserProfile {
  whatsappNumber: string;
  address: string;
  college: string;
  specialization: string;
  city: string;
  state: string;
  preferredLanguages: string[];
  experience: string;
  motivation: string;
}

export default function ProfileCompletionEnforcer({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    checkProfileStatus();
  }, [session, status, router]);

  const checkProfileStatus = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const userData: UserProfile = await response.json();
        
        // Check if all required profile fields are filled
        const isComplete = !!(
          userData.whatsappNumber &&
          userData.address &&
          userData.college &&
          userData.specialization &&
          userData.city &&
          userData.state &&
          userData.preferredLanguages &&
          userData.preferredLanguages.length > 0 &&
          userData.experience &&
          userData.motivation
        );
        
        setProfileComplete(isComplete);
      } else {
        setProfileComplete(false);
      }
    } catch (error) {
      console.error('Error checking profile status:', error);
      setProfileComplete(false);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking session and profile
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show profile completion if profile is incomplete
  if (profileComplete === false) {
    return <ProfileCompletion />;
  }

  // Show the actual app content if profile is complete
  if (profileComplete === true) {
    return <>{children}</>;
  }

  // Fallback loading state
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Checking profile...</p>
      </div>
    </div>
  );
} 