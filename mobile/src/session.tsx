import React, { createContext, useContext } from 'react';

export type SessionContextType = {
  usuarioId: string | null;
  token: string | null;
  setSession: (id: string | null, token?: string | null) => Promise<void>;
};

export const SessionContext = createContext<SessionContextType>({ usuarioId: null, token: null, setSession: async () => {} });
export function useSession() {
  return useContext(SessionContext);
}