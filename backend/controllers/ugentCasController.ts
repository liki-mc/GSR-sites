import { Request, NextFunction, Response } from "express";
import { BadRequestError, NotFoundError } from "../middleware/errors";
import userService from "../services/userService";

import fetch from 'node-fetch';
import xml2js from 'xml2js';
import { request } from "http";

const parser = new xml2js.Parser();

interface UGentUser {
    azureObjectId: string;
    mail: string;
    givenname: string;
    surname: string;
    uid: string;
    ugentID: string;
    objectClass: string[];
    lastenrolled: string;
    ugentStudentID: string;
}

async function login(req: Request, res: Response, next: NextFunction) {
    if (req.session.userId) {
        next();
    }
    else {
        const requestingPage = req?.body?.path || "/";
        const host = req.get("host");
        res.redirect(`https://login.ugent.be?service=https://${host}/api/ugent-cas/callback?path=${requestingPage}`);
    }
}

async function loginCallback(req: Request, res: Response, next: NextFunction) {
    const fsr = req.query.fsr;
    if (!fsr) {
        throw new BadRequestError("Invalid login callback");
    }

    const url = req.query.path as string || "/";
    if (req.session.userId) {
        // User is already logged in, redirect to the requested FSR
        res.redirect(url);
        return;
    }

    const ticketId = req.query.ticket as string;
    if (!ticketId) {
        throw new BadRequestError("Invalid login callback, no ticket provided");
    }

    const serviceUrl = `https://login.ugent.be/serviceValidate?service=https://${req.get("host")}/ugent-cas/callback&ticket=${ticketId}`;
    const response = await fetch(serviceUrl);
    if (!response.ok) {
        throw new BadRequestError("Failed to validate ticket with UGent CAS");
    }
    const xml = await response.text();
    const result = await parser.parseStringPromise(xml);
    if (!result["cas:serviceResponse"] || !result["cas:serviceResponse"]["cas:authenticationSuccess"]) {
        throw new BadRequestError("Invalid response from UGent CAS");
    }

    const attributes = result["cas:serviceResponse"]["cas:authenticationSuccess"][0]["cas:attributes"][0];
    const userAttributes: Record<string, string> = {};
    Object.keys(attributes).forEach(key => {
        userAttributes[key.replace("cas:", "")] = attributes[key][0];
    })
    userAttributes as unknown as UGentUser;
    try {
        await userService.getUser(userAttributes.ugentID)
    } catch (e) {
        if (e instanceof NotFoundError) {
            // User does not exist, create a new user
            await userService.createUser({
                firstName: userAttributes.givenname,
                lastName: userAttributes.surname,
                ugentId: userAttributes.ugentID,
            });
        } else {
            throw e;  // Re-throw other errors
        }
    }
    // Store user ID in session
    req.session.userId = userAttributes.ugentID;

    res.redirect(url);
}

async function logout(req: Request, res: Response, next: NextFunction) {
    req.session.destroy(err => {
        if (err) {
            throw new BadRequestError("Failed to log out");
        }
    });
}

export default {
    login,
    loginCallback,
    logout
}