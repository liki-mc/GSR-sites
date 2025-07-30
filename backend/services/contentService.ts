import { readFile, writeFile, mkdir, rename } from "fs/promises";

import { NotFoundError } from "../middleware/errors";
import { UploadedFile } from "express-fileupload";

async function initializeContentDirectory(): Promise<void> {
    const contentDirectory = "content";
    await mkdir(contentDirectory, { recursive: true }); 
    const pagesContentDirectory = "content/pages";
    await mkdir(pagesContentDirectory, { recursive: true }); 
    const mediaContentDirectory = "content/media";
    await mkdir(mediaContentDirectory, { recursive: true }); 
}

async function getContent(path: string): Promise<string> {
    const content = await readFile(`content/${path}`, "utf-8");
    if (!content) {
        throw new NotFoundError(`Content not found`);
    }

    return content;
}

async function writeContent(path: string, content: string): Promise<void> {
    await writeFile(`content/${path}`, content, "utf-8");
    console.log(`Content written to ${path}`);
}

async function writeContentFromFile(path: string, file: UploadedFile): Promise<void> {
    // Write the file to the specified path
    await file.mv(`content/${path}`);
}

async function renameContent(initialPath: string, newPath: string): Promise<void> {
    await rename(`content/${initialPath}`, `content/${newPath}`);
}

// Initialize the content directory on startup
initializeContentDirectory().catch((err) => {
    console.error("Failed to initialize content directory:", err);
    process.exit(1); // Exit the application if initialization fails
});

export default {
    getContent,
    writeContent,
    renameContent,
    writeContentFromFile,
}