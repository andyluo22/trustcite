export type SavedDoc = {
  id: string;
  title: string;
  text: string;
  createdAt: number;
};

const LS_KEY = "trustcite_docs_v1";

export function loadDocs(): SavedDoc[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveDocs(docs: SavedDoc[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(docs));
}