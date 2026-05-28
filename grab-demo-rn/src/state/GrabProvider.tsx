import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { GrabState } from "../domain/types";
import { GrabStore, createGrabStore } from "./GrabStore";

interface GrabContextValue {
  state: GrabState;
  store: GrabStore;
  toast: string | null;
}

const GrabContext = createContext<GrabContextValue | null>(null);

export function GrabProvider({ children }: { children: React.ReactNode }) {
  const store = useMemo(() => createGrabStore(), []);
  const [state, setState] = useState<GrabState>(store.getState());
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsub = store.subscribe((nextState, message) => {
      setState(nextState);
      if (message) {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setToast(message);
        toastTimer.current = setTimeout(() => setToast(null), 3000);
      }
    });
    return () => {
      unsub();
      store.destroy();
    };
  }, [store]);

  return (
    <GrabContext.Provider value={{ state, store, toast }}>
      {children}
    </GrabContext.Provider>
  );
}

export function useGrab() {
  const ctx = useContext(GrabContext);
  if (!ctx) throw new Error("useGrab must be used inside GrabProvider");
  return ctx;
}
