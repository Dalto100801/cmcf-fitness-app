export const safeDate = (val) => {
    if (!val) return null;
    if (val.toDate && typeof val.toDate === 'function') return val.toDate(); // Firestore Timestamp
    if (val instanceof Date) return val; // JS Date
    if (typeof val === 'string') return new Date(val); // String ISO
    if (val.seconds) return new Date(val.seconds * 1000); // Seconds object
    return null;
};

export const safeStr = (val) => val || '';
