import * as Sentry from '@sentry/node';
export function sentryInit(app){if(!process.env.SENTRY_DSN) return;Sentry.init({dsn:process.env.SENTRY_DSN,tracesSampleRate:0.1});app.use(Sentry.Handlers.requestHandler());app.use(Sentry.Handlers.tracingHandler());app.use(Sentry.Handlers.errorHandler());}
