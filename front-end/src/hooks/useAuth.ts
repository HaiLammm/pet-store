import { useAuthStore } from "@/store/cart";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function useAuth() {
  const {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    setLoading,
    updateUser,
  } = useAuthStore();
  const router = useRouter();

  const requireAuth = useCallback(() => {
    if (!isAuthenticated) {
      router.push("/sign-in");
    }
  }, [isAuthenticated, router]);

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    setLoading,
    updateUser,
    requireAuth,
  };
}
