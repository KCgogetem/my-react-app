import React, { createContext, useContext, useState } from "react";

export type VerifiedAddressContextType = {
  verifiedAddress: string | null;
  setVerifiedAddress: (address: string | null) => void;
};

const VerifiedAddressContext = createContext<VerifiedAddressContextType | undefined>(undefined);

export const VerifiedAddressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [verifiedAddress, setVerifiedAddress] = useState<string | null>(null);
  return (
    <VerifiedAddressContext.Provider value={{ verifiedAddress, setVerifiedAddress }}>
      {children}
    </VerifiedAddressContext.Provider>
  );
};

export function useVerifiedAddress() {
  const ctx = useContext(VerifiedAddressContext);
  if (!ctx) throw new Error("useVerifiedAddress must be used within a VerifiedAddressProvider");
  return ctx;
}
