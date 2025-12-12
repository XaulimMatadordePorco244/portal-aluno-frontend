import { put, del, head, type PutBlobResult } from '@vercel/blob';

export interface UploadOptions {
  access?: 'public';
  contentType?: string;
  addRandomSuffix?: boolean;
}

export class BlobService {
  private static instance: BlobService;

  static getInstance(): BlobService {
    if (!BlobService.instance) {
      BlobService.instance = new BlobService();
    }
    return BlobService.instance;
  }

  async uploadDivisa(
    file: File, 
    cargoAbreviacao: string,
    options?: UploadOptions
  ): Promise<PutBlobResult> {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const safeCargoName = cargoAbreviacao.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const extension = file.name.split('.').pop() || 'png';
    const fileName = `divisa_${safeCargoName}_${timestamp}_${randomSuffix}.${extension}`;
    
    const pathname = `divisas/${fileName}`;

    return await put(pathname, file, {
      access: 'public',
      contentType: file.type,
      addRandomSuffix: false,
      ...options,
    });
  }

  async deleteDivisa(pathname: string): Promise<void> {
    await del(`divisas/${pathname}`);
  }

  async getDivisaInfo(pathname: string) {
    return await head(`divisas/${pathname}`);
  }

  async checkDivisaExists(pathname: string): Promise<boolean> {
    try {
      await head(`divisas/${pathname}`);
      return true;
    } catch {
      return false;
    }
  }

  extractPathnameFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      return pathParts[pathParts.length - 1] || null;
    } catch {
      return null;
    }
  }

  validateFile(file: File): { valid: boolean; error?: string } {
    const MAX_SIZE = 5 * 1024 * 1024; 
    const ALLOWED_TYPES = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml'
    ];

    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `Tipo de arquivo não permitido. Permitidos: ${ALLOWED_TYPES.join(', ')}`
      };
    }

    if (file.size > MAX_SIZE) {
      return {
        valid: false,
        error: `Arquivo muito grande. Tamanho máximo: ${MAX_SIZE / 1024 / 1024}MB`
      };
    }

    return { valid: true };
  }
}

export const blobService = BlobService.getInstance();