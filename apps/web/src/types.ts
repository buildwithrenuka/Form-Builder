export type Screen =
  // shared
  | 'home' | 'login' | 'shared' | 'submissionConfirmed' | 'tutorial' | 'experiencePicker' | 'explore'
  // new pages
  | 'pricing' | 'dashboard'
  | 'admin'
  // experience 1: realm runner
  | 'story' | 'avatar' | 'world' | 'worldDoor' | 'worldCinematic' | 'mapPurpose' | 'builder' | 'preview'
  // experience 2: globe
  | 'globeIntro' | 'globeSelector' | 'countryPortal' | 'countryCinematic' | 'globeMission' | 'globeBuilder' | 'globePreview'
  // experience 3: library
  | 'libraryIntro' | 'librarySelector' | 'libraryPortal' | 'libraryCinematic' | 'libraryMission' | 'libraryBuilder' | 'libraryPreview';

export type FormVersion = {
  id: string;
  versionName: string;
  timestamp: number;
  formTitle: string;
  fields: FormField[];
  worldId: string;
  avatarId: string;
};

export type Avatar = {
  id: string;
  name: string;
  title: string;
  emoji: string;
  color: string;
  bgGradient: string;
  description: string;
  trait: string;
  ability: string;
  abilityIcon: string;
  speed: number;
  power: number;
  agility: number;
};

export type WorldTheme = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  mutedColor: string;
  bg: string;
  cardBg: string;
  borderColor: string;
  buttonGradient: string;
  buttonText: string;
  inputBg: string;
  particles: string[];
  glowColor: string;
};

export type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'phone'
  | 'number'
  | 'date'
  | 'time'
  | 'url'
  | 'currency'
  | 'textarea'
  | 'checkbox'
  | 'radio'
  | 'select'
  | 'multi_select'
  | 'range'
  | 'rating'
  | 'file'
  | 'section'
  | 'page_break';

export type FieldWidth = 'full' | 'half';

export type ConditionalOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'greater_than'
  | 'less_than'
  | 'is_empty'
  | 'is_not_empty';

export type ValidationPreset = 'none' | 'letters-only' | 'numbers-only' | 'alphanumeric' | 'pan' | 'gst' | 'ifsc' | 'pincode' | 'custom';

export type FormField = {
  id: string;
  type: FieldType;
  label: string;
  placeholder: string;
  required: boolean;
  options: string[];
  min: number;
  max: number;
  helperText: string;
  // Constraints
  minLength: number;
  maxLength: number;
  validationPreset: ValidationPreset;
  customPattern: string;
  errorMessage: string;
  // Display
  fieldWidth: FieldWidth;
  hidden: boolean;
  conditionalParentId: string;
  conditionalOperator: ConditionalOperator;
  conditionalValue: string;
  prefix: string;
  suffix: string;
  // Section
  sectionColor: string;
  sectionDescription: string;
};
