export interface UploadVodDto {
  userId: string;
  title: string;
  description?: string;
  originalPath: string;
  originalMimeType: string;
}
