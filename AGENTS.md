# SwiftDrop agent instructions

SwiftDrop is a full-stack delivery platform (assessment project) with three roles: CUSTOMER, RIDER, ADMIN.
Repo: Devfreedom/swiftdrop. Live frontend: https://swiftdrop-liart.vercel.app/

## Stack and layout
- backend/: Node.js, Express, PostgreSQL, Sequelize (CLI migrations and seeders), JWT, bcrypt. Routes are under the /api prefix. Hosted on Render; database on Neon.
- frontend/: React + Vite + React Router, plain CSS tokens (no UI framework), lucide-react icons. Hosted on Vercel. The API base URL comes from VITE_API_URL; never hardcode localhost or a second base URL.
- Render's start command runs `npx sequelize-cli db:migrate && npm start`, so a broken migration takes the live API down. Migrations must be additive and tested up and down locally.
- Read the existing code and follow its style before changing anything.

## Domain rules (do not break)
- Delivery statuses: PENDING, CONFIRMED, ASSIGNED, PICKED_UP, IN_TRANSIT, DELIVERED, CANCELLED. Only valid transitions; DELIVERED and CANCELLED are final; cancelling is allowed only before pickup.
- Rider availability: AVAILABLE, BUSY, OFFLINE. Only AVAILABLE riders can be assigned; assigning sets BUSY; finishing or cancelling frees them.
- Account status: ACTIVE, INACTIVE, SUSPENDED. INACTIVE and SUSPENDED users cannot log in or use the API. Rider signups start INACTIVE until an admin approves.
- Payments: CASH, CARD, TRANSFER; statuses PENDING, SUCCESSFUL, FAILED, REFUNDED. No real payment gateway. Cash stays PENDING until an admin confirms. Delivery price is calculated on the backend, never typed by the customer.
- Public registration may create only CUSTOMER or RIDER, never ADMIN.
- Location sharing (GPS) is opt-in, only during active deliveries, visible only to that delivery's customer, rider and admins, and deleted when the delivery ends.

## Product honesty
- Never invent statistics, customer counts, cities, partner logos, awards or features. Numbers shown must come from real data or be true facts. If a stats request fails, hide the section; never show raw errors on public pages.
- Do not claim live GPS or real-time tracking in copy unless that feature is merged and working.
- Illustrative mockups are labeled "Example".
- Do not copy other companies' text, images, logos or trademarks. Inspiration only.
- Images: free-license sources only (Unsplash, Pexels, Pixabay), downloaded locally as WebP under about 80 KB, listed in frontend/public/images/CREDITS.md, no watermarks, brand logos or identifiable people. Show me candidates and wait for my choice before using any.

## Design system
- Brand name constant: BRAND = "SwiftDrop". Support details live in one constants file (SUPPORT_EMAIL, SUPPORT_PHONE); hide the phone line if empty.
- Brand red #D32F2F (hover #B71C1C), dark #080808, cream #F9F6F0, red band #C1272D. Logo: tilted dark navy tile (#0A1220) with a cyan (#5EEAD4) truck icon, identical everywhere.
- Headlines: Fraunces (serif) with one italic accent word; body: Inter. Minimum 12px text. WCAG AA contrast (4.5:1).
- Money is formatted with the ₦ symbol (for example ₦2,500). Dates like "Oct 9, 2026". Tracking IDs like DEL-0009.
- Use CSS variables and the shared components (Button, Input, Card, Badge, StatusBadge, Stepper, DataTable, Modal, Toast, Skeleton, EmptyState). Do not add one-off styles where a token or component exists.
- Animate only transform and opacity. Run looping animations only while visible and the tab is active. Respect prefers-reduced-motion (static frame; decorative illustrations stay visible but still). Everything must work at 360px and 1440px with no horizontal overflow.
- Accessibility: semantic HTML, visible focus rings, aria-labels on icon buttons, keyboard-operable controls.

## Workflow rules
- Work only on the current branch. Never commit to main, never push, merge, rebase or force anything unless I explicitly ask.
- Never read, print, edit or commit .env files or any secret. Tell me which variables I need to set myself. Do not run anything against the hosted database; give me the commands instead.
- Make only the changes I ask for. For a bug fix, change nothing else. For a large task, show a short plan first and wait for my "go".
- Before saying you are done: run `npm run build` and lint in the changed app, run backend tests (`npm test` in backend/) if backend code changed, review your final git diff, remove anything unrelated, and list every changed file with a one-line reason.
- Report honestly what you verified and what you could not (for example real phone GPS, or behavior only visible in a browser). Never claim something works if you didn't test it.
- Do not add dependencies without telling me first.
- Keep code simple and commented briefly: I must explain it in class.