import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createInvestmentStore, initialInvestmentState, InvestmentStore } from "./investmentStore";
import type { InvestmentState } from "./investmentStore";

type InvestmentContextValue = {
  state: InvestmentState;
  store: InvestmentStore;
  toast: string | null;
  clearToast: () => void;
};

const STORAGE_KEY = "touch-n-go-investment-state";
const STORAGE_VERSION = 2;
const InvestmentContext = createContext<InvestmentContextValue | null>(null);

type PersistedInvestmentState = {
  version: number;
  state: InvestmentState;
};

const serializeState = (state: InvestmentState) =>
  JSON.stringify({
    version: STORAGE_VERSION,
    state,
  } satisfies PersistedInvestmentState);

const parsePersistedState = (raw: string): InvestmentState | null => {
  const parsed = JSON.parse(raw) as Partial<PersistedInvestmentState>;
  if (parsed.version === STORAGE_VERSION && parsed.state) return parsed.state;
  return null;
};

export function InvestmentProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef(createInvestmentStore());
  const [state, setState] = useState<InvestmentState>(initialInvestmentState);
  const [toast, setToast] = useState<string | null>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;

        const persistedState = parsePersistedState(raw);
        if (persistedState) {
          storeRef.current.hydrate(persistedState);
          return;
        }

        AsyncStorage.setItem(STORAGE_KEY, serializeState(initialInvestmentState)).catch(() => {
          setToast("Unable to reset investment demo state on this device.");
        });
      })
      .finally(() => {
        hydrated.current = true;
      });
  }, []);

  useEffect(() => {
    return storeRef.current.subscribe((nextState, message) => {
      setState(nextState);
      if (message) setToast(message);
      if (hydrated.current) {
        AsyncStorage.setItem(STORAGE_KEY, serializeState(nextState)).catch(() => {
          setToast("Unable to persist investment changes on this device.");
        });
      }
    });
  }, []);

  const value = useMemo(
    () => ({
      state,
      store: storeRef.current,
      toast,
      clearToast: () => setToast(null),
    }),
    [state, toast],
  );

  return <InvestmentContext.Provider value={value}>{children}</InvestmentContext.Provider>;
}

export function useInvestments() {
  const context = useContext(InvestmentContext);
  if (!context) throw new Error("useInvestments must be used inside InvestmentProvider");
  return context;
}
