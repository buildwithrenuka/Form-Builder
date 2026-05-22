import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Country } from '../globeData';
import type { LibraryWorld } from '../libraryData';
import type { Avatar, FormField, FormVersion, Screen, WorldTheme } from '../types';
import { LIBRARY_PRESETS } from '../libraryData';
import { AvatarSelector } from './AvatarSelector';
import { CountryCinematic } from './CountryCinematic';
import { ExperiencePortalTransition } from './ExperiencePortalTransition';
import { FormBuilder } from './FormBuilder';
import { FormPreview } from './FormPreview';
import { GlobeMissionScreen } from './GlobeMissionScreen';
import { GlobeFormBuilder, LOCALE_PRESETS, buildGlobePresetFields } from './GlobeFormBuilder';
import { GlobeIntro } from './GlobeIntro';
import { GlobeSelector } from './GlobeSelector';
import { LibraryMissionScreen } from './LibraryMissionScreen';
import { LibraryFormBuilder, buildLibraryPresetFields } from './LibraryFormBuilder';
import { LibraryIntro } from './LibraryIntro';
import { LibrarySelector } from './LibrarySelector';
import { LibraryWorldCinematic } from './LibraryWorldCinematic';
import { MapPurposeScreen } from './MapPurposeScreen';
import { StoryIntro } from './StoryIntro';
import { WorldCinematic } from './WorldCinematic';
import { WorldDoorTransition } from './WorldDoorTransition';
import { WorldSelector } from './WorldSelector';

type MissionOption = {
  id: string;
  emoji: string;
  name: string;
  description: string;
  fieldCount: number;
  suggestedTitle: string;
  buildFields: () => FormField[];
};

type TempleExperienceFlowProps = {
  screen: Screen;
  playerName: string;
  avatar: Avatar | null;
  world: WorldTheme | null;
  fields: FormField[];
  formTitle: string;
  purposeId: string;
  versions: FormVersion[];
  onScreenChange: (screen: Screen) => void;
  onAvatarChange: (avatar: Avatar | null) => void;
  onWorldChange: (world: WorldTheme | null) => void;
  onFieldsChange: (fields: FormField[]) => void;
  onFormTitleChange: (title: string) => void;
  onPurposeIdChange: (purposeId: string) => void;
  onVersionsChange: (versions: FormVersion[]) => void;
  onRestoreVersion: (version: FormVersion) => void;
  onLogout: () => void;
};

export function TempleExperienceFlow({
  screen,
  playerName,
  avatar,
  world,
  fields,
  formTitle,
  purposeId,
  versions,
  onScreenChange,
  onAvatarChange,
  onWorldChange,
  onFieldsChange,
  onFormTitleChange,
  onPurposeIdChange,
  onVersionsChange,
  onRestoreVersion,
  onLogout,
}: TempleExperienceFlowProps) {
  return (
    <>
      {screen === 'story' && (
        <StoryIntro playerName={playerName} onComplete={() => onScreenChange('avatar')} onBack={() => onScreenChange('experiencePicker')} />
      )}

      {screen === 'avatar' && (
        <AvatarSelector
          currentAvatar={avatar}
          onSelect={(nextAvatar) => { onAvatarChange(nextAvatar); onScreenChange('world'); }}
          onBack={() => onScreenChange('story')}
        />
      )}

      {screen === 'world' && avatar && (
        <WorldSelector
          avatar={avatar}
          currentWorld={world}
          onSelect={(nextWorld) => { onWorldChange(nextWorld); onScreenChange('worldDoor'); }}
          onBack={() => onScreenChange('avatar')}
        />
      )}

      {screen === 'worldDoor' && world && (
        <WorldDoorTransition world={world} onComplete={() => onScreenChange('worldCinematic')} onBack={() => onScreenChange('world')} />
      )}

      {screen === 'worldCinematic' && avatar && world && (
        <WorldCinematic world={world} avatar={avatar} onComplete={() => onScreenChange('mapPurpose')} onBack={() => onScreenChange('world')} />
      )}

      {screen === 'mapPurpose' && avatar && world && (
        <MapPurposeScreen
          world={world}
          avatar={avatar}
          currentPurposeId={purposeId}
          onSelect={(initialFields, title, nextPurposeId) => {
            onFieldsChange(initialFields);
            onFormTitleChange(title);
            onPurposeIdChange(nextPurposeId);
            onScreenChange('builder');
          }}
          onBack={() => onScreenChange('world')}
        />
      )}

      {screen === 'builder' && avatar && world && (
        <FormBuilder
          world={world}
          avatar={avatar}
          fields={fields}
          formTitle={formTitle}
          versions={versions}
          purposeId={purposeId}
          onFieldsChange={onFieldsChange}
          onTitleChange={onFormTitleChange}
          onVersionsChange={onVersionsChange}
          onRestore={onRestoreVersion}
          onPreview={() => onScreenChange('preview')}
          onBack={() => onScreenChange('mapPurpose')}
          onLogout={onLogout}
        />
      )}

      {screen === 'preview' && avatar && world && (
        <FormPreview world={world} avatar={avatar} fields={fields} formTitle={formTitle} onBack={() => onScreenChange('builder')} />
      )}
    </>
  );
}

