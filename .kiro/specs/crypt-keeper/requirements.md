# Requirements: Crypt Keeper

## Introduction
Crypt Keeper is a browser app where each deadline is a ghost in a graveyard scene. The closer the deadline, the closer the ghost gets to the Keeper's lantern. Finishing a task banishes its ghost.

## Requirements

### 1. Summon and manage ghosts
**User story:** As a student, I want to add, edit and delete deadlines, so that I can track everything in one place.

Acceptance criteria
1. WHEN the user submits the form with a non-empty name and a valid due date THEN the system SHALL create a ghost with that name, course, due date, effort (1 to 5) and notes.
2. WHEN the name is empty THEN the system SHALL block saving and show an error.
3. WHEN the user presses N outside a text field THEN the system SHALL open the summon form.
4. WHEN the user edits a ghost THEN the system SHALL keep its id and creation time.
5. WHEN the user deletes a ghost THEN the system SHALL ask for confirmation first.

### 2. Time pressure is visible
**User story:** As a student, I want urgency to be obvious at a glance, so that I act on the right task.

Acceptance criteria
1. The system SHALL compute urgency from the time left and the effort level. Higher effort starts the haunt earlier (7 days at effort 1, 15 days at effort 5).
2. The graveyard SHALL place a ghost closer to the lantern as urgency rises.
3. The ghost mood SHALL be calm, uneasy (urgency above 0.5), angry (under 24 hours) or wraith (past due).
4. WHEN a deadline passes THEN the ghost SHALL become a wraith without a page reload, because the clock refreshes on an interval.
5. The system SHALL show sanity (0 to 100) that drops with wraiths and ghosts due soon.

### 3. Banish and recover
**User story:** As a student, I want to mark work done and feel progress.

Acceptance criteria
1. WHEN the user banishes a ghost THEN the system SHALL play a dissolve animation, record the completion time and move it to Tombstones.
2. WHEN a ghost is banished THEN the system SHALL offer an Undo for six seconds.
3. The user SHALL be able to revive a banished ghost from Tombstones.
4. The system SHALL show a rank based on total banished ghosts and a day streak based on consecutive days with a banishing.

### 4. Alternative views
Acceptance criteria
1. The Ledger SHALL list active ghosts grouped into overdue, today, this week and later, sorted by due time.
2. Tombstones SHALL list banished ghosts, newest first, and mark whether each was banished in time.
3. The user SHALL be able to filter every view by course.

### 5. Data ownership
Acceptance criteria
1. The system SHALL persist data in localStorage and restore it on load.
2. The system SHALL export a JSON backup and import it again.
3. WHEN an imported or stored file has an invalid shape THEN the system SHALL reject it or drop invalid entries without crashing.
4. The system SHALL export active deadlines as an .ics calendar file with a 24 hour alarm.

### 6. Atmosphere with consent
Acceptance criteria
1. Sound effects and ambient audio SHALL be generated in the browser and be toggleable.
2. Browser notifications SHALL only be requested after the user turns them on, and SHALL fire once per ghost per stage (within 24 hours, overdue).
3. WHEN the user prefers reduced motion THEN animations SHALL be effectively disabled.
4. All interactive elements SHALL be keyboard reachable and have visible focus.
