export type PaymentProofRecord = {
  applicationId: string;
  publicId: string;
  url: string;
  optimizedUrl: string;
  bytes?: number;
  createdAt: string;
};

const STORAGE_KEY = 'payment_proof_v1';

const safeParse = (raw: string | null): Record<string, PaymentProofRecord> => {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as Record<string, PaymentProofRecord>;
  } catch {
    return {};
  }
};

const readAll = (): Record<string, PaymentProofRecord> => safeParse(localStorage.getItem(STORAGE_KEY));

const writeAll = (value: Record<string, PaymentProofRecord>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
};

export const paymentProofStorage = {
  get: (applicationId: string): PaymentProofRecord | undefined => {
    if (!applicationId) return undefined;
    const all = readAll();
    return all[applicationId];
  },

  set: (record: PaymentProofRecord) => {
    if (!record.applicationId) return;
    const all = readAll();
    all[record.applicationId] = record;
    writeAll(all);
  },

  has: (applicationId: string): boolean => Boolean(paymentProofStorage.get(applicationId)),

  remove: (applicationId: string) => {
    const all = readAll();
    delete all[applicationId];
    writeAll(all);
  },
};
