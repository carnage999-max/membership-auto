import apiClient from './apiClient';
import { API_ENDPOINTS } from './config';

export interface PresignedUrlRequest {
  filename: string;
  contentType: string;
}

export interface PresignedUrlResponse {
  url: string; // Presigned URL for uploading
  method: string; // HTTP method (PUT)
  publicUrl: string; // Public URL after upload
  fileId: string; // File ID for reference
}

/**
 * Request a presigned URL for uploading a file to S3
 */
export const requestPresignedUrl = async (
  data: PresignedUrlRequest
): Promise<PresignedUrlResponse> => {
  const response = await apiClient.post<PresignedUrlResponse>(
    API_ENDPOINTS.FILES.PRESIGN,
    data
  );
  return response.data;
};

/**
 * Upload a file directly to S3 using presigned URL
 */
export const uploadToS3 = async (
  presignedUrl: string,
  file: File,
  contentType: string
): Promise<void> => {
  const response = await fetch(presignedUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': contentType,
    },
  });

  if (!response.ok) {
    throw new Error(`S3 upload failed: ${response.statusText}`);
  }
};

/**
 * Complete upload flow: request presigned URL, upload to S3, return public URL
 */
export const uploadFile = async (file: File): Promise<string> => {
  console.log('uploadFile: Starting upload for', file.name);
  
  // Step 1: Request presigned URL
  console.log('uploadFile: Requesting presigned URL...');
  const presignedData = await requestPresignedUrl({
    filename: file.name,
    contentType: file.type || 'application/octet-stream',
  });
  console.log('uploadFile: Got presigned data:', presignedData);

  // Step 2: Upload to S3
  console.log('uploadFile: Uploading to S3...');
  await uploadToS3(presignedData.url, file, file.type || 'application/octet-stream');
  console.log('uploadFile: Upload complete');

  // Step 3: Return public URL
  console.log('uploadFile: Returning public URL:', presignedData.publicUrl);
  return presignedData.publicUrl;
};
