import { createContext, useContext, type ReactNode } from 'react';

const AdminUiContext = createContext(false);

export const AdminUiProvider = ({ children }: { children: ReactNode }) => (
  <AdminUiContext.Provider value={true}>{children}</AdminUiContext.Provider>
);

// QueryWrapper and a few member forms also use AdminActionButton. Keep their appearance unchanged.
export const useAdminUi = () => useContext(AdminUiContext);