type GlobeExperienceFlowProps = {
  screen: Screen;
  country: Country | null;
  fields: FormField[];
  title: string;
  purposeId: string;
  onScreenChange: (screen: Screen) => void;
  onCountryChange: (country: Country | null) => void;
  onFieldsChange: (fields: FormField[]) => void;
  onTitleChange: (title: string) => void;
  onPurposeIdChange: (purposeId: string) => void;
  onLogout: () => void;
};

export function GlobeExperienceFlow({
  screen,
  country,
  fields,
  title,
  purposeId,
  onScreenChange,
  onCountryChange,
  onFieldsChange,
  onTitleChange,
  onPurposeIdChange,
  onLogout,
}: GlobeExperienceFlowProps) {
  const missionOptions: MissionOption[] = country
    ? [
        ...((LOCALE_PRESETS[country.fieldPreset] ?? LOCALE_PRESETS.usa).map((preset, index) => {
          const [emoji, ...rest] = preset.group.split(' ');
          const cleanName = rest.join(' ') || preset.group;
          const labels = preset.fields.slice(0, 3).map((field) => field.label).join(', ');
          return {
            id: `globe-${country.id}-${index}`,
            emoji: rest.length > 0 ? emoji : '📋',
            name: cleanName,
            description: `${cleanName} tuned for ${country.name}. Includes ${labels}${preset.fields.length > 3 ? ', and more.' : '.'}`,
            fieldCount: preset.fields.length,
            suggestedTitle: `${country.name} · ${cleanName}`,
            buildFields: () => buildGlobePresetFields(country, preset.fields),
          };
        })),
        {
          id: `globe-${country.id}-scratch`,
          emoji: '✨',
          name: 'Start from Scratch',
          description: `Begin with an empty ${country.name} form and design every field yourself.`,
          fieldCount: 0,
          suggestedTitle: `${country.name} Form`,
          buildFields: () => [],
        },
      ]
    : [];

  const missionPanel = country?.cinematic.find((panel) => panel.title.toLowerCase().includes('mission')) ?? country?.cinematic[country.cinematic.length - 1];

  return (
    <>
      {screen === 'globeIntro' && <GlobeIntro onComplete={() => onScreenChange('globeSelector')} onBack={() => onScreenChange('experiencePicker')} />}

      {screen === 'globeSelector' && (
        <GlobeSelector
          onSelect={(nextCountry) => { onCountryChange(nextCountry); onScreenChange('countryPortal'); }}
          onBack={() => onScreenChange('experiencePicker')}
        />
      )}

      {screen === 'countryPortal' && country && (
        <ExperiencePortalTransition
          bg={country.bgGradient}
          accentColor={country.accentColor}
          glowColor={country.glowColor}
          emoji={country.emoji}
          title={country.name}
          subtitle="The world opens"
          onBack={() => onScreenChange('globeSelector')}
          onComplete={() => onScreenChange('countryCinematic')}
        />
      )}

      {screen === 'countryCinematic' && country && (
        <CountryCinematic country={country} onComplete={() => onScreenChange('globeMission')} onBack={() => onScreenChange('globeSelector')} />
      )}

      {screen === 'globeMission' && country && missionPanel && (
        <GlobeMissionScreen
          destinationLabel={country.name}
          accentColor={country.accentColor}
          glowColor={country.glowColor}
          background={country.bgGradient}
          missionTitle={missionPanel.title}
          missionText={missionPanel.text}
          currentMissionId={purposeId}
          options={missionOptions}
          onSelect={(nextFields, nextTitle, nextPurposeId) => {
            onFieldsChange(nextFields);
            onTitleChange(nextTitle);
            onPurposeIdChange(nextPurposeId);
            onScreenChange('globeBuilder');
          }}
          onBack={() => onScreenChange('globeSelector')}
        />
      )}

      {screen === 'globeBuilder' && country && (
        <GlobeFormBuilder
          country={country}
          initialFields={fields}
          initialTitle={title}
          onBack={() => onScreenChange('globeMission')}
          onLogout={onLogout}
          onPreview={(nextFields, nextTitle) => {
            onFieldsChange(nextFields);
            onTitleChange(nextTitle);
            onScreenChange('globePreview');
          }}
        />
      )}

      {screen === 'globePreview' && country && (
        <GlobePreviewScreen country={country} fields={fields} title={title} onBack={() => onScreenChange('globeBuilder')} />
      )}
    </>
  );
}

