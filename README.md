# Page Pulse

My submission to Digital Heroes Training task 'Page Pulse': A small web application that audits any URL: it fetches the page, measures how long that took, and reports a handful of useful facts about the page — its title, meta description, heading structure, image accessibility, and approximate word count.


---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Features](#2-features)
3. [Technology Overview](#3-technology-overview)
4. [Project Architecture](#4-project-architecture)
5. [Request Lifecycle](#5-request-lifecycle)
6. [Backend Explanation](#6-backend-explanation)
7. [Frontend Explanation](#7-frontend-explanation)
8. [API Contract](#8-api-contract)
9. [Error Handling](#9-error-handling)
10. [Testing](#10-testing)
11. [Design Decisions](#11-design-decisions)
12. [Running the Project](#12-running-the-project)
13. [File-by-File Explanation](#13-file-by-file-explanation)
14. [Glossary](#14-glossary)
15. [Known Limitations](#15-known-limitations)

---

## 1. Project Overview

Page Pulse lets a user paste in any web address and get back a quick "health check" of that page. Type a URL, click **Run audit**, and within a couple of seconds you see:

- An overall **Page Pulse Score** out of 100, summarizing the findings at a glance
- Whether the page responded successfully, and how fast
- What the page is called (its title) and how it describes itself (its meta description)
- How its headings are structured
- Whether its images have accessible alt text
- Roughly how much text is on the page

The intended workflow is deliberately simple: **one input, one button, one report.**. If something goes wrong (a bad URL, a page that never responds, a page that isn't HTML at all), the tool explains what happened in plain language instead of crashing or showing a raw error.

## 2. Features

- **URL auditing** — submit any `http(s)://` URL and receive a structured report.
- **Response metrics** — HTTP status code and response time in milliseconds.
- **Metadata extraction** — page `<title>` and `<meta name="description">` content.
- **Heading structure** — count of `<h1>` elements on the page.
- **Image accessibility inspection** — count of `<img>` elements missing usable `alt` text (missing attribute or empty string).
- **Word count** — an approximate count of words in the visible body text.
- **Page Pulse Score** — a 0–100 summary score derived on the frontend from the fields above, with a plain-language band (Excellent / Good / Fair / Poor). Purely a presentation layer over data the API already returns; the backend does not compute or send it.
- **Graceful error handling** — invalid URLs, timeouts, and non-HTML responses all return a clear, structured error instead of a crash or a stack trace.
- **Accessible, motion-aware UI** — a modern, glassmorphic dashboard layout featuring translucent cards, soft drop shadows, and a responsive CSS-generated orb (inspired by the Digital Heroes aesthetic), with animations gracefully disabling for users who set `prefers-reduced-motion`.

## 3. Technology Overview

### Backend framework — Express

**Express** lets you define routes (e.g. "when a `POST` request arrives at `/audit`, run this function") without writing raw socket-handling code.

Express is the outermost layer. `src/server.js` creates the Express app, and `src/api/auditRoutes.js` defines the `/audit` route that the frontend talks to.

The backend only needs one real endpoint. Express gives us routing, JSON request/response handling, and middleware (like CORS) with almost no boilerplate — appropriate for a small, focused API.

### HTTP client — the native `fetch` API

Something has to actually go out onto the internet, request the target page, and bring back its HTML. That's the fetcher's job (`src/services/fetcher/index.js`), and it uses Node's built-in `fetch` rather than an external HTTP library.

A request is started with an `AbortController` wired to an 8-second timeout. If the server responds, we record how long that took, check the `Content-Type` header, and — only if it claims to be HTML — read the response body as text.

If 8 seconds pass with no response, the `AbortController` cancels the in-flight request, `fetch` rejects with an `AbortError`, and the fetcher turns that into a friendly `TimeoutError` ("The website took too long to respond.").

### HTML parser — Cheerio

Cheerio takes a raw HTML string and parses it into a DOM-like tree, then exposes a jQuery-style API (`$('h1')`, `$('title').text()`, etc.) to query that tree. It is intentionally *not* a full browser — it does not execute JavaScript or apply CSS — it only parses markup, which makes it fast and lightweight for server-side use.

`src/services/parser/index.js` uses Cheerio selectors to pull out the title, meta description, count headings and images, and reduce the page's visible text down to a word count.

### Frontend framework — React (with Vite)

**Components:** The UI is broken into small, single-purpose React components (`UrlInput`, `Loading`, `ErrorMessage`, `AuditReport`, `Header`, `Footer`) that are composed together in `App.jsx`. Each component receives data and callbacks via props and renders its own piece of the page.

**Rendering:** React re-renders a component's output whenever its inputs (props or state) change. Instead of manually updating the DOM (e.g. `document.getElementById(...).innerText = ...`), you describe *what the UI should look like* for a given state, and React handles updating the actual page.

**State management:** All meaningful state (the URL being typed, the current phase of the audit, the report, any error) lives in `App.jsx` via React's `useState` hook and is passed down to child components as props. There's no need for a larger state-management library at this scale.

**Motion and derived display values:** Two small local modules support the UI without adding dependencies — `hooks/useCountUp.js` animates a number from 0 to its target using `requestAnimationFrame`, and `utils/score.js` derives the Page Pulse Score and its band from the report. All motion is CSS-driven (keyframes and transitions) rather than an animation library.

**Vite** is the build tool that turns the React source code into an optimized bundle and provides the fast local dev server (`npm run dev`) with instant hot-reload.

### Testing framework — Node's built-in test runner (`node:test`)

**Why automated testing matters:** Manually re-checking "does the parser still extract the title correctly?" after every change doesn't scale and is easy to forget. Automated tests encode that check once and run it in milliseconds, every time.

**Assertions:** A test calls the code under test and then uses `assert` functions (`assert.equal`, `assert.ok`, `assert.doesNotThrow`) to state exactly what should be true about the result. If reality doesn't match, the test fails loudly with a diff.

**Repeatability:** Because the parser tests feed in static HTML strings (fixtures) rather than fetching real websites, they produce the exact same result every time they run, on any machine, with no internet connection required.

## 4. Project Architecture

```
Page Pulse/
├── backend/                   Express API — fetches, parses, and audits URLs
│   ├── src/
│   │   ├── api/                HTTP layer (routes only)
│   │   ├── services/           Business logic
│   │   │   ├── fetcher/        HTTP fetch, timing, timeout, content-type check
│   │   │   └── parser/         HTML parsing / data extraction
│   │   ├── models/              Request/response shape builders
│   │   ├── utils/              Reusable helpers (URL validation, error classes)
│   │   └── server.js            App entry point
│   ├── tests/
│   │   ├── fixtures/            Static HTML files used as test input
│   │   └── parser.test.js       Automated tests for the parser
│   └── package.json
├── frontend/                   React + Vite single-page app
│   └── src/
│       ├── components/          UrlInput, Loading, ErrorMessage, AuditReport, Header, Footer
│       ├── hooks/               useCountUp.js — number count-up animation
│       ├── utils/               score.js — derives the Page Pulse Score
│       ├── services/            auditApi.js — talks to the backend
│       ├── App.jsx               Top-level state + composition
│       └── main.jsx              React entry point
├── GUIDE.md / IMPLEMENTATION.md  Original Phase 1 project spec
├── Task2_guide.md / task2_implementation.md   Testing + documentation spec (this task)
└── README.md                    You are here
```

### Folder responsibilities in detail

| Folder | Responsibility | Inputs | Outputs | Depends on |
|---|---|---|---|---|
| `backend/src/api` | Receive HTTP requests, invoke the service layer, return HTTP responses. No business logic lives here. | Express `Request` | Express `Response` (JSON) | `services/auditService`, `models` |
| `backend/src/services/fetcher` | Perform the HTTP request to the target URL, time it, verify it's HTML, enforce a timeout. | A URL string | `{ html, status, responseTimeMs }` or a thrown typed error | `utils/errors` |
| `backend/src/services/parser` | Turn raw HTML into structured facts. | An HTML string | An object with title, description, counts | `cheerio` |
| `backend/src/services` (root) | Orchestrate: validate → fetch → parse → shape the response. | A URL string | The final audit response object | `utils`, `fetcher`, `parser`, `models` |
| `backend/src/models` | Define the exact shape of success and error responses. | Raw values | Response-shaped plain objects | none |
| `backend/src/utils` | URL validation and a small hierarchy of typed, user-facing error classes. | — | — | none |
| `frontend/src/components` | Presentational pieces of the single page — each owns one visual concern. | Props | Rendered JSX | `index.css` / `App.css`, `hooks`, `utils` |
| `frontend/src/hooks` | Reusable stateful UI behavior (currently the count-up animation). | A target number | An animating number | React |
| `frontend/src/utils` | Pure display-layer calculations (the Page Pulse Score and its band). | A report object | A score number / band descriptor | none |
| `frontend/src/services` | The only place that knows the backend's base URL and fetch details. | A URL string | Parsed JSON or a thrown `Error` | native `fetch` |

## 5. Request Lifecycle

This is the complete path a single audit takes, from keystroke to rendered report:

1. **User enters a URL** into the input field and clicks **Run audit** (or presses Enter).
2. **Frontend validates basic input** — the submit button is disabled while the field is empty, and the raw text is normalized: if it doesn't already start with `http://` or `https://`, `https://` is prepended (`normalizeUrl` in `App.jsx`).
3. **Request sent to backend** — `auditApi.js` sends `POST /audit` with `{ "url": "..." }` as JSON.
4. **Backend validates the URL** — `utils/urlValidator.js` checks that the string parses as a URL with an `http:`/`https:` protocol. If not, an `InvalidUrlError` is thrown immediately and no network request is made.
5. **HTTP request executed** — the fetcher issues a `fetch()` to the target URL with an 8-second abort timeout and a descriptive `User-Agent`.
6. **Response timed** — the fetcher measures elapsed time (via `performance.now()`) from just before the request to just after the response headers arrive.
7. **HTML verified** — the fetcher inspects the `Content-Type` response header. If it doesn't contain `text/html`, a `NonHtmlError` is thrown and the body is never even read.
8. **Parser extracts information** — the HTML body is handed to Cheerio, which extracts the title, meta description, heading count, image alt-text audit, and word count.
9. **JSON response created** — `models/auditModels.js` assembles the final `{ status, response_time_ms, page_title, meta_description, h1_count, images_missing_alt, approximate_word_count }` object.
10. **Frontend renders report** — on success, `App.jsx` stores the result and switches to the "report" phase; `AuditReport.jsx` derives the Page Pulse Score from the response and renders it as a scored, ruled report. On failure, the thrown error's message is shown via `ErrorMessage.jsx`.
11. **User sees results** — either a fully-populated scored report, or a clear, human-readable error message. Nothing ever crashes the page.

## 6. Backend Explanation

### API layer (`src/api/auditRoutes.js`)

**Responsibility:** Wire the `POST /audit` route to the service layer, and translate whatever comes back (a result or a thrown error) into the correct HTTP status code and JSON body. This file contains no business logic — it only receives, delegates, and responds.

- On success: `200` with the audit report.
- On a known, user-facing failure (any `AuditError` subclass): `422` with `{ "error": "<message>" }`.
- On anything unexpected: `500` with a generic error message, so an unhandled bug never leaks a stack trace to the client.

### Request models / response models (`src/models/auditModels.js`)

Two small pure functions:

- `buildAuditResponse({ status, responseTimeMs, parsed })` — assembles the exact success shape defined in the API contract.
- `buildErrorResponse(message)` — assembles the exact error shape (`{ error: message }`).

Centralizing this means the response shape is defined in exactly one place, instead of being hand-built (and potentially drifting) in every route.

### Validation (`src/utils/urlValidator.js`)

`isValidUrl(candidate)` returns `true` only if the string is non-empty and parses via the built-in `URL` constructor with an `http:` or `https:` protocol. Anything else (empty string, `not-a-url`, `ftp://...`) is rejected before any network call is attempted.

### Fetching service (`src/services/fetcher/index.js`)

`fetchPage(url)`:

1. Creates an `AbortController` and schedules `controller.abort()` after 8000ms.
2. Calls `fetch(url, { signal, redirect: 'follow', headers: { 'User-Agent': ... } })`.
3. If the request is aborted, throws `TimeoutError`. If it fails for any other reason (DNS failure, connection refused, TLS error, etc.), throws `UnreachableError`.
4. Measures response time and checks the `content-type` header; if it doesn't contain `text/html`, throws `NonHtmlError` without reading the body.
5. Reads and returns the HTML text, the HTTP status code, and the response time in milliseconds.

### Parser (`src/services/parser/index.js`)

`parseHtml(html)` loads the string into Cheerio and extracts:

- `page_title` — the trimmed text of the first `<title>`, or `null` if there isn't one or it's empty.
- `meta_description` — the trimmed `content` attribute of `<meta name="description">`, or `null` if absent.
- `h1_count` — the number of `<h1>` elements.
- `images_missing_alt` — the number of `<img>` elements whose `alt` attribute is either absent or an empty/whitespace-only string.
- `approximate_word_count` — after stripping `<script>`, `<style>`, and `<noscript>` content, the visible text of `<body>` is trimmed and split on whitespace; the resulting token count is the word count (`0` for an empty body).

This function never throws for structurally broken HTML — Cheerio (via its underlying `htmlparser2` parser) is tolerant of unclosed tags and invalid nesting, and simply extracts what it can.

### Utilities / exception handling (`src/utils/errors.js`)

A small class hierarchy:

```
AuditError (base)
├── InvalidUrlError    "Invalid URL."
├── TimeoutError        "The website took too long to respond."
├── NonHtmlError         "The provided URL does not contain an HTML page."
└── UnreachableError      "The website could not be reached."
```

Every user-facing failure is one of these. The route handler only needs a single check — `err instanceof AuditError` — to decide whether a thrown error is safe to show the user (`422`) or should be hidden behind a generic `500`.

### Orchestration (`src/services/auditService.js`)

`runAudit(url)` is the glue: validate → fetch → parse → shape response. It is the single function the API layer calls, and the single place that knows the *order* these steps happen in.

## 7. Frontend Explanation

### Component hierarchy

```
App
├── Header
├── UrlInput        (phase: input)
├── ErrorMessage     (phase: input, if an error occurred)
├── Loading          (phase: loading)
├── AuditReport      (phase: report)
│   ├── useCountUp    hook — animates the score and word count
│   └── score.js      util — derives the score and its band
└── Footer
```

### Input flow

`UrlInput` is a controlled input — its value lives in `App`'s state, not inside the component itself. Typing calls `onChange`, which updates `App`'s `url` state; submitting (via button click or Enter, since it's wrapped in a `<form>`) calls `onSubmit`.

### Loading states

`App` tracks a single `phase` state variable: `'input' | 'loading' | 'report'`. Submitting a URL sets `phase` to `'loading'` immediately, which swaps `UrlInput` out for the `Loading` component — an indeterminate progress rule with a cycling stage label ("Connecting", "Fetching page", "Parsing markup", "Scoring results"). The labels are presentational pacing, not real backend progress events. When the API call resolves (success or failure), `phase` moves to `'report'` or back to `'input'` respectively.

### Rendering logic

Only one phase's UI is mounted at a time — `App.jsx` uses simple conditional rendering (`phase === 'input' && ...`) rather than hiding/showing all three with CSS, so there's exactly one obvious state to reason about at any moment. A CSS `fade-in` or `slide-up` animation plays as each phase mounts.

### Visual design and motion

The interface is designed with a premium, glassmorphic aesthetic modeled after digitalheroesco.com. It features a soft cream background, a pill-shaped input form, translucent glass cards with backdrop blurring, and a CSS-rendered 3D orb. The report results render as a sophisticated dashboard widget grid replacing the simple ruled rows, grouping metrics into distinct cards like Response Metrics, Structure, Accessibility, and Page Content & Metadata.

Motion is scoped to two moments that convey state rather than decorate it:

1. **Phase transitions** — a short fade/slide as each phase mounts.
2. **Score reveal** — numerical scores count up from 0 (`useCountUp`), such as the Page Pulse Score and the approximate word count.

Every animation is nullified under `@media (prefers-reduced-motion: reduce)`, and `useCountUp` checks the same preference in JavaScript so the number appears at its final value instead of animating. Icons are inline SVG, so the UI depends on no icon webfont.

### Error handling

If `auditApi.auditUrl()` throws, `App.jsx` catches it, stores the message in `error` state, and returns `phase` to `'input'` so the form reappears with the error shown underneath it via `ErrorMessage`. The error is never allowed to reach an uncaught exception / unhandled promise rejection.

### API communication (`src/services/auditApi.js`)

The only file that knows the backend's base URL (`VITE_API_BASE_URL`, defaulting to `http://localhost:4000`) and how to talk to it. `auditUrl(url)`:

1. POSTs `{ url }` as JSON to `/audit`.
2. If the network request itself fails (backend unreachable), throws a clear "Could not reach the audit server." error.
3. Parses the JSON body regardless of status code.
4. If the HTTP response was not OK, throws an `Error` using the backend's `error` message (or a generic fallback).
5. Otherwise returns the parsed report.

Every other part of the frontend only ever calls `auditUrl()` — no component knows what a URL or HTTP status code even is.

## 8. API Contract

### `POST /audit`

**Request body**

```json
{ "url": "https://example.com" }
```

**Success response — `200 OK`**

```json
{
  "status": 200,
  "response_time_ms": 145,
  "page_title": "Example Domain",
  "meta_description": "Example description",
  "h1_count": 1,
  "images_missing_alt": 2,
  "approximate_word_count": 524
}
```

| Field | Type | Meaning |
|---|---|---|
| `status` | number | The HTTP status code the *target* page responded with |
| `response_time_ms` | number | Milliseconds elapsed between sending the request and receiving the response |
| `page_title` | string \| null | Contents of `<title>`, or `null` if missing/empty |
| `meta_description` | string \| null | Contents of `<meta name="description">`, or `null` if missing |
| `h1_count` | number | Number of `<h1>` elements found |
| `images_missing_alt` | number | Number of `<img>` elements with a missing or empty `alt` attribute |
| `approximate_word_count` | number | Whitespace-delimited word count of the visible body text |

**Error response — `422 Unprocessable Entity`**

```json
{ "error": "Invalid URL." }
```

or

```json
{ "error": "The website took too long to respond." }
```

or

```json
{ "error": "The provided URL does not contain an HTML page." }
```

or

```json
{ "error": "The website could not be reached." }
```

**Error response — `500 Internal Server Error`**

```json
{ "error": "Unexpected error while auditing the page." }
```

Returned only for genuinely unexpected failures (bugs), never for the four handled scenarios above.

**Example request (curl)**

```bash
curl -X POST http://localhost:4000/audit \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
```

## 9. Error Handling

| Scenario | How it's detected | Backend response | Frontend behavior |
|---|---|---|---|
| **Invalid URL** | `isValidUrl()` rejects the string before any network call (empty, unparseable, or non-http(s) protocol) | `422` — `{ "error": "Invalid URL." }` | Error shown under the input; user can edit and resubmit |
| **Timeout** | The fetcher's 8-second `AbortController` fires before the target server responds | `422` — `{ "error": "The website took too long to respond." }` | Same as above |
| **Non-HTML response** | The response's `Content-Type` header doesn't contain `text/html` | `422` — `{ "error": "The provided URL does not contain an HTML page." }` | Same as above |
| **Unreachable host** | `fetch()` rejects for any reason other than abort (DNS failure, connection refused, TLS error) | `422` — `{ "error": "The website could not be reached." }` | Same as above |
| **Unexpected parsing/server issue** | Any error that isn't one of the typed `AuditError` subclasses | `500` — generic message | Same UI path — the user still just sees a readable error message, never a crash |
| **Backend unreachable from the frontend itself** | The `fetch()` call inside `auditApi.js` throws (dev server down, CORS, network) | n/a (no HTTP response received) | "Could not reach the audit server." shown the same way |

In every case, the UI never crashes: the app returns to the input state with a message, ready for another attempt.

## 10. Testing

### Why testing exists

The parser is the one piece of code every single audit passes through, and it deals with the least predictable input in the whole system: arbitrary HTML from arbitrary websites. A regression here silently corrupts every report. Automated tests catch that immediately, locally, before it ever reaches a real user.

### Parser isolation

The tests in `backend/tests/parser.test.js` call `parseHtml()` directly with an HTML string. They do not start the Express server, make an HTTP request, or touch the network in any way — this is a pure unit test of one function.

### Fixture usage

HTML fixtures live in `backend/tests/fixtures/` as plain `.html` files:

- `valid-page.html` — a well-formed page with a title, meta description, one heading, and a mix of images with/without alt text.
- `missing-title.html` — a page with no `<title>` tag at all, to confirm optional metadata degrades gracefully.
- `malformed.html` — a page with unclosed `<h1>`, `<p>`, and `<div>` tags, to confirm the parser tolerates invalid markup.

Using static files instead of live URLs means the tests are deterministic, need no internet connection, and run in milliseconds.

### Assertions

Each test asserts every extracted field — title, description, heading count, missing-alt count, and word count (as a range, since it's explicitly an *approximate* count) — plus that parsing never throws, even for malformed or empty input.

### Test execution

```bash
cd backend
npm test
```

### Expected outcome

```
✔ parseHtml — happy path: extracts all fields from a well-formed page
✔ parseHtml — failure case: missing <title> is handled gracefully
✔ parseHtml — failure case: malformed/unclosed HTML does not throw and still extracts what it can
✔ parseHtml — edge case: empty HTML string never throws

ℹ tests 4
ℹ pass 4
ℹ fail 0
```

## 11. Design Decisions

### Decision 1: Layered architecture (api → services → parser/fetcher → utils)

**Chosen approach:** Split the backend into distinct layers with a single responsibility each — `api` only handles HTTP in/out, `services/auditService` only orchestrates, `fetcher` only fetches, `parser` only parses, `models` only shapes data, `utils` only provides shared helpers.

**Alternatives considered:** A single file/route handler that fetches, parses, and responds all in one function. This is faster to write initially but every concern becomes entangled — testing the parser would require mocking HTTP, and changing the timeout logic risks touching parsing code by accident.

**Why this fits:** Separation of concerns keeps each module small and independently understandable. It also directly enables Decision 2 below — the parser can only be tested in true isolation because it doesn't know about HTTP, Express, or the network at all.

### Decision 2: Parser tested in isolation, using static fixtures

**Chosen approach:** Test `parseHtml()` directly with hardcoded HTML strings stored as fixture files, rather than testing the audit flow end-to-end against real websites.

**Alternatives considered:** Integration tests that hit real or mocked live URLs. These are more "realistic" but introduce network flakiness, slow test runs, and non-determinism (a live site's content can change or go down, silently breaking tests that have nothing to do with the code being tested).

**Why this fits:** The parser's correctness doesn't depend on the network at all — it's a pure function of an HTML string. Testing it that way gives deterministic, reproducible, fast results, and isolates failures to the parsing logic itself rather than external infrastructure.

### Decision 3: Consistent JSON error responses across every failure mode

**Chosen approach:** Every backend failure — regardless of cause — resolves to the same `{ "error": "<human-readable message>" }` shape, thrown as a typed `AuditError` subclass and caught once in the route handler.

**Alternatives considered:** Returning different error shapes per failure type (e.g. validation errors as a list of field errors, timeouts as a different structure), or letting unhandled exceptions produce Express's default HTML error page.

**Why this fits:** A single, predictable error contract means the frontend needs exactly one code path to handle *any* failure (`ErrorMessage` just renders `err.message`), with no special-casing per error type. It also guarantees the API never leaks a raw stack trace to a client, satisfying the requirement that the application "never crashes and always returns meaningful responses."

### Decision 4: The Page Pulse Score is computed on the frontend, not the backend

**Chosen approach:** Derive the 0–100 summary score in `frontend/src/utils/score.js` from the fields the API already returns, leaving the documented API contract untouched.

**Alternatives considered:** Returning a `score` field from `POST /audit`. That would make the score authoritative and available to any future API consumer, but it also bakes a subjective weighting (how much is a missing alt attribute "worth"?) into the data contract, and every tweak to the weighting becomes a breaking API change.

**Why this fits:** The score is a presentation aid — a way to give the user an instant read before they scan the details — not a measurement. Keeping it in the display layer means the API continues to report only facts it actually observed, the weighting can be adjusted freely without touching or re-testing the backend, and the parser tests stay focused on extraction correctness.

### Decision 5: Motion built on CSS with a JavaScript-free fallback, no animation library

**Chosen approach:** Implement all motion with CSS keyframes and transitions, plus one ~25-line `useCountUp` hook using `requestAnimationFrame`. Honor `prefers-reduced-motion` in both CSS (a global override) and JavaScript (the hook sets the final value immediately).

**Alternatives considered:** An animation library such as Framer Motion or GSAP. Both are excellent, but they would add a runtime dependency an order of magnitude larger than the animation actually needed here, for effects — fades, a count-up, a staggered list — that CSS expresses natively.

**Why this fits:** The animation requirements are modest and declarative, so CSS is the right tool and the bundle stays small. Handling reduced motion in both layers matters because a CSS-only override cannot stop a `requestAnimationFrame` loop; checking the preference in the hook as well means motion-sensitive users genuinely get a static interface rather than a visually-frozen but still-running animation.

## 12. Running the Project

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer (Node 20+ recommended; this project was built and tested on Node 24). Node bundles `npm`, so no separate install is needed.

### Backend setup

```bash
cd backend
npm install
```

### Frontend setup

```bash
cd frontend
npm install
```

### Starting the backend

```bash
cd backend
npm run dev
```

You should see:

```
Page Pulse backend listening on port 4000
```

The API is now available at `http://localhost:4000`.

### Starting the frontend

In a second terminal:

```bash
cd frontend
npm run dev
```

You should see Vite print a local URL, typically:

```
➜  Local:   http://localhost:5173/
```

### Opening the application

Open `http://localhost:5173` in a browser. Enter a URL (e.g. `example.com`) and click **Run audit**.

### Running tests

```bash
cd backend
npm test
```

### Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Frontend shows "Could not reach the audit server." | Backend isn't running, or is running on a different port | Confirm `npm run dev` is running in `backend/` and listening on port 4000 |
| `EADDRINUSE: address already in use :::4000` | A previous backend process is still running | Stop the old process, or change the `PORT` environment variable |
| Every audit returns "The website took too long to respond." | The target site is genuinely slow/unreachable, or you're offline | Try a known-fast site like `https://example.com`; check your internet connection |
| `npm test` reports 0 tests found | Running from the wrong directory | Make sure you're in `backend/` — tests live in `backend/tests/` |
| CORS errors in the browser console | Frontend is pointed at a different backend origin than the one running | Set `VITE_API_BASE_URL` in `frontend/.env` to match the backend's actual address |

## 13. File-by-File Explanation

### Backend

**`backend/src/server.js`**
- **Purpose:** Application entry point.
- **Responsibilities:** Create the Express app, enable CORS and JSON body parsing, mount the audit routes, define a catch-all 404 handler, and start listening on `PORT` (default `4000`).
- **Imports:** `express`, `cors`, `./api/auditRoutes.js`.
- **Exports:** Nothing (it's an entry point, run directly).
- **Interacts with:** Everything, indirectly, by mounting the router.

**`backend/src/api/auditRoutes.js`**
- **Purpose:** HTTP layer for the `/audit` endpoint.
- **Responsibilities:** Read `req.body.url`, call `runAudit`, map the outcome to an HTTP status and JSON body.
- **Imports:** `express.Router`, `runAudit` (from `auditService`), `buildErrorResponse` (from `auditModels`), `AuditError` (from `utils/errors`).
- **Exports:** An Express `Router` instance (default export).
- **Interacts with:** `services/auditService.js`, `models/auditModels.js`, `utils/errors.js`.

**`backend/src/services/auditService.js`**
- **Purpose:** Orchestrate a single audit end-to-end.
- **Responsibilities:** Validate the URL, delegate fetching and parsing, assemble the final response object.
- **Imports:** `isValidUrl`, `InvalidUrlError`, `fetchPage`, `parseHtml`, `buildAuditResponse`.
- **Exports:** `runAudit(url)`.
- **Interacts with:** `utils/urlValidator.js`, `utils/errors.js`, `services/fetcher/index.js`, `services/parser/index.js`, `models/auditModels.js`.

**`backend/src/services/fetcher/index.js`**
- **Purpose:** Perform the actual network request to the target URL.
- **Responsibilities:** Timeout handling (8s abort), response timing, content-type verification, reading the HTML body.
- **Imports:** `TimeoutError`, `NonHtmlError`, `UnreachableError` (from `utils/errors`).
- **Exports:** `fetchPage(url)` → `{ html, status, responseTimeMs }`.
- **Interacts with:** `utils/errors.js`; called by `services/auditService.js`.

**`backend/src/services/parser/index.js`**
- **Purpose:** Extract structured data from raw HTML.
- **Responsibilities:** Title, meta description, `<h1>` count, missing-alt image count, approximate word count.
- **Imports:** `cheerio`.
- **Exports:** `parseHtml(html)` → an object with the five extracted fields.
- **Interacts with:** Called by `services/auditService.js` and directly by `tests/parser.test.js`.

**`backend/src/models/auditModels.js`**
- **Purpose:** Define the exact shape of API responses.
- **Responsibilities:** Build the success response object; build the error response object.
- **Imports:** None.
- **Exports:** `buildAuditResponse({ status, responseTimeMs, parsed })`, `buildErrorResponse(message)`.
- **Interacts with:** Used by `services/auditService.js` (success shape) and `api/auditRoutes.js` (error shape).

**`backend/src/utils/urlValidator.js`**
- **Purpose:** Decide whether a string is a usable, auditable URL.
- **Responsibilities:** Reject empty strings, unparseable strings, and non-`http(s)` protocols.
- **Imports:** None (uses the built-in `URL` global).
- **Exports:** `isValidUrl(candidate)` → boolean.
- **Interacts with:** Used by `services/auditService.js`.

**`backend/src/utils/errors.js`**
- **Purpose:** Define the vocabulary of "things that can go wrong" as typed, user-facing errors.
- **Responsibilities:** Provide `AuditError` and its four subclasses, each with a fixed, friendly message.
- **Imports:** None.
- **Exports:** `AuditError`, `InvalidUrlError`, `TimeoutError`, `NonHtmlError`, `UnreachableError`.
- **Interacts with:** Thrown by `services/auditService.js` and `services/fetcher/index.js`; caught by `api/auditRoutes.js`.

**`backend/tests/parser.test.js`**
- **Purpose:** Automated correctness tests for the parser.
- **Responsibilities:** Happy-path, missing-title, malformed-HTML, and empty-string test cases.
- **Imports:** `node:test`, `node:assert/strict`, `node:fs`, `node:path`, `node:url`, `parseHtml`.
- **Exports:** None (a test file, run via `node --test`).
- **Interacts with:** `services/parser/index.js`, `tests/fixtures/*.html`.

**`backend/tests/fixtures/*.html`**
- **Purpose:** Deterministic, static input for the parser tests.
- **Responsibilities:** Represent a well-formed page, a page missing its title, and a page with broken/unclosed markup.
- **Interacts with:** Loaded by `tests/parser.test.js`.

### Frontend

**`frontend/src/main.jsx`**
- **Purpose:** React application entry point.
- **Responsibilities:** Mount `<App />` into the `#root` DOM node inside `React.StrictMode`.
- **Imports:** `react-dom/client`, `./index.css`, `./App.jsx`.
- **Exports:** None (entry point).

**`frontend/src/App.jsx`**
- **Purpose:** Top-level component; owns all application state and composes every other component.
- **Responsibilities:** Track the current URL input, the current phase (`input`/`loading`/`report`), the current error, and the current report; call `auditUrl()` on submit; pass state and callbacks down as props.
- **Imports:** `Header`, `Footer`, `UrlInput`, `Loading`, `ErrorMessage`, `AuditReport`, `auditUrl`, `./App.css`.
- **Exports:** `App` (default export).
- **Interacts with:** Every component in `src/components/`, and `services/auditApi.js`.

**`frontend/src/components/Header.jsx`**
- **Purpose:** Static top bar showing the app name.
- **Responsibilities:** Render the "Page Pulse" wordmark and the "URL Audit Tool" descriptor.
- **Imports/Exports:** None besides the default component export.

**`frontend/src/components/UrlInput.jsx`**
- **Purpose:** Collect a URL from the user.
- **Responsibilities:** Render a prominent, pill-shaped input row with an integrated "Audit Now" button; call `onSubmit` on form submission.
- **Props:** `value`, `onChange`, `onSubmit`, `disabled`.
- **Interacts with:** Controlled entirely by `App.jsx`'s state.

**`frontend/src/components/Loading.jsx`**
- **Purpose:** Displayed while an audit is in flight.
- **Responsibilities:** Render an indeterminate progress rule and a cycling stage label; skip the cycling entirely when the user prefers reduced motion.
- **Props:** None.

**`frontend/src/components/ErrorMessage.jsx`**
- **Purpose:** Displayed when an audit fails.
- **Responsibilities:** Render an inline SVG warning icon and the error message passed in, or nothing at all if there is no error.
- **Props:** `message`.

**`frontend/src/components/AuditReport.jsx`**
- **Purpose:** Displayed after a successful audit.
- **Responsibilities:** Renders a modern grid dashboard consisting of a Page Pulse Score card and focused metric cards for Response Metrics, Structure, Accessibility, and Page Content & Metadata.
- **Props:** `report`, `targetUrl`, `onReset`.
- **Interacts with:** `hooks/useCountUp.js`, `utils/score.js`, and the `report` object returned by the backend via `auditApi.js`.

**`frontend/src/components/Footer.jsx`**
- **Purpose:** Static footer.
- **Responsibilities:** Render the attribution link to the Digital Heroes site.
- **Props:** None.

**`frontend/src/hooks/useCountUp.js`**
- **Purpose:** Animate a number from 0 up to a target value.
- **Responsibilities:** Drive the count with `requestAnimationFrame` and an ease-out-quint curve; return the target immediately if the user prefers reduced motion; cancel the frame on unmount.
- **Exports:** `useCountUp(target, { duration })` → the current number.
- **Interacts with:** Used by `components/AuditReport.jsx`.

**`frontend/src/utils/score.js`**
- **Purpose:** Turn a report into a single summary score.
- **Responsibilities:** `computeScore(report)` starts at 100 and deducts for a non-2xx status, slow responses, an `h1` count other than 1, a missing title or description, and each image missing alt text (capped), clamped to 0–100. `scoreBand(score)` maps that number to a label and the CSS variable for its color.
- **Exports:** `computeScore(report)`, `scoreBand(score)`.
- **Interacts with:** Used by `components/AuditReport.jsx`. Pure functions — no React, no network.

**`frontend/src/services/auditApi.js`**
- **Purpose:** The single point of contact with the backend API.
- **Responsibilities:** Build and send the `POST /audit` request, parse the JSON response, and throw a plain `Error` with a readable message on any failure (network failure or non-OK HTTP status).
- **Exports:** `auditUrl(url)`.
- **Interacts with:** Called only from `App.jsx`.

**`frontend/src/index.css`**
- **Purpose:** Global design tokens and resets.
- **Responsibilities:** Define the soft cream background, dark green accents, font families (`Geist`/`Inter`), box-sizing resets, and the global `prefers-reduced-motion` override that disables all animation and transition.

**`frontend/src/App.css`**
- **Purpose:** Layout and component styling for the whole app.
- **Responsibilities:** Applies the glassmorphic aesthetic (backdrop blurs, translucent cards, soft shadows), styles the CSS-rendered 3D orb in the hero section, the feature grid, the pill-shaped URL form, and the report dashboard layout.

## 14. Glossary

- **API (Application Programming Interface):** A defined way for one piece of software to ask another for something — here, the way the frontend asks the backend to audit a URL.
- **HTTP (Hypertext Transfer Protocol):** The protocol web browsers and servers use to exchange requests and responses over the internet.
- **JSON (JavaScript Object Notation):** A lightweight, text-based format for structuring data (like `{ "key": "value" }`) that both the backend and frontend can read and write.
- **DOM (Document Object Model):** A tree-shaped in-memory representation of an HTML document, used to find and read specific elements (like all `<h1>` tags).
- **HTML (HyperText Markup Language):** The markup language used to structure web pages.
- **Endpoint:** A specific URL path a server listens on for requests — this project has one: `POST /audit`.
- **Request:** The message a client (the frontend, or `curl`) sends to a server, asking it to do something.
- **Response:** The message a server sends back after handling a request.
- **Parser:** Code that reads text in some format (here, HTML) and turns it into structured, queryable data.
- **Metadata:** Data *about* the page, rather than the page's visible content — e.g. its `<title>` or meta description.
- **Fixture:** A fixed, static piece of test data (here, an `.html` file) used to produce predictable test results.
- **Assertion:** A statement in a test that something must be true (e.g. "the title must equal X"); if it isn't, the test fails.
- **Unit Test:** A test that exercises one small piece of code (here, a single function) in isolation from the rest of the system.
- **Module:** A single file of code with its own imports and exports — the basic unit of organization in this project's backend and frontend.
- **Component:** A self-contained, reusable piece of a React UI that renders based on the props and state it's given.
- **Hook:** A React function (prefixed `use...`) that lets a component use stateful behavior — here, `useCountUp` animates a number over time.
- **Design token:** A named value (a color, a font, a spacing step) defined once as a CSS custom property and reused everywhere, so the whole interface can be adjusted from one place.
- **`prefers-reduced-motion`:** A setting users can enable in their operating system to request less animation, usually because motion causes them discomfort. Well-built interfaces detect it and disable animation accordingly.

## 15. Known Limitations

- **Client-rendered (SPA) pages report low or zero counts.** The fetcher retrieves only the raw HTML a server sends — it does not execute JavaScript. For a page built with a client-side framework (e.g. a React or Vue app that renders its content in the browser after load), the raw HTML may be little more than `<div id="root"></div>`, so `h1_count` and `approximate_word_count` will correctly report `0` even though a real browser would show a full page. `page_title` and `meta_description` are unaffected, since those typically live in the static `<head>` regardless of how the page renders its body. Supporting this properly would require executing the page's JavaScript via a headless browser (e.g. Playwright), which was a deliberate scope decision to leave out — it adds a much heavier dependency and significantly slower per-audit latency for a capability outside this project's original requirements.

- **The Page Pulse Score is indicative, not authoritative.** Its weightings (see [Decision 4](#11-design-decisions)) are a reasonable heuristic chosen for this project, not an industry standard, and it inherits the limitation above: a client-rendered page will score lower because the metrics it is built from legitimately read as zero. The individual fields in the report are the real measurements; the score is a convenience summary layered on top of them.
