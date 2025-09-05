import { z } from 'zod';

export const CipherTextSchema = z.object({
  iv: z.string().min(1),
  tag: z.string().min(1).optional(),
  ct: z.string().min(1)
});

export const EncryptRequestSchema = z.object({
  plain: z.string().min(1),
  aad: z.string().optional()
});

export const DecryptRequestSchema = z.object({
  payload: CipherTextSchema,
  aad: z.string().optional()
});

export const UserInputSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6).max(100)
});

export const MessageSchema = z.object({
  content: z.string().min(1).max(10000),
  type: z.enum(['text', 'image', 'file']).default('text'),
  timestamp: z.number().positive().optional()
});

export const ChatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().min(1)
  })).min(1)
});

// 安全验证函数
export function validateInput<T>(schema: z.ZodSchema<T>, input: unknown): T {
  try {
    return schema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw new Error('Invalid input format');
  }
}

// 清理用户输入
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

// 验证加密参数
export function validateEncryptionParams(params: unknown): {
  alg: 'AES-GCM';
  key: CryptoKey;
  iv: ArrayBuffer;
  aad?: ArrayBuffer;
} {
  if (typeof params !== 'object' || params === null) {
    throw new Error('Invalid encryption parameters');
  }

  const safe = params as Record<string, unknown>;
  
  if (safe.alg !== 'AES-GCM') {
    throw new Error('Unsupported algorithm');
  }
  
  if (!safe.key || !(safe.key instanceof CryptoKey)) {
    throw new Error('Invalid key');
  }
  
  if (!safe.iv || !(safe.iv instanceof ArrayBuffer)) {
    throw new Error('Invalid IV');
  }
  
  return {
    alg: 'AES-GCM',
    key: safe.key,
    iv: safe.iv,
    aad: safe.aad instanceof ArrayBuffer ? safe.aad : undefined
  };
}