type LibraryExperienceFlowProps = {
  screen: Screen;
  world: LibraryWorld | null;
  fields: FormField[];
  title: string;
  purposeId: string;
  onScreenChange: (screen: Screen) => void;
  onWorldChange: (world: LibraryWorld | null) => void;
  onFieldsChange: (fields: FormField[]) => void;
  onTitleChange: (title: string) => void;
  onPurposeIdChange: (purposeId: string) => void;
  onLogout: () => void;
};

export function LibraryExperienceFlow({
  screen,
  world,
  fields,
  title,
  purposeId,
  onScreenChange,
  onWorldChange,
  onFieldsChange,
  onTitleChange,
  onPurposeIdChange,
  onLogout,
}: LibraryExperienceFlowProps) {
  const missionOptions: MissionOption[] = world
    ? [
        ...LIBRARY_PRESETS[world.id].map((preset, index) => {
          const [emoji, ...rest] = preset.group.split(' ');
          const cleanName = rest.join(' ') || preset.group;
          const labels = preset.fields.slice(0, 3).map((field) => field.label).join(', ');
          return {
            id: `library-${world.id}-${index}`,
            emoji: rest.length > 0 ? emoji : '📚',
            name: cleanName,
            description: `${cleanName} for the ${world.name} shelves. Includes ${labels}${preset.fields.length > 3 ? ', and more.' : '.'}`,
            fieldCount: preset.fields.length,
            suggestedTitle: `${world.name} · ${cleanName}`,
            buildFields: () => buildLibraryPresetFields(world, preset.fields),
          };
        }),
        {
          id: `library-${world.id}-scratch`,
          emoji: '✨',
          name: 'Start from Scratch',
          description: `Open a blank manuscript for ${world.name} and author the form structure yourself.`,
          fieldCount: 0,
          suggestedTitle: `${world.name} Form`,
          buildFields: () => [],
        },
      ]
    : [];

  const missionPanel = world?.cinematic.find((panel) => panel.title.toLowerCase().includes('mission') || panel.title.toLowerCase().includes('quest')) ?? world?.cinematic[world.cinematic.length - 1];

  return (
    <>
      {screen === 'libraryIntro' && <LibraryIntro onComplete={() => onScreenChange('librarySelector')} onBack={() => onScreenChange('experiencePicker')} />}

      {screen === 'librarySelector' && (
        <LibrarySelector
          onSelect={(nextWorld) => { onWorldChange(nextWorld); onScreenChange('libraryPortal'); }}
          onBack={() => onScreenChange('experiencePicker')}
        />
      )}

      {screen === 'libraryPortal' && world && (
        <ExperiencePortalTransition
          bg={world.bgGradient}
          accentColor={world.accentColor}
          glowColor={world.glowColor}
          emoji={world.emoji}
          title={world.name}
          subtitle="Enter the archive"
          particles={world.particles}
          onBack={() => onScreenChange('librarySelector')}
          onComplete={() => onScreenChange('libraryCinematic')}
        />
      )}

      {screen === 'libraryCinematic' && world && (
        <LibraryWorldCinematic world={world} onComplete={() => onScreenChange('libraryMission')} onBack={() => onScreenChange('librarySelector')} />
      )}

      {screen === 'libraryMission' && world && missionPanel && (
        <LibraryMissionScreen
          destinationLabel={world.name}
          accentColor={world.accentColor}
          glowColor={world.glowColor}
          background={world.bgGradient}
          missionTitle={missionPanel.title}
          missionText={missionPanel.text}
          currentMissionId={purposeId}
          options={missionOptions}
          onSelect={(nextFields, nextTitle, nextPurposeId) => {
            onFieldsChange(nextFields);
            onTitleChange(nextTitle);
            onPurposeIdChange(nextPurposeId);
            onScreenChange('libraryBuilder');
          }}
          onBack={() => onScreenChange('librarySelector')}
        />
      )}

      {screen === 'libraryBuilder' && world && (
        <LibraryFormBuilder
          world={world}
          initialFields={fields}
          initialTitle={title}
          onBack={() => onScreenChange('libraryMission')}
          onLogout={onLogout}
          onPreview={(nextFields, nextTitle) => {
            onFieldsChange(nextFields);
            onTitleChange(nextTitle);
            onScreenChange('libraryPreview');
          }}
        />
      )}

      {screen === 'libraryPreview' && world && (
        <LibraryPreviewScreen world={world} fields={fields} title={title} onBack={() => onScreenChange('libraryBuilder')} />
      )}
    </>
  );
}

