import express, {Response} from "express";
import session from "express-session";
import FileStoreFactory from "session-file-store";
import morgan from "morgan";
import helmet from "helmet";
import util from "./util";

// import api from "./routes/api";

const app = express();

// Setup logging
const MORGAN_FORMAT = ":date[iso] [:remote-addr] - :method :url HTTP/:http-version :status :res[content-length] - :response-time ms";
app.use(morgan(MORGAN_FORMAT));

// Session stuff
const FileStore = FileStoreFactory(session);

// Type augmentation for express-session to include uid in session data
declare module "express-session" {
    interface SessionData {
        userId: string;
    }
}

app.use(session({
    secret: process.env.SESSION_SECRET || "Senne is mij aant uitlachen omdat ik een eendenknuffel bij me heb tijdens het programmeren.",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000*60*60*24*7*3,  // Cookies are valid for three weeks
        secure: false,  // We cannot use HTTPS-only cookies due to reverse proxy in production
    },
    store: new FileStore({
        ttl: 60*60*24*7*3,  // Cookies are valid for three weeks
        reapInterval: 60*60*24,  // Prune old sessions every 24 hours
    }),
}));

// Helmet stuff
app.use((req, res, next) => {
    res.locals.cspNonce = util.randomCspNonce();
    next();
});
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            "script-src": [
                "'self'",
                "cdnjs.cloudflare.com",
                (req, res) => `'nonce-${(res as Response).locals.cspNonce}'`,  // For inline Javascript and external Javascript
            ],
            "img-src": [
                "'self'",
                "data:",
            ],
            upgradeInsecureRequests: process.env.NODE_ENV == "production" ? [] : null,
        },
    },
}));

// API stuff
// app.use("/api", express.json({limit: "1mb"}));
// app.use("/api", api);

// app.use(express.static('./static'));
//
// Error pages
// app.use(errors.notFound);

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}`);
});

// Export app for testing purposes
export default app;
