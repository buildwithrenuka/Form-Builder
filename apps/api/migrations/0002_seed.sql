-- ─────────────────────────────────────────────────────────────────────────────
-- 0002_seed.sql  –  Demo data for hackathon judges
-- Demo login: demo@formverse.io / Demo1234!
-- ─────────────────────────────────────────────────────────────────────────────

-- Demo creator account  (password hash is for "Demo1234!" using bcrypt-style,
-- but since we use JWT we just need the user record to exist for the demo)
INSERT OR IGNORE INTO users (id, email, name, passwordHash, createdAt)
VALUES (
  'demo-user-formverse-01',
  'demo@formverse.io',
  'Demo Creator',
  '$2b$10$demoHashPlaceholderNotRealBcryptXXXXXXXXXXXXXXX',
  '2025-01-01T00:00:00.000Z'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Form 1: Temple Run – Quest Registration
-- ─────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO forms (id, creatorId, title, description, slug, visibility, published, schema, worldTheme, createdAt, updatedAt)
VALUES (
  'form-temple-quest-01',
  'demo-user-formverse-01',
  'Temple Quest Registration',
  'Register your hero for the grand temple expedition. Fill out your adventurer profile and gear preferences.',
  'temple-quest-registration-xxxxxx',
  'public',
  1,
  '[
    {"id":"f1","type":"text","label":"Hero Name","placeholder":"Your adventurer name","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":50,"min":0,"max":5,"sectionColor":"#f97316","sectionDescription":""},
    {"id":"f2","type":"select","label":"Class","placeholder":"Choose class","required":true,"fieldWidth":"half","hidden":false,"options":["Warrior","Mage","Rogue","Ranger","Cleric"],"prefix":"","suffix":"","helperText":"Your combat specialization","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#f97316","sectionDescription":""},
    {"id":"f3","type":"email","label":"Email","placeholder":"hero@adventure.com","required":true,"fieldWidth":"full","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"We will send your quest brief here","validationPreset":"email","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#f97316","sectionDescription":""},
    {"id":"f4","type":"section_divider","label":"Quest Details","placeholder":"","required":false,"fieldWidth":"full","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#f97316","sectionDescription":"Choose your mission parameters"},
    {"id":"f5","type":"radio","label":"Quest Difficulty","placeholder":"","required":true,"fieldWidth":"full","hidden":false,"options":["Novice","Intermediate","Expert","Legendary"],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#f97316","sectionDescription":""},
    {"id":"f6","type":"rating","label":"Experience Level","placeholder":"","required":false,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"Rate your combat experience (1-5)","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":1,"max":5,"sectionColor":"#f97316","sectionDescription":""},
    {"id":"f7","type":"textarea","label":"Special Skills","placeholder":"List your unique abilities...","required":false,"fieldWidth":"full","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":500,"min":0,"max":5,"sectionColor":"#f97316","sectionDescription":""},
    {"id":"f8","type":"checkbox","label":"Team Participation","placeholder":"","required":false,"fieldWidth":"full","hidden":false,"options":["Solo Mission","Join a Party","Open to Recruitment","Team Leader"],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#f97316","sectionDescription":""}
  ]',
  'temple-run',
  '2025-01-15T10:00:00.000Z',
  '2025-01-15T10:00:00.000Z'
);

-- Seeded responses for Form 1
INSERT OR IGNORE INTO responses (id, formId, data, ipHash, submittedAt) VALUES
('resp-t-001', 'form-temple-quest-01', '{"f1":"Aria Shadowblade","f2":"Rogue","f3":"aria@shadow.io","f5":"Expert","f6":5,"f7":"Dual wielding, stealth assassinations","f8":["Solo Mission"]}', 'hash001', '2025-01-16T08:23:00.000Z'),
('resp-t-002', 'form-temple-quest-01', '{"f1":"Thorin Ironforge","f2":"Warrior","f3":"thorin@forge.com","f5":"Legendary","f6":5,"f7":"Shield wall, berserker rage","f8":["Team Leader","Join a Party"]}', 'hash002', '2025-01-16T09:45:00.000Z'),
('resp-t-003', 'form-temple-quest-01', '{"f1":"Luna Starweave","f2":"Mage","f3":"luna@stars.net","f5":"Intermediate","f6":3,"f7":"Frost magic, time manipulation","f8":["Open to Recruitment"]}', 'hash003', '2025-01-16T11:02:00.000Z'),
('resp-t-004', 'form-temple-quest-01', '{"f1":"Ragnar Stormcaller","f2":"Ranger","f3":"ragnar@storm.dk","f5":"Expert","f6":4,"f7":"Longbow mastery, animal companion","f8":["Solo Mission","Open to Recruitment"]}', 'hash004', '2025-01-17T07:15:00.000Z'),
('resp-t-005', 'form-temple-quest-01', '{"f1":"Seraphina Light","f2":"Cleric","f3":"sera@light.org","f5":"Novice","f6":2,"f7":"Healing aura, divine smite","f8":["Join a Party"]}', 'hash005', '2025-01-17T13:30:00.000Z'),
('resp-t-006', 'form-temple-quest-01', '{"f1":"Zephyr Windwalker","f2":"Rogue","f3":"zephyr@wind.co","f5":"Expert","f6":4,"f7":"Parkour, lockpicking, disguise","f8":["Solo Mission"]}', 'hash006', '2025-01-18T10:00:00.000Z'),
('resp-t-007', 'form-temple-quest-01', '{"f1":"Mortis Darkbane","f2":"Mage","f3":"mortis@dark.net","f5":"Legendary","f6":5,"f7":"Necromancy, shadow portals","f8":["Team Leader"]}', 'hash007', '2025-01-18T14:22:00.000Z'),
('resp-t-008', 'form-temple-quest-01', '{"f1":"Celeste Aurora","f2":"Cleric","f3":"celeste@aurora.io","f5":"Intermediate","f6":3,"f7":"Mass heal, divine shield","f8":["Join a Party","Open to Recruitment"]}', 'hash008', '2025-01-19T09:11:00.000Z'),
('resp-t-009', 'form-temple-quest-01', '{"f1":"Drake Ironstone","f2":"Warrior","f3":"drake@iron.com","f5":"Expert","f6":4,"f7":"Two-handed greatsword, fortress stance","f8":["Team Leader"]}', 'hash009', '2025-01-19T16:45:00.000Z'),
('resp-t-010', 'form-temple-quest-01', '{"f1":"Lyra Moonwhisper","f2":"Ranger","f3":"lyra@moon.elf","f5":"Intermediate","f6":3,"f7":"Archery, nature magic, tracking","f8":["Open to Recruitment","Solo Mission"]}', 'hash010', '2025-01-20T11:00:00.000Z');

-- ─────────────────────────────────────────────────────────────────────────────
-- Form 2: Globe – Japan Visa Application
-- ─────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO forms (id, creatorId, title, description, slug, visibility, published, schema, worldTheme, createdAt, updatedAt)
VALUES (
  'form-globe-japan-01',
  'demo-user-formverse-01',
  'Japan Visa Application',
  'Collect traveler information for a Japan tourist visa application. Includes passport details, travel dates, and emergency contacts.',
  'japan-visa-application-yyyyyy',
  'public',
  1,
  '[
    {"id":"g1","type":"text","label":"Full Name (as in passport)","placeholder":"SURNAME Given Name","required":true,"fieldWidth":"full","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"Enter exactly as shown on your passport","validationPreset":"none","customPattern":"","errorMessage":"","minLength":2,"maxLength":80,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""},
    {"id":"g2","type":"text","label":"Passport Number","placeholder":"A12345678","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"🛂","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":20,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""},
    {"id":"g3","type":"date","label":"Passport Expiry Date","placeholder":"","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"Must be valid for 6+ months beyond travel","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""},
    {"id":"g4","type":"select","label":"Nationality","placeholder":"Select country","required":true,"fieldWidth":"half","hidden":false,"options":["Indian","American","British","Australian","Canadian","German","French","Brazilian","Nigerian","South Korean"],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""},
    {"id":"g5","type":"email","label":"Email Address","placeholder":"traveler@email.com","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"email","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""},
    {"id":"g6","type":"section_divider","label":"Travel Details","placeholder":"","required":false,"fieldWidth":"full","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":"Itinerary and accommodation"},
    {"id":"g7","type":"date","label":"Arrival Date","placeholder":"","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""},
    {"id":"g8","type":"date","label":"Departure Date","placeholder":"","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""},
    {"id":"g9","type":"text","label":"Hotel / Accommodation","placeholder":"Hotel name or host address","required":true,"fieldWidth":"full","hidden":false,"options":[],"prefix":"🏨","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":200,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""},
    {"id":"g10","type":"radio","label":"Visit Purpose","placeholder":"","required":true,"fieldWidth":"full","hidden":false,"options":["Tourism","Business","Cultural Exchange","Family Visit","Education"],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#c9a84c","sectionDescription":""}
  ]',
  'globe',
  '2025-02-01T09:00:00.000Z',
  '2025-02-01T09:00:00.000Z'
);

-- Seeded responses for Form 2
INSERT OR IGNORE INTO responses (id, formId, data, ipHash, submittedAt) VALUES
('resp-g-001', 'form-globe-japan-01', '{"g1":"SHARMA Priya","g2":"P1234567","g3":"2027-06-15","g4":"Indian","g5":"priya.sharma@gmail.com","g7":"2025-04-10","g8":"2025-04-25","g9":"APA Hotel Shinjuku","g10":"Tourism"}', 'hash101', '2025-02-05T10:00:00.000Z'),
('resp-g-002', 'form-globe-japan-01', '{"g1":"JOHNSON Michael","g2":"US987654","g3":"2026-12-01","g4":"American","g5":"m.johnson@yahoo.com","g7":"2025-05-01","g8":"2025-05-14","g9":"Dormy Inn Kyoto","g10":"Tourism"}', 'hash102', '2025-02-06T11:30:00.000Z'),
('resp-g-003', 'form-globe-japan-01', '{"g1":"MUELLER Hannah","g2":"DE456789","g3":"2028-03-20","g4":"German","g5":"h.mueller@web.de","g7":"2025-06-15","g8":"2025-06-22","g9":"Conference Hotel Tokyo","g10":"Business"}', 'hash103', '2025-02-07T14:00:00.000Z'),
('resp-g-004', 'form-globe-japan-01', '{"g1":"TANAKA Yuki","g2":"AU123456","g3":"2027-09-10","g4":"Australian","g5":"yuki.t@outlook.com","g7":"2025-03-20","g8":"2025-04-05","g9":"Airbnb Osaka Namba","g10":"Cultural Exchange"}', 'hash104', '2025-02-08T09:45:00.000Z'),
('resp-g-005', 'form-globe-japan-01', '{"g1":"PATEL Rajan","g2":"P9876543","g3":"2026-08-30","g4":"Indian","g5":"rajan.patel@corp.in","g7":"2025-07-10","g8":"2025-07-17","g9":"Keio Plaza Hotel","g10":"Business"}', 'hash105', '2025-02-09T16:20:00.000Z'),
('resp-g-006', 'form-globe-japan-01', '{"g1":"SMITH Emma","g2":"GB345678","g3":"2027-11-15","g4":"British","g5":"emma.smith@nhs.uk","g7":"2025-08-01","g8":"2025-08-15","g9":"Family friend Osaka","g10":"Family Visit"}', 'hash106', '2025-02-10T13:10:00.000Z'),
('resp-g-007', 'form-globe-japan-01', '{"g1":"DUBOIS Pierre","g2":"FR654321","g3":"2028-02-28","g4":"French","g5":"p.dubois@paris.fr","g7":"2025-09-05","g8":"2025-09-12","g9":"Sakura Hotel Asakusa","g10":"Tourism"}', 'hash107', '2025-02-11T10:00:00.000Z'),
('resp-g-008', 'form-globe-japan-01', '{"g1":"KIM Soo-Jin","g2":"KR112233","g3":"2027-04-01","g4":"South Korean","g5":"soojin.kim@kakao.com","g7":"2025-04-20","g8":"2025-04-30","g9":"Shinjuku capsule hotel","g10":"Tourism"}', 'hash108', '2025-02-12T08:30:00.000Z');

-- ─────────────────────────────────────────────────────────────────────────────
-- Form 3: Library – Hero Character Sheet
-- ─────────────────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO forms (id, creatorId, title, description, slug, visibility, published, schema, worldTheme, createdAt, updatedAt)
VALUES (
  'form-library-hero-01',
  'demo-user-formverse-01',
  'Hero Character Sheet',
  'Create your legendary hero profile for the Grand Library archives. Complete your backstory, skills, and magical attributes.',
  'hero-character-sheet-zzzzzz',
  'public',
  1,
  '[
    {"id":"h1","type":"text","label":"Hero Name","placeholder":"Your legendary name","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":2,"maxLength":60,"min":0,"max":5,"sectionColor":"#a855f7","sectionDescription":""},
    {"id":"h2","type":"select","label":"Archetype","placeholder":"Choose archetype","required":true,"fieldWidth":"half","hidden":false,"options":["Scholar","Guardian","Seeker","Chronicler","Oracle","Artificer"],"prefix":"","suffix":"","helperText":"Your heroic role","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#a855f7","sectionDescription":""},
    {"id":"h3","type":"section_divider","label":"Attributes","placeholder":"","required":false,"fieldWidth":"full","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#a855f7","sectionDescription":"Core character stats"},
    {"id":"h4","type":"rating","label":"Wisdom","placeholder":"","required":false,"fieldWidth":"half","hidden":false,"options":[],"prefix":"📚","suffix":"","helperText":"Knowledge and insight","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":1,"max":5,"sectionColor":"#a855f7","sectionDescription":""},
    {"id":"h5","type":"rating","label":"Courage","placeholder":"","required":false,"fieldWidth":"half","hidden":false,"options":[],"prefix":"⚔️","suffix":"","helperText":"Bravery in battle","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":1,"max":5,"sectionColor":"#a855f7","sectionDescription":""},
    {"id":"h6","type":"number","label":"Level","placeholder":"1","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"⭐","suffix":"","helperText":"1 to 100","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":1,"max":100,"sectionColor":"#a855f7","sectionDescription":""},
    {"id":"h7","type":"select","label":"Realm of Origin","placeholder":"Select realm","required":true,"fieldWidth":"half","hidden":false,"options":["Arcane Peaks","Shadow Vale","Sunlit Coast","Iron Highlands","The Void","Crystal Depths"],"prefix":"🌍","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#a855f7","sectionDescription":""},
    {"id":"h8","type":"section_divider","label":"Backstory","placeholder":"","required":false,"fieldWidth":"full","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#a855f7","sectionDescription":"Your legend"},
    {"id":"h9","type":"textarea","label":"Origin Story","placeholder":"Tell us how you became a hero...","required":false,"fieldWidth":"full","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"Max 300 words","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":1200,"min":0,"max":5,"sectionColor":"#a855f7","sectionDescription":""},
    {"id":"h10","type":"checkbox","label":"Magical Abilities","placeholder":"","required":false,"fieldWidth":"full","hidden":false,"options":["Telepathy","Pyromancy","Healing","Illusion","Time Sight","Elemental Binding","Mind Shield","Astral Projection"],"prefix":"","suffix":"","helperText":"Select all that apply","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#a855f7","sectionDescription":""},
    {"id":"h11","type":"email","label":"Chronicle Email","placeholder":"hero@library.world","required":true,"fieldWidth":"half","hidden":false,"options":[],"prefix":"","suffix":"","helperText":"Receive your archived character sheet","validationPreset":"email","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#a855f7","sectionDescription":""},
    {"id":"h12","type":"radio","label":"Join the Defenders?","placeholder":"","required":false,"fieldWidth":"half","hidden":false,"options":["Yes, I shall defend the Library","No, I walk alone","Maybe, tell me more"],"prefix":"","suffix":"","helperText":"","validationPreset":"none","customPattern":"","errorMessage":"","minLength":0,"maxLength":0,"min":0,"max":5,"sectionColor":"#a855f7","sectionDescription":""}
  ]',
  'library',
  '2025-02-15T12:00:00.000Z',
  '2025-02-15T12:00:00.000Z'
);

-- Seeded responses for Form 3
INSERT OR IGNORE INTO responses (id, formId, data, ipHash, submittedAt) VALUES
('resp-l-001', 'form-library-hero-01', '{"h1":"Eldara Moonwhisper","h2":"Oracle","h4":5,"h5":3,"h6":42,"h7":"Crystal Depths","h9":"Born under a lunar eclipse, Eldara discovered her prophetic gifts at age seven.","h10":["Telepathy","Time Sight","Astral Projection"],"h11":"eldara@crystal.net","h12":"Yes, I shall defend the Library"}', 'hash201', '2025-02-20T10:00:00.000Z'),
('resp-l-002', 'form-library-hero-01', '{"h1":"Vorn Steelhand","h2":"Guardian","h4":3,"h5":5,"h6":78,"h7":"Iron Highlands","h9":"Forged in the fires of the Highland wars, Vorn took an oath to protect knowledge.","h10":["Elemental Binding","Mind Shield"],"h11":"vorn@steel.io","h12":"Yes, I shall defend the Library"}', 'hash202', '2025-02-21T14:30:00.000Z'),
('resp-l-003', 'form-library-hero-01', '{"h1":"Sylphie Quickpages","h2":"Scholar","h4":5,"h5":2,"h6":15,"h7":"Sunlit Coast","h9":"A prodigy who read every tome in the Sunlit Academy before her twelfth birthday.","h10":["Telepathy","Illusion"],"h11":"sylphie@pages.edu","h12":"Yes, I shall defend the Library"}', 'hash203', '2025-02-22T09:15:00.000Z'),
('resp-l-004', 'form-library-hero-01', '{"h1":"Kael Shadowstep","h2":"Seeker","h4":4,"h5":4,"h6":55,"h7":"Shadow Vale","h9":"The Void claimed his family. He seeks the relic that can restore them.","h10":["Illusion","Mind Shield","Astral Projection"],"h11":"kael@shadow.val","h12":"No, I walk alone"}', 'hash204', '2025-02-23T11:45:00.000Z'),
('resp-l-005', 'form-library-hero-01', '{"h1":"Nira Clockwright","h2":"Artificer","h4":4,"h5":3,"h6":33,"h7":"Arcane Peaks","h9":"Inventor of the Chrono-Compass, Nira travels to document lost mechanical arts.","h10":["Pyromancy","Elemental Binding"],"h11":"nira@clock.art","h12":"Maybe, tell me more"}', 'hash205', '2025-02-24T16:00:00.000Z'),
('resp-l-006', 'form-library-hero-01', '{"h1":"Petra Inkblood","h2":"Chronicler","h4":5,"h5":2,"h6":28,"h7":"Sunlit Coast","h9":"Former royal scribe turned adventurer, documenting the deeds of heroes across realms.","h10":["Telepathy"],"h11":"petra@inkblood.com","h12":"Yes, I shall defend the Library"}', 'hash206', '2025-02-25T13:20:00.000Z'),
('resp-l-007', 'form-library-hero-01', '{"h1":"Ozymandias Rex","h2":"Guardian","h4":2,"h5":5,"h6":99,"h7":"The Void","h9":"Ancient warrior who survived the First Void Incursion. Few know his true age.","h10":["Mind Shield","Healing"],"h11":"ozy@void.ancient","h12":"Yes, I shall defend the Library"}', 'hash207', '2025-02-26T08:00:00.000Z'),
('resp-l-008', 'form-library-hero-01', '{"h1":"Fae Glimmerwing","h2":"Oracle","h4":5,"h5":3,"h6":22,"h7":"Crystal Depths","h9":"Half-fae visionary who sees futures in crystalline reflections.","h10":["Time Sight","Illusion","Astral Projection"],"h11":"fae@glimmer.fae","h12":"Maybe, tell me more"}', 'hash208', '2025-02-27T12:30:00.000Z'),
('resp-l-009', 'form-library-hero-01', '{"h1":"Brick Hammerfist","h2":"Guardian","h4":2,"h5":5,"h6":61,"h7":"Iron Highlands","h9":"Simple dwarf. Big hammer. Loves the library because it is quiet.","h10":["Elemental Binding"],"h11":"brick@hammer.dw","h12":"Yes, I shall defend the Library"}', 'hash209', '2025-02-28T10:10:00.000Z'),
('resp-l-010', 'form-library-hero-01', '{"h1":"Miriel Starscribe","h2":"Chronicler","h4":5,"h5":3,"h6":47,"h7":"Arcane Peaks","h9":"Author of the Living Codex. Every word she writes becomes part of reality.","h10":["Telepathy","Time Sight"],"h11":"miriel@star.write","h12":"Yes, I shall defend the Library"}', 'hash210', '2025-02-28T15:00:00.000Z');
