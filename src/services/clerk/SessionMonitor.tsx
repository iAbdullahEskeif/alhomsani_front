import { useEffect } from "react";
import { useSession, useClerk } from "@clerk/clerk-react";

export function SessionMonitor() {
  const { isLoaded, isSignedIn } = useSession();
  const { signOut } = useClerk();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      signOut();
    }
  }, [isLoaded, isSignedIn, signOut]);

  return null;
}
