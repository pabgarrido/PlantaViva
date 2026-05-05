import { Injectable, Logger } from '@nestjs/common';
import {
  BlobServiceClient,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  StorageSharedKeyCredential,
  SASProtocol,
} from '@azure/storage-blob';

export interface SasUrlResult {
  uploadUrl: string;
  blobName: string;
  expiresAt: string;
}

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private blobServiceClient: BlobServiceClient | null = null;
  private sharedKeyCredential: StorageSharedKeyCredential | null = null;
  private accountName: string = '';

  constructor() {
    const connectionString = process.env['AZURE_STORAGE_CONNECTION_STRING'];
    if (connectionString) {
      this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
      this.accountName = connectionString.match(/AccountName=([^;]+)/)?.[1] ?? '';
      const accountKey = connectionString.match(/AccountKey=([^;]+)/)?.[1];
      if (this.accountName && accountKey) {
        this.sharedKeyCredential = new StorageSharedKeyCredential(this.accountName, accountKey);
        this.logger.log(`Storage connected: ${this.accountName}`);
      }
    } else {
      this.logger.warn('No AZURE_STORAGE_CONNECTION_STRING — uploads will fail');
    }
  }

  get storageConfigured(): boolean {
    return !!this.blobServiceClient && !!this.sharedKeyCredential;
  }

  async generateSasUrl(
    projectId: string,
    filename: string,
    fileType: string,
  ): Promise<SasUrlResult> {
    const containerName = 'uploads';
    const blobName = `${projectId}/${Date.now()}-${filename}`;

    if (!this.blobServiceClient || !this.sharedKeyCredential) {
      throw new Error('Storage not configured — set AZURE_STORAGE_CONNECTION_STRING');
    }

    const containerClient = this.blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);

    const expiresOn = new Date(Date.now() + 15 * 60 * 1000);
    const sasToken = generateBlobSASQueryParameters(
      {
        containerName,
        blobName,
        permissions: BlobSASPermissions.parse('cw'),
        expiresOn,
        contentType: this.mimeType(fileType),
      },
      this.sharedKeyCredential,
    ).toString();

    return {
      uploadUrl: `${blobClient.url}?${sasToken}`,
      blobName,
      expiresAt: expiresOn.toISOString(),
    };
  }

  /** Download a blob's content as Buffer */
  async downloadBlob(containerName: string, blobName: string): Promise<Buffer> {
    if (!this.blobServiceClient) throw new Error('Storage not configured');
    const client = this.blobServiceClient.getContainerClient(containerName).getBlobClient(blobName);
    const download = await client.download(0);
    const chunks: Buffer[] = [];
    if (download.readableStreamBody) {
      for await (const chunk of download.readableStreamBody) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
    }
    return Buffer.concat(chunks);
  }

  private mimeType(fileType: string): string {
    const map: Record<string, string> = {
      pdf: 'application/pdf',
      jpg: 'image/jpeg',
      png: 'image/png',
      dwg: 'application/acad',
      dxf: 'application/dxf',
      ifc: 'application/x-step',
      rvt: 'application/octet-stream',
    };
    return map[fileType] ?? 'application/octet-stream';
  }
}
