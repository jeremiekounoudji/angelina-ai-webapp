
'use client'
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import LoadingScreen from "@/components/LoadingScreen";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const redirectedRef = useRef(false);

  useEffect(() => {
    // Only redirect once to prevent infinite loops
    if (!loading && !redirectedRef.current) {
      redirectedRef.current = true;
      
      // If user is authenticated, go to dashboard
      // Otherwise, go to marketing page
      if (user) {
        router.push("/dashboard");
      } else {
        router.push("/marketing");
      }
    }
  }, [user, loading, router]);

  return <LoadingScreen />;
}