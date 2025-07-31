import { UploadedFile } from 'express-fileupload';
import { NotFoundError } from '../middleware/errors';
import prisma from './prisma';
import { type FSR } from '@prisma/client';
import contentService from './contentService';

interface FSRInfo {
    name: string;
    slug: string;
}

interface FullFSRInfo extends FSRInfo {
    primaryColor: string;
    secondaryColor: string;

    logo?: string;

    uforaUrl?: string;
    facebookUrl?: string;
    instagramUrl?: string;
    discordUrl?: string;
    linkedinUrl?: string;
    tiktokUrl?: string;
    githubUrl?: string;
}

async function createFsr(fsrData: FullFSRInfo, logo?: UploadedFile): Promise<FSR> {
    if (logo) {
        const logoPath = `fsr-logos/${fsrData.slug}${logo.name.slice(logo.name.lastIndexOf('.'))}`;
        await contentService.writeContentFromFile(logoPath, logo);
        fsrData.logo = logoPath;
    }
    const fsr = await prisma.fSR.create({
        data: fsrData
    });

    return fsr;
}

async function getFsrBySlug(slug: string): Promise<FSR> {
    const fsr = await prisma.fSR.findUnique({
        where: { slug },
    });

    if (!fsr) {
        throw new NotFoundError(`FSR with slug ${slug} not found`);
    }

    return fsr;
}

async function updateFSR(fsr: string, fsrData: Partial<FullFSRInfo>): Promise<FSR> {
    const updatedFsr = await prisma.fSR.update({
        where: { slug: fsr },
        data: fsrData,
    });

    return updatedFsr;
}

async function getAllFSRs(): Promise<FSRInfo[]> {
    const fsrs = await prisma.fSR.findMany({
        select: {
            name: true,
            slug: true,
        },
    });

    return fsrs;
}

export default {
    createFsr,
    getFsrBySlug,
    updateFSR,
    getAllFSRs,
};