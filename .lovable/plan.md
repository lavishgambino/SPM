## Goal
Make **New Chat** consistently open the **10 Day Execution Snapshot** and prevent the app from snapping back to the old starter chat.

## What I’ll change
1. **Fix startup redirect behavior**
   - Update the boot redirect in `src/App.tsx` so it only forces the starter chat on true first-entry cases.
   - Prevent it from overriding valid routes like `/projects/2/chat/14` after New Chat navigation or refresh.

2. **Keep New Chat routing consistent everywhere**
   - Verify and preserve the existing `revealChat14() + navigate('/projects/2/chat/14')` behavior across all sidebar entry points.
   - Remove any remaining route/state logic that can send users back to chat 11 unexpectedly.

3. **Validate the destination screen behavior**
   - Confirm chat 14 renders the screenshot-aligned execution snapshot state.
   - Verify the sidebar recent item and monitor section stay visible once New Chat has been triggered.

## Technical details
- Files likely involved:
  - `src/App.tsx`
  - `src/pages/Conversation.tsx`
  - possibly any page still wiring `onNewChat`
- Root issue appears to be app-level route reset logic, not the sidebar button itself.
- I’ll verify the fix by reproducing from `/projects/2/chat/11`, clicking **New Chat**, and checking refresh/direct-load behavior for `/projects/2/chat/14`.

## Expected result
- Clicking **New Chat** opens `/projects/2/chat/14`.
- Refreshing or directly loading that route keeps the user on the execution snapshot.
- The screen matches the uploaded reference: **“Hi Mary / Welcome back”** with the monitoring/replanning cards.