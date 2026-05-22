-- Update seeded copy after the FormVerse / Realm Runner rebrand.

UPDATE forms
SET
  title = REPLACE(title, 'Temple Run', 'Realm Runner'),
  description = REPLACE(description, 'Temple Run', 'Realm Runner')
WHERE title LIKE '%Temple Run%'
   OR description LIKE '%Temple Run%';

UPDATE forms
SET
  title = REPLACE(title, 'Form Quest', 'FormVerse'),
  description = REPLACE(description, 'Form Quest', 'FormVerse')
WHERE title LIKE '%Form Quest%'
   OR description LIKE '%Form Quest%';