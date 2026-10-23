import React, { createContext, useContext, useState } from 'react';

export type SessionContextType = {
  usuarioId: string | null;
  setSession: (id: string | null) => Promise<void>;
};

export const SessionContext = createContext<SessionContextType>({ usuarioId: null, setSession: async () => {} });
export function useSession() {
  return useContext(SessionContext);
}