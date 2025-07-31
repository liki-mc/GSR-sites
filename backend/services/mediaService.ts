import prisma from './prisma';
import { type Media } from '@prisma/client';
import contentService from './contentService';

import { NotFoundError } from '../middleware/errors';
import { UploadedFile } from 'express-fileupload';

interface MediaInfo {
    name: string;
    path: string;
    mimeType: string;
}

async function getMedia(fsrSlug: string, path: string): Promise<Media> {
    const media = await prisma.media.findFirst({
        where: {
            fsrId: fsrSlug,
            path,
            deletedAt: null, // Ensure we only get non-deleted media
        },
        include: {
            fsr: {
                select: {
                    slug: true,
                    name: true,
                },
            }
        }
    });

    if (!media) {
        throw new NotFoundError(`Media with path ${path} not found for FSR ${fsrSlug}.`);
    }

    return media;
}

async function getMediaContent(fsrSlug: string, path: string): Promise<[string, string]> {
    const media = await getMedia(fsrSlug, path);
    const content = await contentService.getContent(`media/${media.path}`);

    return [content, media.mimeType];
}

async function createMedia(fsrSlug: string, file: UploadedFile): Promise<Media> {
    const media = await prisma.media.create({
        data: {
            fsrId: fsrSlug,
            name: file.name,
            path: file.name,
            mimeType: file.mimetype,
        },
    });

    // Append the media ID to the path and update the database
    const lastDotIndex = media.path.lastIndexOf('.');
    const updatedPath = `${media.path.slice(0, lastDotIndex)}-${media.id}${media.path.slice(lastDotIndex)}`;
    const updatedMedia = await prisma.media.update({
        where: { id: media.id },
        data: { path: updatedPath },
    });

    // Create an empty file for the media
    await contentService.writeContentFromFile(`media/${updatedMedia.path}`, file);

    return updatedMedia;
}

async function deleteMedia(fsrSlug: string, path: string): Promise<void> {
    const media = await getMedia(fsrSlug, path);
    
    // Delete the media file from the content directory
    await contentService.renameContent(`media/${media.path}`, `media/deleted/${media.path}`);

    // Delete the media record from the database
    await prisma.media.update({
        where: { id: media.id },
        data: { deletedAt: new Date() },
    });
}

export default {
    getMedia,
    getMediaContent,
    createMedia,
    deleteMedia,
};