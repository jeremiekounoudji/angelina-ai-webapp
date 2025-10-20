
'use client'
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import LoadingScreen from "@/components/LoadingScreen";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      // If user is authenticated and has completed setup, go to dashboard
      // Otherwise, go to marketing page
      if (user) {
        router.push("/dashboard");
      } else {
        router.push("/marketing");
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingScreen />;
  }

  return <LoadingScreen />;
}