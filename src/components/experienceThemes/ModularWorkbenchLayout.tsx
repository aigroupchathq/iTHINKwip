import React from 'react';
import { Check, SlidersHorizontal } from 'lucide-react';
import { ExperienceConcept, ExperienceGuide } from './experienceGuides';

export type WorkbenchDensity = 'compact' | 'balanced' | 'spacious';

interface ModularWorkbenchLayoutProps {
  guide: ExperienceGuide;
  density: WorkbenchDensity;
  onChangeDensity: (density: WorkbenchDensity) => void;
  selectedConcept: ExperienceConcept;
  onSelectConcept: (conceptId: string) => void;
}

const DENSITY_OPTIONS: { value: WorkbenchDensity; label: string; description: string }[] = [
  { value: 'compact', label: 'Dense', description: 'More context' },
  { value: 'balanced', label: 'Balanced', description: 'Default spacing' },
  { value: 'spacious', label: 'Roomy', description: 'More breathing room' },
];

export const ModularWorkbenchLayout: React.FC<ModularWorkbenchLayoutProps> = ({
  guide,
  density,
  onChangeDensity,
  selectedConcept,
  onSelectConcept,
}) => (
  <section className="experience-workbench" aria-label="Modular learning workbench">
    <div className="experience-workbench__topline">
      <div>
        <span><SlidersHorizontal size={13} aria-hidden="true" /> MODULAR WORKBENCH / {guide.eyebrow}</span>
        <h1>{guide.title}</h1>
        <p>{guide.introduction}</p>
      </div>
      <fieldset className="experience-workbench__density">
        <legend>WORKSPACE DENSITY</legend>
        <div role="group" aria-label="Workspace density">
          {DENSITY_OPTIONS.map(option => (
            <button
              key={option.value}
              type="button"
              aria-pressed={density === option.value}
              title={option.description}
              onClick={() => onChangeDensity(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>
    </div>
    <div
      className="experience-workbench__modules"
      data-density={density}
      role="group"
      aria-label="Select a concept module"
    >
      {guide.concepts.map((concept, index) => (
        <button
          key={concept.id}
          type="button"
          aria-pressed={selectedConcept.id === concept.id}
          onClick={() => onSelectConcept(concept.id)}
        >
          <span>MODULE 0{index + 1}</span>
          <strong>{concept.title}</strong>
          {selectedConcept.id === concept.id && <Check size={14} aria-label="Selected module" />}
        </button>
      ))}
    </div>
    <div className="experience-workbench__inspector" aria-live="polite">
      <span>LIVE INSPECTOR / {selectedConcept.title}</span>
      <p>{selectedConcept.summary}</p>
      <small>{guide.boundary}</small>
    </div>
  </section>
);
