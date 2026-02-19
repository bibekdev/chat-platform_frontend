import { generateReactHelpers } from '@uploadthing/react';

import { UploadRouter } from '@/app/api/uploadthing/core';

export const { useUploadThing } = generateReactHelpers<UploadRouter>();
