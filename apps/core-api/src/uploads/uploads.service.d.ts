export interface SasUrlResult {
    uploadUrl: string;
    blobName: string;
    expiresAt: string;
}
export declare class UploadsService {
    private blobServiceClient;
    private sharedKeyCredential;
    constructor();
    generateSasUrl(projectId: string, filename: string, fileType: string): Promise<SasUrlResult>;
    private mimeType;
}
//# sourceMappingURL=uploads.service.d.ts.map