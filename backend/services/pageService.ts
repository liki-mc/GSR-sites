import prisma from './prisma';
import { FSR, type Page } from '@prisma/client';
import contentService from './contentService';

import { BadRequestError, NotFoundError } from '../middleware/errors';

interface PageInfoLanguage {
    title: string;
    path: string;
}

interface PageInfo {
    fsr: FSR;
    en: PageInfoLanguage;
    nl: PageInfoLanguage;
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

async function getPageByPath(fsr: FSR, path: string, lang: 'en' | 'nl'): Promise<Page> {
    var page: Page | null;
    if (lang === 'en') {
        page = await prisma.page.findUnique({
            where: {
                fsr_path_en: {
                    fsr,
                    path_en: path,
                },
            },
        });
    } else if (lang === 'nl') {
        page = await prisma.page.findUnique({
            where: {
                fsr_path_nl: {
                    fsr,
                    path_nl: path,
                },
            },
        });
    } else {
        throw new BadRequestError(`Invalid language specified: ${lang}`);
    }

    if (!page) {
        throw new NotFoundError(`Page with path ${lang}/${path} not found for FSR ${fsr}`);
    }

    return page;
}

async function getPageContent(fsr: FSR, path: string, lang: 'en' | 'nl'): Promise<string> {
    const page = await getPageByPath(fsr, path, lang);
    const filePath = lang === 'en' ? `pages/${fsr}-${page.path_en}.en.html` : `pages/${fsr}-${page.path_nl}.nl.html`;

    return await contentService.getContent(filePath);
}

async function updatePageContent(fsr: FSR, path: string, lang: 'en' | 'nl', content: string): Promise<void> {
    // Check if the page exists
    const page = await getPageByPath(fsr, path, lang);

    // Write the content to the appropriate file based on the language
    const filePath = lang === 'en' ? `pages/${fsr}-${page.path_en}.en.html` : `pages/${fsr}-${page.path_nl}.nl.html`;
    await contentService.writeContent(filePath, content);
}

async function createPage(pageInfo: PageInfo): Promise<Page> {
    const { fsr, en, nl } = pageInfo;

    const page = await prisma.page.create({
        data: {
            fsr,
            path_en: en.path,
            title_en: en.title,
            path_nl: nl.path,
            title_nl: nl.title,
        },
    });

    // Initialize content files for the new page
    await contentService.writeContent(`pages/${fsr}-${en.path}.en.html`, '<div></div>');
    await contentService.writeContent(`pages/${fsr}-${nl.path}.nl.html`, '<div></div>');

    return page;
}

async function updatePage(fsr: FSR, path: string, lang: 'nl' | 'en', pageInfo: Partial<PageInfo>): Promise<Page> {
    // Get the existing page
    const page = await getPageByPath(fsr, path, lang);

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
            `pages/${fsr}-${page.path_en}.en.html`,
            `pages/${fsr}-${updatedPage.path_en}.en.html`
        );
    }

    if (page.path_nl !== updatedPage.path_nl) {
        await contentService.renameContent(
            `pages/${fsr}-${page.path_nl}.nl.html`,
            `pages/${fsr}-${updatedPage.path_nl}.nl.html`
        );
    }

    return updatedPage;
}

async function removePage(fsr: FSR, path: string, lang: 'en' | 'nl'): Promise<void> {
    // Delete the page from the database
    if (lang === 'en') {
        await prisma.page.delete({
            where: {
                fsr_path_en: {
                    fsr,
                    path_en: path,
                },
            },
        });
    } else if (lang === 'nl') {
        await prisma.page.delete({
            where: {
                fsr_path_nl: {
                    fsr,
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