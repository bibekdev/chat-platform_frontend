import { createUploadthing, type FileRouter } from 'uploadthing/next';

const f = createUploadthing();

export const uploadRouter = {
  messageAttachment: f({
    image: { maxFileSize: '8MB', maxFileCount: 5 },
    video: { maxFileSize: '32MB', maxFileCount: 2 },
    audio: { maxFileSize: '16MB', maxFileCount: 2 },
    blob: { maxFileSize: '16MB', maxFileCount: 5 }
  })
    .middleware(() => ({}))
    .onUploadComplete(({ file }) => ({
      url: file.ufsUrl,
      name: file.name
    }))
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
