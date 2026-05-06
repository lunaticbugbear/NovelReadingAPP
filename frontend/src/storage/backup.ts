import { z } from 'zod';

const BackupSchema = z.object({
  sources: z.array(z.unknown()),
  novels: z.array(z.unknown()),
  exportedAt: z.number()
});

export type BackupData = z.infer<typeof BackupSchema>;

export function serializeBackup(data: BackupData) {
  return JSON.stringify(data, null, 2);
}

export function parseBackup(json: string) {
  return BackupSchema.parse(JSON.parse(json));
}
