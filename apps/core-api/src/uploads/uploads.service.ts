import { Injectable } from '@nestjs/common';
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
  private blobServiceClient: BlobServiceClient | null = null;
  private sharedKeyCredential: StorageSharedKeyCredential | null = null;

  constructor() {
    const connectionString = process.env['AZURE_STORAGE_CONNECTION_STRING'];
    if (connectionString) {
      this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
      // Parse account name and key for SAS generation
      const accountName = connectionString.match(/AccountName=([^;]+)/)?.[1];
      const accountKey = connectionString.match(/AccountKey=([^;]+)/)?.[1];
      if (accountName && accountKey) {
        this.sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
      }
    }
  }

  async generateSasUrl(
    projectId: string,
    filename: string,
    fileType: string,
  ): Promise<SasUrlResult> {
    const containerName = 'uploads';
    const blobName = `${projectId}/${Date.now()}-${filename}`;

    if (!this.blobServiceClient || !this.sharedKeyCredential) {
      // Dev fallback — return a placeholder when no storage configured
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      return {
        uploadUrl: `https://localhost/devstore/${containerName}/${blobName}?dev=true`,
        blobName,
        expiresAt,
      };
    }

    const containerClient = this.blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);

    const expiresOn = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    const sasToken = generateBlobSASQueryParameters(
      {
        containerName,
        blobName,
        permissions: BlobSASPermissions.parse('cw'), // create + write
        expiresOn,
        protocol: SASProtocol.Https,
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
