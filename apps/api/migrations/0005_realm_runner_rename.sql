-- Rename Relic Runner copy introduced by earlier rebrand migrations.

UPDATE forms
SET
  title = REPLACE(title, 'Relic Runner', 'Realm Runner'),
  description = REPLACE(description, 'Relic Runner', 'Realm Runner')
WHERE title LIKE '%Relic Runner%'
   OR description LIKE '%Relic Runner%';

UPDATE responses
SET data = REPLACE(data, 'relic sprint', 'realm sprint')
WHERE data LIKE '%relic sprint%';