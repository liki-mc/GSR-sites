import prisma from './prisma';
import { type User } from '@prisma/client';

import { NotFoundError } from '../middleware/errors';

interface UserInfo {
    firstName: string;
    lastName: string;
    ugentId: string;
}

async function getUser(userId: string): Promise<User> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            userAdmins: {
                select: {
                    fsr: {
                        select: {
                            slug: true,
                            name: true,
                        },
                    }
                }
            }, 
        }
    });

    if (!user) {
        throw new NotFoundError(`User with ID ${userId} not found`);
    }

    return user;
}

async function createUser(userData: UserInfo): Promise<User> {
    const { firstName, lastName, ugentId } = userData;

    const user = await prisma.user.create({
        data: {
            firstName,
            lastName,
            id: ugentId,
        },
    });

    return user;
}

async function setAdmin(ugentId: string, fsrSlug: string, isAdmin: boolean): Promise<void> {
    const user = await prisma.user.findUnique({
        where: { id: ugentId },
    });

    if (!user) {
        throw new NotFoundError(`User with ID ${ugentId} not found`);
    }

    if (isAdmin) {
        await prisma.userAdmin.create({
            data: {
                userId: ugentId,
                fsrId: fsrSlug,
            },
        });
    } else {
        await prisma.userAdmin.deleteMany({
            where: {
                userId: ugentId,
                fsrId: fsrSlug,
            },
        });
    }
}

async function isAdmin(ugentId: string, fsrSlug: string): Promise<boolean> {
    const userAdmin = await prisma.userAdmin.findFirst({
        where: {
            userId: ugentId,
            fsrId: fsrSlug,
        },
    });

    return !!userAdmin;
}

async function getUsers(page?: number, limit?: number): Promise<User[]> {
    const users = await prisma.user.findMany({
        skip: page ? (page - 1) * (limit || 10) : undefined,
        take: limit || undefined,
        orderBy: {
            firstName: 'asc',
        },
    });

    return users;
}

async function searchUsersByName(namePart: string): Promise<User[]> {
    const users = await prisma.user.findMany({
        where: {
            OR: [
                { firstName: { contains: namePart, mode: 'insensitive' } },
                { lastName: { contains: namePart, mode: 'insensitive' } },
            ],
        },
        orderBy: {
            firstName: 'asc',
        },
    });

    return users;
}

async function getAdmins(fsrSlug: string): Promise<User[]> {
    const admins = await prisma.user.findMany({
        where: {
            userAdmins: {
                some: {
                    fsrId: fsrSlug,
                },
            },
        },
        orderBy: {
            firstName: 'asc',
        },
    });

    return admins;
}

export default {
    getUser,
    createUser,
    setAdmin,
    isAdmin,
    getUsers,
    searchUsersByName,
    getAdmins,
}