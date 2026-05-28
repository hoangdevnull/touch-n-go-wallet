import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { AppState } from "../domain/types";
import { createWalletStore, initialState, WalletStore } from "./walletStore";

type WalletContextValue = {
  state: AppState;
  store: WalletStore;
  toast: string | null;
  clearToast: () => void;
};

const STORAGE_KEY = "touch-n-go-wallet-state";
const STORAGE_VERSION = 2;
const WalletContext = createContext<WalletContextValue | null>(null);

type PersistedWalletState = {
  version: number;
  state: AppState;
};

const serializeState = (state: AppState) =>
  JSON.stringify({
    version: STORAGE_VERSION,
    state,
  } satisfies PersistedWalletState);

const parsePersistedState = (raw: string): AppState | null => {
  const parsed = JSON.parse(raw) as Partial<PersistedWalletState>;
  if (parsed.version === STORAGE_VERSION && parsed.state) return parsed.state;
  return null;
};

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef(createWalletStore());
  const [state, setState] = useState<AppState>(initialState);
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

        AsyncStorage.setItem(STORAGE_KEY, serializeState(initialState)).catch(() => {
          setToast("Unable to reset wallet demo state on this device.");
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
          setToast("Unable to persist wallet changes on this device.");
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

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error("useWallet must be used inside WalletProvider");
  return context;
}
