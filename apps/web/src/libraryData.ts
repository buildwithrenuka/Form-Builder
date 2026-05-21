// ── Experience 3: Library — world data ────────────────────────────────────

export type LibraryWorld = {
  id: 'mythology' | 'history' | 'scifi' | 'fictional';
  name: string;
  emoji: string;
  genre: string;
  tagline: string;
  lore: string;
  color: string;
  accentColor: string;
  glowColor: string;
  bgGradient: string;
  /** Ambient floating particles for ParticleBackground */
  particles: string[];
  /** Cinematic intro panels shown when entering this world */
  cinematic: { title: string; text: string; icon: string }[];
};

export const LIBRARY_WORLDS: LibraryWorld[] = [
  {
    id: 'mythology',
    name: 'Mythology',
    emoji: '⚡',
    genre: 'Ancient Legends',
    tagline: 'Where Gods Walk Among Forms',
    lore: 'From Olympus to Asgard, from the Nile to the Ganges — every civilisation left its myths. Now you shape them into data.',
    color: '#ffd700',
    accentColor: '#f59e0b',
    glowColor: 'rgba(255,215,0,0.35)',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, #3d2800 0%, #1a1000 55%, #000 100%)',
    particles: ['⚡', '🔱', '🌩️', '🏺'],
    cinematic: [
      { icon: '⚡', title: 'Age of the Gods', text: 'Zeus, Odin, Shiva, Ra — they ruled the heavens and the hearts of mortals. Their stories are the world\'s oldest data.' },
      { icon: '🏺', title: 'The Epic Records', text: 'The Iliad. The Mahabharata. The Prose Edda. Every epic is a structured record of heroes, battles, and destinies.' },
      { icon: '📋', title: 'Your Quest', text: 'Build forms worthy of the gods. Capture prophecies, hero registrations, and divine decrees — in perfect structured data.' },
    ],
  },
  {
    id: 'history',
    name: 'History',
    emoji: '📜',
    genre: 'Historical Archives',
    tagline: 'The Past, Precisely Recorded',
    lore: 'Every empire rose and fell on the strength of its records. Censuses, treaties, proclamations — history is nothing but forms filled out by the great and the forgotten.',
    color: '#b45309',
    accentColor: '#d97706',
    glowColor: 'rgba(180,83,9,0.4)',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, #2d1a00 0%, #1a0f00 55%, #000 100%)',
    particles: ['📜', '🗺️', '⚔️', '🏛️'],
    cinematic: [
      { icon: '🏛️', title: 'The Archive', text: 'Rome didn\'t fall in a day. It was chronicled, catalogued, and documented by scribes who knew every detail mattered.' },
      { icon: '📜', title: 'Ink and Parchment', text: 'The Magna Carta. The Declaration of Independence. The Treaty of Westphalia. Power was always formalised in writing.' },
      { icon: '📋', title: 'Your Mission', text: 'Record the pages of history. Build forms that capture eras, people, and pivotal events with archival precision.' },
    ],
  },
  {
    id: 'scifi',
    name: 'Sci-Fi',
    emoji: '🚀',
    genre: 'Future Worlds',
    tagline: 'Structured Data at Light Speed',
    lore: 'In the year 2387, the Galactic Census Bureau processes 40 trillion form submissions per second. Every starship, every colony, every sentient being — registered.',
    color: '#06b6d4',
    accentColor: '#22d3ee',
    glowColor: 'rgba(6,182,212,0.4)',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, #001a2d 0%, #00040f 55%, #000 100%)',
    particles: ['🚀', '⭐', '🛸', '🤖'],
    cinematic: [
      { icon: '🌌', title: 'The Final Frontier', text: 'Humanity reached the stars — and discovered that interstellar bureaucracy was more complex than warp physics.' },
      { icon: '🤖', title: 'AI-Assisted Filing', text: 'Neural interface forms. Quantum-validated fields. Bio-signatures replacing signatures. The future of data collection is now.' },
      { icon: '📋', title: 'Your Mission', text: 'Build the forms that power star fleets, alien registration bureaus, and galactic governance. The cosmos awaits.' },
    ],
  },
  {
    id: 'fictional',
    name: 'Fictional',
    emoji: '🪄',
    genre: 'Fantasy & Fiction',
    tagline: 'Where Stories Become Structure',
    lore: 'Every great story has a form behind it. Hogwarts has enrollment records. Middle Earth has fellowship contracts. Westeros has inheritance forms. Magic is in the details.',
    color: '#9333ea',
    accentColor: '#a855f7',
    glowColor: 'rgba(147,51,234,0.4)',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, #1e0030 0%, #0d0018 55%, #000 100%)',
    particles: ['🪄', '✨', '🐉', '🔮'],
    cinematic: [
      { icon: '📖', title: 'The Book of Stories', text: 'Tolkien. Rowling. Martin. Sanderson. Every fictional world is built on rules — and rules need forms to enforce them.' },
      { icon: '🐉', title: 'Legends Made Real', text: 'A dragon licence application. An enchantment registration. A hero\'s guild membership. Fiction runs on paperwork.' },
      { icon: '📋', title: 'Your Quest', text: 'Create forms for worlds that never were — but should have been. Build the bureaucracy of the extraordinary.' },
    ],
  },
];

