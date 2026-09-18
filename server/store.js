/** In-memory document store. Swap for Supabase later. */
const documents = new Map();
const TTL_MS = 1000 * 60 * 60;

export function saveDocument(doc) {
  const id = doc.id || crypto.randomUUID();
  const record = { ...doc, id, createdAt: Date.now() };
  documents.set(id, record);
  return record;
}

export function getDocument(id) {
  const record = documents.get(id);
  if (!record) return null;
  if (Date.now() - record.createdAt > TTL_MS) {
    documents.delete(id);
    return null;
  }
  return record;
}

export function listDocuments() {
  return [...documents.values()].map((doc) => ({
    id: doc.id,
    sourceType: doc.sourceType,
    conceptType: doc.conceptType,
    title: doc.title,
    charCount: doc.text.length,
  }));
}
