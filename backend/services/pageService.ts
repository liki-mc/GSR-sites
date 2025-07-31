import prisma from './prisma';
import { type Page } from '@prisma/client';
import contentService from './contentService';

import { BadRequestError, NotFoundError } from '../middleware/errors';

interface PageInfoLanguage {
    title: string;
    path: string;
}

interface PageInfo {
    fsrSlug: string;
    en: PageInfoLanguage;
    nl: PageInfoLanguage;
}

function getPath(fsrSlug: string, lang: 'en' | 'nl', page: Page): string {
    const path = page[`path_${lang}`];
    return `pages/${fsrSlug}-${path}.${lang}.html`;
}

async function getPageById(pageId: number): Promise<Page> {
    const page = await prisma.page.findUnique({
        where: { id: pageId },
    });

    if (!page) {
        throw new NotFoundError(`Page with ID ${pageId} not found`);
    }

    return page;
}

async function getPageByPath(fsrSlug: string, path: string, lang: 'en' | 'nl'): Promise<Page> {
    var page: Page | null;
    if (lang === 'en') {
        page = await prisma.page.findUnique({
            where: {
                fsrId_path_en: {
                    fsrId: fsrSlug,
                    path_en: path,
                },
            },
        });
    } else if (lang === 'nl') {
        page = await prisma.page.findUnique({
            where: {
                fsrId_path_nl: {
                    fsrId: fsrSlug,
                    path_nl: path,
                },
            },
        });
    } else {
        throw new BadRequestError(`Invalid language specified: ${lang}`);
    }

    if (!page) {
        throw new NotFoundError(`Page with path ${lang}/${path} not found for FSR ${fsrSlug}`);
    }

    return page;
}

async function getPageContent(fsrSlug: string, path: string, lang: 'en' | 'nl'): Promise<string> {
    const page = await getPageByPath(fsrSlug, path, lang);
    const filePath = getPath(fsrSlug, lang, page);

    return await contentService.getContent(filePath);
}

async function updatePageContent(fsrSlug: string, path: string, lang: 'en' | 'nl', content: string): Promise<void> {
    // Check if the page exists
    const page = await getPageByPath(fsrSlug, path, lang);

    // Write the content to the appropriate file based on the language
    const filePath = getPath(fsrSlug, lang, page);
    await contentService.writeContent(filePath, content);
}

async function createPage(pageInfo: PageInfo): Promise<Page> {
    const { fsrSlug, en, nl } = pageInfo;

    const page = await prisma.page.create({
        data: {
            fsrId: fsrSlug,
            path_en: en.path,
            title_en: en.title,
            path_nl: nl.path,
            title_nl: nl.title,
        },
    });

    // Initialize content files for the new page
    await contentService.writeContent(getPath(fsrSlug, 'en', page), '<div></div>');
    await contentService.writeContent(getPath(fsrSlug, 'nl', page), '<div></div>');

    return page;
}

async function updatePage(fsrSlug: string, path: string, lang: 'nl' | 'en', pageInfo: Partial<PageInfo>): Promise<Page> {
    // Get the existing page
    const page = await getPageByPath(fsrSlug, path, lang);

    // Update the page in the database
    const updatedPage = await prisma.page.update({
        where: { id: page.id },
        data: {
            path_en: pageInfo?.en?.path || page.path_en,
            title_en: pageInfo?.en?.title || page.title_en,
            path_nl: pageInfo?.nl?.path || page.path_nl,
            title_nl: pageInfo?.nl?.title || page.title_nl,
        },
    });

    // Update the content files if paths have changed
    if (page.path_en !== updatedPage.path_en) {
        await contentService.renameContent(
            getPath(fsrSlug, 'en', page),
            getPath(fsrSlug, 'en', updatedPage)
        );
    }

    if (page.path_nl !== updatedPage.path_nl) {
        await contentService.renameContent(
            getPath(fsrSlug, 'nl', page),
            getPath(fsrSlug, 'nl', updatedPage)
        );
    }

    return updatedPage;
}

async function removePage(fsrSlug: string, path: string, lang: 'en' | 'nl'): Promise<void> {
    // Delete the page from the database
    if (lang === 'en') {
        await prisma.page.delete({
            where: {
                fsrId_path_en: {
                    fsrId: fsrSlug,
                    path_en: path,
                },
            },
        });
    } else if (lang === 'nl') {
        await prisma.page.delete({
            where: {
                fsrId_path_nl: {
                    fsrId: fsrSlug,
                    path_nl: path,
                },
            },
        });
    } else {
        throw new BadRequestError(`Invalid language specified: ${lang}`);
    }
}

export default {
    getPageById,
    getPageByPath,
    getPageContent,
    updatePageContent,
    createPage,
    updatePage,
    removePage,
};