// ── Per-world field presets ────────────────────────────────────────────────
import type { FieldType } from './types';

export type LibraryPresetGroup = {
  group: string;
  fields: { type: FieldType; label: string; required?: boolean; placeholder?: string; options?: string[] }[];
};

export const LIBRARY_PRESETS: Record<LibraryWorld['id'], LibraryPresetGroup[]> = {
  mythology: [
    {
      group: '⚡ Hero Registration',
      fields: [
        { type: 'text',     label: 'Hero Name', required: true, placeholder: 'e.g. Achilles, Arjuna, Thor' },
        { type: 'select',   label: 'Pantheon / Mythology', required: true, options: ['Greek', 'Norse', 'Hindu', 'Egyptian', 'Roman', 'Mesopotamian', 'Celtic', 'Mayan', 'Chinese', 'Other'] },
        { type: 'text',     label: 'Realm of Origin', required: true, placeholder: 'e.g. Olympus, Asgard, Svarga' },
        { type: 'select',   label: 'Hero Type', required: true, options: ['Demigod', 'Mortal Hero', 'God', 'Titan', 'Monster Slayer', 'Trickster'] },
        { type: 'textarea', label: 'Divine Powers', placeholder: 'List abilities and godly gifts...' },
        { type: 'text',     label: 'Sacred Weapon / Artefact', placeholder: 'e.g. Mjolnir, Trident, Caduceus' },
      ],
    },
    {
      group: '🏺 Deity Record',
      fields: [
        { type: 'text',     label: 'Divine Name', required: true, placeholder: 'e.g. Athena, Odin, Vishnu' },
        { type: 'text',     label: 'Domain / Dominion', required: true, placeholder: 'e.g. Wisdom, War, Creation' },
        { type: 'text',     label: 'Sacred Animal', placeholder: 'e.g. Owl, Raven, Peacock' },
        { type: 'select',   label: 'Alignment', options: ['Benevolent', 'Wrathful', 'Neutral', 'Trickster', 'Destroyer', 'Creator'] },
        { type: 'textarea', label: 'Origin Myth', placeholder: 'How was this deity born or created?' },
        { type: 'checkbox', label: 'Still actively worshipped today' },
      ],
    },
  ],
  history: [
    {
      group: '🏛️ Historical Figure',
      fields: [
        { type: 'text',     label: 'Full Name', required: true, placeholder: 'e.g. Cleopatra VII, Leonardo da Vinci' },
        { type: 'text',     label: 'Era / Century', required: true, placeholder: 'e.g. 1st century BC, Renaissance' },
        { type: 'text',     label: 'Nation / Empire', required: true, placeholder: 'e.g. Ancient Egypt, Roman Empire' },
        { type: 'select',   label: 'Field of Influence', required: true, options: ['Politics', 'Military', 'Arts', 'Science', 'Philosophy', 'Religion', 'Exploration', 'Trade'] },
        { type: 'textarea', label: 'Notable Achievements', placeholder: 'What made this person historically significant?' },
        { type: 'number',   label: 'Year of Birth (negative = BC)', placeholder: '-100' },
        { type: 'number',   label: 'Year of Death (negative = BC)', placeholder: '-44' },
      ],
    },
    {
      group: '⚔️ Historical Event',
      fields: [
        { type: 'text',     label: 'Event Name', required: true, placeholder: 'e.g. Battle of Thermopylae' },
        { type: 'date',     label: 'Date (approximate)', },
        { type: 'text',     label: 'Location', required: true, placeholder: 'City, Region, Country' },
        { type: 'select',   label: 'Category', required: true, options: ['Battle / War', 'Treaty', 'Discovery', 'Revolution', 'Natural Disaster', 'Coronation', 'Assassination', 'Trade Expedition'] },
        { type: 'textarea', label: 'Key Parties Involved', placeholder: 'Leaders, nations, armies...' },
        { type: 'textarea', label: 'Historical Significance', placeholder: 'Why does this event matter?' },
      ],
    },
  ],
  scifi: [
    {
      group: '🚀 Mission Brief',
      fields: [
        { type: 'text',     label: 'Mission Designation', required: true, placeholder: 'e.g. ALPHA-7, Odyssey-X' },
        { type: 'select',   label: 'Mission Class', required: true, options: ['Exploration', 'Combat', 'Diplomacy', 'Colonisation', 'Rescue', 'Research', 'Covert Ops'] },
        { type: 'text',     label: 'Target Destination', required: true, placeholder: 'Star system, planet, or coordinates' },
        { type: 'number',   label: 'Crew Size', required: true, placeholder: '12' },
        { type: 'number',   label: 'Estimated Duration (days)', placeholder: '365' },
        { type: 'textarea', label: 'Primary Objective', required: true, placeholder: 'State the mission objective clearly...' },
        { type: 'select',   label: 'Security Clearance Required', options: ['Level 1 — Public', 'Level 2 — Restricted', 'Level 3 — Classified', 'Level 4 — Top Secret', 'Level Omega — Eyes Only'] },
      ],
    },
    {
      group: '👤 Crew Registration',
      fields: [
        { type: 'text',     label: 'Full Name', required: true },
        { type: 'select',   label: 'Species', required: true, options: ['Human', 'Android', 'Cyborg', 'Alien (Humanoid)', 'Alien (Non-Humanoid)', 'AI Consciousness', 'Other'] },
        { type: 'select',   label: 'Rank', required: true, options: ['Admiral', 'Captain', 'Commander', 'Lieutenant', 'Ensign', 'Specialist', 'Cadet'] },
        { type: 'select',   label: 'Specialisation', required: true, options: ['Piloting', 'Engineering', 'Medical', 'Combat', 'Science', 'Communications', 'Navigation'] },
        { type: 'text',     label: 'Ship Assignment', placeholder: 'Name of assigned vessel' },
        { type: 'checkbox', label: 'Cleared for deep-space operations' },
      ],
    },
  ],
  fictional: [
    {
      group: '🧙 Character Sheet',
      fields: [
        { type: 'text',     label: 'Character Name', required: true, placeholder: 'Full name of your character' },
        { type: 'select',   label: 'Race / Species', required: true, options: ['Human', 'Elf', 'Dwarf', 'Orc', 'Halfling', 'Dragon-kin', 'Undead', 'Fae', 'Shapeshifter', 'Other'] },
        { type: 'select',   label: 'Class / Role', required: true, options: ['Wizard', 'Warrior', 'Rogue', 'Paladin', 'Ranger', 'Necromancer', 'Bard', 'Druid', 'Sorcerer', 'Monk'] },
        { type: 'select',   label: 'Moral Alignment', options: ['Lawful Good', 'Neutral Good', 'Chaotic Good', 'Lawful Neutral', 'True Neutral', 'Chaotic Neutral', 'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'] },
        { type: 'textarea', label: 'Backstory', placeholder: 'What shaped this character? Dark past, noble lineage, hidden prophecy...' },
        { type: 'text',     label: 'Signature Ability / Spell', placeholder: 'e.g. Fireball, Shadow Step, Time Freeze' },
        { type: 'number',   label: 'Power Level (1–100)', placeholder: '42' },
      ],
    },
    {
      group: '🌍 World-Building Entry',
      fields: [
        { type: 'text',     label: 'World / Realm Name', required: true, placeholder: 'e.g. Middle Earth, Westeros, Narnia' },
        { type: 'select',   label: 'Genre', required: true, options: ['High Fantasy', 'Dark Fantasy', 'Urban Fantasy', 'Science Fantasy', 'Steampunk', 'Dystopian', 'Fairy Tale', 'Mythology Retelling'] },
        { type: 'text',     label: 'Magic System (if any)', placeholder: 'e.g. Elemental, Runic, Blood Magic, None' },
        { type: 'text',     label: 'Dominant Species / Faction', placeholder: 'Who rules this world?' },
        { type: 'textarea', label: 'Core Conflict', placeholder: 'What is the central struggle of this world?' },
        { type: 'checkbox', label: 'A prophesied hero exists in this world' },
      ],
    },
  ],
};
