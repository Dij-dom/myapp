# **App Name**: MingAI

## Core Features:

- Task Input: Allow users to input up to 5 tasks nightly for personal improvement.
- AI Task Refinement: Refine user-defined tasks into practical micro-tasks using Google Gemini, generating JSON output and asking clarification questions when needed using a tool.
- Suggestion Review: Enable users to approve, edit, or reject Gemini's suggested micro-tasks via swipeable cards.
- Finalized Task List: Display approved tasks in a finalized list, saved to Firestore with a 'finalized' status.
- Daily Review: Prompt users to review completed and missed tasks, capturing reasons for missed tasks for targeted suggestions. Shows yesterday's plan.
- Targeted Suggestions: Uses failed tasks + reasons to provide users more accurate suggestions. Stores raw Gemini JSON for debugging.
- Local Notifications: Schedule bedtime reminders and morning check-ins using local notifications.

## Style Guidelines:

- Primary color: Light, muted blue (#90AFC5) for a calming and reflective ambiance.
- Background color: Very light gray (#F0F4F7), almost white, for a clean and unobtrusive backdrop.
- Accent color: Warm, saturated orange (#D9534F) to highlight calls to action and important elements, drawing the eye.
- Body and headline font: 'PT Sans' (sans-serif) provides a modern yet approachable aesthetic for all text elements.
- Use simple, minimalist icons for task categories and actions.
- Clean, card-based layout with clear separation between sections for improved readability and usability.
- Subtle animations for task transitions and confirmations.