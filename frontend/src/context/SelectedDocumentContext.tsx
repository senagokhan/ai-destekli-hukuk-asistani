import { createContext, useContext, useState } from "react";

type SelectedDocumentContextType = {
  documentId: number | null;
  setDocumentId: (id: number | null) => void;
};

const SelectedDocumentContext = createContext<SelectedDocumentContextType | null>(null);

export function SelectedDocumentProvider({ children }: { children: React.ReactNode }) {
  const [documentId, setDocumentId] = useState<number | null>(null);

  return (
    <SelectedDocumentContext.Provider value={{ documentId, setDocumentId }}>
      {children}
    </SelectedDocumentContext.Provider>
  );
}

export function useSelectedDocument() {
  const ctx = useContext(SelectedDocumentContext);
  if (!ctx) throw new Error("useSelectedDocument must be used inside provider");
  return ctx;
}
