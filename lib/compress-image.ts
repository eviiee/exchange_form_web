import imageCompression from 'browser-image-compression'

export async function compressImage(
  file: File,
  options?: { maxSizeMB?: number; maxWidthOrHeight?: number }
): Promise<File> {
  return imageCompression(file, {
    maxSizeMB: options?.maxSizeMB ?? 0.5,
    maxWidthOrHeight: options?.maxWidthOrHeight ?? 800,
    useWebWorker: true,
    fileType: 'image/webp',
  })
}