function GlobePreviewScreen({ country, fields, title, onBack }: {
  country: Country;
  fields: FormField[];
  title: string;
  onBack: () => void;
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: `radial-gradient(ellipse at 50% 0%, ${country.color}22 0%, #03001c 60%, #000 100%)`, overflow: 'auto', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
          <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.08)', border: `1px solid ${country.color}44`, color: '#fff', borderRadius: 8, padding: '7px 16px', cursor: 'pointer', fontSize: 13 }}>← Edit</button>
          <span style={{ fontSize: 32 }}>{country.emoji}</span>
          <div>
            <h2 style={{ color: '#fff', margin: 0, fontSize: 22, fontWeight: 800 }}>{title}</h2>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{country.name} · {country.tagline}</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {fields.map((field) => {
            if (field.type === 'section') {
              return <div key={field.id} style={{ borderTop: `2px solid ${country.color}44`, paddingTop: 12, color: country.accentColor, fontWeight: 700, fontSize: 14 }}>{field.label}</div>;
            }
            return (
              <div key={field.id}>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                  {field.label}
                  {field.required && <span style={{ color: country.accentColor, marginLeft: 4 }}>*</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea placeholder={field.placeholder} rows={3} style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: `1px solid ${country.color}44`, borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 14, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
                ) : field.type === 'select' ? (
                  <select style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: `1px solid ${country.color}44`, borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none' }}>
                    <option value="">Select...</option>
                    {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                ) : field.type === 'radio' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {field.options.map((option) => (
                      <label key={option} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.7)', fontSize: 14, cursor: 'pointer' }}>
                        <input type="radio" name={field.id} value={option} />
                        {option}
                      </label>
                    ))}
                  </div>
                ) : field.type === 'checkbox' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {field.options.map((option) => (
                      <label key={option} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.7)', fontSize: 14, cursor: 'pointer' }}>
                        <input type="checkbox" value={option} />
                        {option}
                      </label>
                    ))}
                  </div>
                ) : field.type === 'rating' ? (
                  <div style={{ display: 'flex', gap: 8 }}>
                    {Array.from({ length: field.max || 5 }, (_, index) => (
                      <span key={index} style={{ fontSize: 28, cursor: 'pointer', opacity: 0.4 }}>⭐</span>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {field.prefix && <span style={{ background: `${country.color}22`, border: `1px solid ${country.color}44`, borderRight: 'none', borderRadius: '8px 0 0 8px', padding: '10px 12px', color: country.accentColor, fontSize: 14, fontWeight: 700 }}>{field.prefix}</span>}
                    <input type={field.type === 'number' || field.type === 'currency' ? 'number' : field.type} placeholder={field.placeholder} style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: `1px solid ${country.color}44`, borderRadius: field.prefix ? '0 8px 8px 0' : 8, padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                )}
                {field.helperText && <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 4 }}>{field.helperText}</div>}
              </div>
            );
          })}
        </div>

        {fields.length > 0 && <button style={{ marginTop: 32, background: `linear-gradient(135deg, ${country.color}, ${country.accentColor})`, border: 'none', color: '#fff', borderRadius: 10, padding: '14px 32px', fontWeight: 800, fontSize: 16, cursor: 'pointer', boxShadow: `0 4px 20px ${country.glowColor}` }}>Submit Form</button>}
      </div>
    </div>
  );
}

