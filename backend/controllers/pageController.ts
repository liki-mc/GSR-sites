import { Request, NextFunction, Response } from "express";
import pageService from "../services/pageService";
import { BadRequestError, NotFoundError } from "../middleware/errors";

async function getPageInfo(req: Request, res: Response) {
    const fsr = req.fsr!;
    const path = req.params.path;
    const lang = req.params.lang;

    if (lang !== 'en' && lang !== 'nl') {
        throw new NotFoundError(`Language ${lang} not supported`);
    }

    const page = await pageService.getPageByPath(fsr, path, lang);
    res.status(200).json(page);
}

async function getPageInfoWithoutLang(req: Request, res: Response) {
    const fsr = req.fsr!;
    const path = req.params.path;

    try {
        const page = await pageService.getPageByPath(fsr, path, 'en');
        res.status(200).json(page);
    } catch (error) {
        if (error instanceof NotFoundError) {
            // If not found in English, try Dutch
            const page = await pageService.getPageByPath(fsr, path, 'nl');
            res.status(200).json(page);
        } else {
            throw error;
        }
    }
}

async function getPage(req: Request, res: Response) {
    const fsr = req.fsr!;
    const path = req.params.path;
    const lang = req.params.lang;

    if (lang !== 'en' && lang !== 'nl') {
        throw new BadRequestError(`Language ${lang} not supported`);
    }

    const content = await pageService.getPageContent(fsr, path, lang);
    res.status(200).header("Content-Type", "text/html").send(content);
}

async function getPageWithoutLang(req: Request, res: Response) {
    const fsr = req.fsr!;
    const path = req.params.path;

    try {
        const content = await pageService.getPageContent(fsr, path, 'en');
        res.status(200).header("Content-Type", "text/html").send(content);
    } catch (error) {
        if (error instanceof NotFoundError) {
            // If not found in English, try Dutch
            const content = await pageService.getPageContent(fsr, path, 'nl');
            res.status(200).header("Content-Type", "text/html").send(content);
        } else {
            throw error;
        }
    }
}

async function createPage(req: Request, res: Response) {
    const fsr = req.fsr!;
    const path_en = req.body.path_en;
    const path_nl = req.body.path_nl;
    const title_en = req.body.title_en;
    const title_nl = req.body.title_nl;

    const errors = [];
    if (!path_en) {
        errors.push("English path is required");
    }
    if (!path_nl) {
        errors.push("Dutch path is required");
    }
    if (!title_en) {
        errors.push("English title is required");
    }
    if (!title_nl) {
        errors.push("Dutch title is required");
    }
    if (errors.length > 0) {
        throw new BadRequestError(errors.join(", "));
    }

    const pageInfo = {
        fsr,
        en: { title: title_en, path: path_en },
        nl: { title: title_nl, path: path_nl },
    };

    const page = await pageService.createPage(pageInfo);
    res.status(201).json(page);
}

async function updatePageContent(req: Request, res: Response) {
    const fsr = req.fsr!;
    const path = req.params.path;
    const lang = req.params.lang as 'en' | 'nl';
    const content = req.body.content;

    if (!content) {
        throw new BadRequestError("Content is required");
    }

    if (lang !== 'en' && lang !== 'nl') {
        throw new NotFoundError(`Language ${lang} not supported`);
    }

    await pageService.updatePageContent(fsr, path, lang, content);
    res.status(204).send();
}

async function updatePage(req: Request, res: Response) {
    const fsr = req.fsr!;
    const path = req.params.path;
    const lang = req.params.lang;

    if (lang !== 'en' && lang !== 'nl') {
        throw new NotFoundError(`Language ${lang} not supported`);
    }

    const pageInfo = {
        fsr,
        en: { title: req.body.title_en, path: req.body.path_en },
        nl: { title: req.body.title_nl, path: req.body.path_nl },
    }


    const updatedPage = await pageService.updatePage(fsr, path, lang, pageInfo);
    res.status(200).json(updatedPage);
}

async function deletePage(req: Request, res: Response) {
    const fsr = req.fsr!;
    const path = req.params.path;
    const lang = req.params.lang as 'en' | 'nl';

    if (lang !== 'en' && lang !== 'nl') {
        throw new NotFoundError(`Language ${lang} not supported`);
    }

    await pageService.removePage(fsr, path, lang);
    res.status(204).send();
}

export default {
    getPageInfo,
    getPageInfoWithoutLang,
    getPage,
    getPageWithoutLang,
    createPage,
    updatePageContent,
    updatePage,
    deletePage,
}