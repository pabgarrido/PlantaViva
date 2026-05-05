"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadsService = void 0;
const common_1 = require("@nestjs/common");
const storage_blob_1 = require("@azure/storage-blob");
let UploadsService = class UploadsService {
    blobServiceClient = null;
    sharedKeyCredential = null;
    constructor() {
        const connectionString = process.env['AZURE_STORAGE_CONNECTION_STRING'];
        if (connectionString) {
            this.blobServiceClient = storage_blob_1.BlobServiceClient.fromConnectionString(connectionString);
            // Parse account name and key for SAS generation
            const accountName = connectionString.match(/AccountName=([^;]+)/)?.[1];
            const accountKey = connectionString.match(/AccountKey=([^;]+)/)?.[1];
            if (accountName && accountKey) {
                this.sharedKeyCredential = new storage_blob_1.StorageSharedKeyCredential(accountName, accountKey);
            }
        }
    }
    async generateSasUrl(projectId, filename, fileType) {
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
        const sasToken = (0, storage_blob_1.generateBlobSASQueryParameters)({
            containerName,
            blobName,
            permissions: storage_blob_1.BlobSASPermissions.parse('cw'), // create + write
            expiresOn,
            protocol: storage_blob_1.SASProtocol.Https,
            contentType: this.mimeType(fileType),
        }, this.sharedKeyCredential).toString();
        return {
            uploadUrl: `${blobClient.url}?${sasToken}`,
            blobName,
            expiresAt: expiresOn.toISOString(),
        };
    }
    mimeType(fileType) {
        const map = {
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
};
exports.UploadsService = UploadsService;
exports.UploadsService = UploadsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], UploadsService);
//# sourceMappingURL=uploads.service.js.map