function LibraryPreviewScreen({ world, fields, title, onBack }: {
  world: LibraryWorld;
  fields: FormField[];
  title: string;
  onBack: () => void;
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: world.bgGradient, overflow: 'auto', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
          <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.08)', border: `1px solid ${world.color}44`, color: '#fff', borderRadius: 8, padding: '7px 16px', cursor: 'pointer', fontSize: 13 }}>← Edit</button>
          <span style={{ fontSize: 32 }}>{world.emoji}</span>
          <div>
            <h2 style={{ color: '#fff', margin: 0, fontSize: 22, fontWeight: 800 }}>{title}</h2>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{world.name} · {world.tagline}</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {fields.filter((field) => !field.hidden).map((field) => {
            if (field.type === 'section') {
              return <div key={field.id} style={{ borderTop: `2px solid ${world.color}44`, paddingTop: 12, color: world.accentColor, fontWeight: 700, fontSize: 14 }}>{field.label}</div>;
            }
            return (
              <div key={field.id}>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                  {field.label}
                  {field.required && <span style={{ color: world.accentColor, marginLeft: 4 }}>*</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea placeholder={field.placeholder} rows={3} style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: `1px solid ${world.color}44`, borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 14, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
                ) : field.type === 'select' ? (
                  <select style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: `1px solid ${world.color}44`, borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none' }}>
                    <option value="">Select...</option>
                    {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                ) : field.type === 'radio' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {field.options.map((option) => (
                      <label key={option} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.7)', fontSize: 14, cursor: 'pointer' }}>
                        <input type="radio" name={field.id} value={option} /> {option}
                      </label>
                    ))}
                  </div>
                ) : field.type === 'checkbox' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {field.options.map((option) => (
                      <label key={option} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.7)', fontSize: 14, cursor: 'pointer' }}>
                        <input type="checkbox" value={option} /> {option}
                      </label>
                    ))}
                  </div>
                ) : (
                  <input type={['number', 'currency'].includes(field.type) ? 'number' : field.type === 'password' ? 'password' : 'text'} placeholder={field.placeholder} style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: `1px solid ${world.color}44`, borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                )}
                {field.helperText && <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 4 }}>{field.helperText}</div>}
              </div>
            );
          })}
        </div>

        {fields.length > 0 && <button style={{ marginTop: 32, background: `linear-gradient(135deg, ${world.color}, ${world.accentColor})`, border: 'none', color: '#000', borderRadius: 10, padding: '14px 32px', fontWeight: 800, fontSize: 16, cursor: 'pointer', boxShadow: `0 4px 20px ${world.glowColor}` }}>Submit Form</button>}
      </div>
    </div>
  );
}