import { NotFoundError } from '../middleware/errors';
import prisma from './prisma';
import { type FSR } from '@prisma/client';

interface FSRInfo {
    name: string;
    slug: string;
}

interface FullFSRInfo extends FSRInfo {
    primaryColor: string;
    secondaryColor: string;

    logoPath?: string;

    uforaUrl?: string;
    facebookUrl?: string;
    instagramUrl?: string;
    discordUrl?: string;
    linkedinUrl?: string;
    tiktokUrl?: string;
    githubUrl?: string;
}

async function createFsr(fsrData: FullFSRInfo): Promise<FSR> {
    const { name, slug } = fsrData;

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