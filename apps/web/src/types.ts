export type Screen =
  // shared
  | 'home' | 'login' | 'shared' | 'tutorial' | 'experiencePicker'
  // experience 1: temple run
  | 'story' | 'avatar' | 'world' | 'worldDoor' | 'worldCinematic' | 'mapPurpose' | 'builder' | 'preview'
  // experience 2: globe
  | 'globeIntro' | 'globeSelector' | 'countryCinematic' | 'globeBuilder' | 'globePreview';

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
  | 'range'
  | 'rating'
  | 'file'
  | 'section';

export type FieldWidth = 'full' | 'half';

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
  prefix: string;
  suffix: string;
  // Section
  sectionColor: string;
  sectionDescription: string;
};
