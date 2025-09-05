/**
 * 安全的 WebCrypto AES-GCM 加密模块
 * 避免对象注入，使用固定选项和白名单验证
 */

import { validateEncryptionParams } from '../validation';

export type EncryptOpts = Readonly<{ 
  alg: 'AES-GCM'; 
  key: CryptoKey; 
  iv: ArrayBuffer; 
  aad?: ArrayBuffer 
}>;

export type DecryptOpts = EncryptOpts;

const text = new TextEncoder();
const bytes = new TextDecoder();

function assertAlg(alg: string): asserts alg is 'AES-GCM' {
  if (alg !== 'AES-GCM') {
    throw new Error('Unsupported algorithm');
  }
}

/**
 * 安全构建加密选项，避免对象注入
 * 仅允许白名单键，且不从外部对象"扩展配置"
 */
export function buildOpts(input: Partial<EncryptOpts> & { alg: string }): EncryptOpts {
  assertAlg(input.alg);
  
  if (!input.key || !input.iv) {
    throw new Error('Missing key/iv');
  }
  
  // 使用空原型对象，阻断 __proto__/constructor 注入
  const safe: Record<string, unknown> = Object.create(null);
  safe['alg'] = 'AES-GCM';
  safe['key'] = input.key;
  safe['iv'] = input.iv;
  
  if (input.aad) {
    safe['aad'] = input.aad;
  }
  
  return safe as EncryptOpts;
}

/**
 * 安全的加密函数
 */
export async function encrypt(plain: string, opts: EncryptOpts): Promise<string> {
  try {
    const data = text.encode(plain);
    const param: AesGcmParams = { 
      name: opts.alg, 
      iv: opts.iv, 
      additionalData: opts.aad 
    };
    
    const ct = await crypto.subtle.encrypt(param, opts.key, data);
    return Buffer.from(ct).toString('base64');
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * 安全的解密函数
 */
export async function decrypt(payloadB64: string, opts: DecryptOpts): Promise<string> {
  try {
    const buf = Buffer.from(payloadB64, 'base64');
    const param: AesGcmParams = { 
      name: opts.alg, 
      iv: opts.iv, 
      additionalData: opts.aad 
    };
    
    const pt = await crypto.subtle.decrypt(param, opts.key, buf);
    return bytes.decode(pt);
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * 生成安全的随机 IV
 */
export function generateSecureIV(): ArrayBuffer {
  const array = new Uint8Array(12); // AES-GCM 推荐 IV 长度
  crypto.getRandomValues(array);
  return array.buffer;
}

/**
 * 生成安全的随机密钥
 */
export async function generateSecureKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256
    },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * 验证并清理加密参数
 */
export function validateAndCleanParams(params: unknown): EncryptOpts {
  return validateEncryptionParams(params);
}

/**
 * 安全的密钥导出
 */
export async function exportKey(key: CryptoKey): Promise<string> {
  try {
    const exported = await crypto.subtle.exportKey('raw', key);
    return Buffer.from(exported).toString('base64');
  } catch (error) {
    throw new Error(`Key export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * 安全的密钥导入
 */
export async function importKey(keyData: string): Promise<CryptoKey> {
  try {
    const keyBuffer = Buffer.from(keyData, 'base64');
    return await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  } catch (error) {
    throw new Error(`Key import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}