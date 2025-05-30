import * as Sentry from "@sentry/browser";
import { $ } from "@utils/dom";
import * as Package from "../../package.json";

// get Sentry DSN from meta stored in html-header.twig
const el = $(`meta[name="sentry-dsn-js"]`);
const DATA = {};
if (el) {
  DATA["SENTRY_DSN"] = el.getAttribute("value");
  DATA["SENTRY_ENV"] = el.getAttribute("data-env");
  DATA["RELEASE"] = `js-${Package.name}@${Package.version}`;
}

// init Sentry data was found
if ( DATA["SENTRY_DSN"] ) {
  Sentry.init({
    dsn: DATA["SENTRY_DSN"],
    environment: DATA["SENTRY_ENV"],
    release: DATA["RELEASE"],
    tracesSampleRate: 0.2,
    integrations: [
      Sentry.browserTracingIntegration()
    ]

    // *********
    // Enable Sentry.Replays, sample below
    // *********

    // integration: [
    //  Sentry.browserTracingIntegration(),
    //  Sentry.replayIntegration()
    // ]
    //
    // This sets the sample rate to be 10%. You may want this to be 100% while in development and sample at a lower rate in production
    // replaysSessionSampleRate: 0.2,
    //
    // If the entire session is not sampled, use the below sample rate to sample sessions when an error occurs.
    // replaysOnErrorSampleRate: 1.0,
  });
}
