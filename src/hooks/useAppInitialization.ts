import { useEffect, useState } from "react";
import { initializeApplication } from "@/services/app/app-initializer";

export function useAppInitialization() {
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        await initializeApplication();
      } catch (error) {
        console.error("Application initialization failed:", error);
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    isInitializing,
  };
}