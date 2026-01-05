import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type VerifiedAddressValue =
  | string
  | {
      verifiedAddress: string;
      county?: string;
      lat?: number;
      lng?: number;
      [k: string]: any;
    }
  | null;

export type VerifiedAddressDetails =
  | {
      verifiedAddress: string;
      county?: string;
      lat?: number;
      lng?: number;
      [k: string]: any;
    }
  | null;

export type VerifiedAddressContextType = {
  verifiedAddress: VerifiedAddressDetails;
  // ✅ accept legacy string OR object
  setVerifiedAddress: (address: VerifiedAddressValue) => void;
  clearVerifiedAddress: () => void;
};

const STORAGE_KEY = "cma_verified_address_v1";

function normalizeVerifiedAddress(v: VerifiedAddressValue): VerifiedAddressDetails {
  if (!v) return null;
  if (typeof v === "string") return { verifiedAddress: v };
  if (typeof v === "object" && typeof (v as any).verifiedAddress === "string") return v as any;
  return null;
}

const VerifiedAddressContext = createContext<VerifiedAddressContextType | undefined>(undefined);

export const VerifiedAddressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [raw, setRaw] = useState<VerifiedAddressValue>(null);

  // ✅ normalized value that components consume
  const verifiedAddress = useMemo(() => normalizeVerifiedAddress(raw), [raw]);

  // ✅ load from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored);
      setRaw(parsed);
    } catch {
      // ignore
    }
  }, []);

  // ✅ persist whenever it changes
  useEffect(() => {
    try {
      if (!raw) {
        sessionStorage.removeItem(STORAGE_KEY);
      } else {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(raw));
      }
    } catch {
      // ignore
    }
  }, [raw]);

  const setVerifiedAddress = (address: VerifiedAddressValue) => {
    setRaw(address);
  };

  const clearVerifiedAddress = () => setRaw(null);

  return (
    <VerifiedAddressContext.Provider value={{ verifiedAddress, setVerifiedAddress, clearVerifiedAddress }}>
      {children}
    </VerifiedAddressContext.Provider>
  );
};

export function useVerifiedAddress() {
  const ctx = useContext(VerifiedAddressContext);
  if (!ctx) throw new Error("useVerifiedAddress must be used within a VerifiedAddressProvider");
  return ctx;
}