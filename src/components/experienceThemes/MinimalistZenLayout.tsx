import React from 'react';
import { ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { ExperienceGuide } from './experienceGuides';

interface MinimalistZenLayoutProps {
  guide: ExperienceGuide;
  conceptIndex: number;
  isRevealed: boolean;
  onSelectConcept: (index: number) => void;
  onToggleReveal: () => void;
}

export const MinimalistZenLayout: React.FC<MinimalistZenLayoutProps> = ({
  guide,
  conceptIndex,
  isRevealed,
  onSelectConcept,
  onToggleReveal,
}) => {
  const concept = guide.concepts[conceptIndex] ?? guide.concepts[0];
  const previousIndex = (conceptIndex - 1 + guide.concepts.length) % guide.concepts.length;
  const nextIndex = (conceptIndex + 1) % guide.concepts.length;

  return (
    <section className="experience-zen" aria-label="Minimalist focus view">
      <div className="experience-zen__meta">
        <span>THE MINIMALIST ZEN</span>
        <span>ONE IDEA / {String(conceptIndex + 1).padStart(2, '0')} OF {String(guide.concepts.length).padStart(2, '0')}</span>
      </div>
      <div className="experience-zen__focus" aria-live="polite">
        <span className="experience-zen__eyebrow">{guide.eyebrow}</span>
        <h1>{concept.title}</h1>
        <p className="experience-zen__summary">{concept.summary}</p>
        {isRevealed && (
          <div className="experience-zen__detail">
            <p>{concept.detail}</p>
            <small>{guide.boundary}</small>
          </div>
        )}
        <div className="experience-zen__actions">
          <button type="button" onClick={onToggleReveal} aria-expanded={isRevealed}>
            {isRevealed ? 'Fold this idea' : 'Unfold the context'}
          </button>
          <a href="#experience-canvas">
            Enter the experience <ArrowDown size={14} aria-hidden="true" />
          </a>
        </div>
      </div>
      <div className="experience-zen__navigation">
        <button type="button" onClick={() => onSelectConcept(previousIndex)} aria-label="Previous concept">
          <ArrowLeft size={15} aria-hidden="true" /> Previous
        </button>
        <div aria-label="Choose a concept">
          {guide.concepts.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Show concept ${index + 1}: ${item.title}`}
              aria-current={conceptIndex === index ? 'step' : undefined}
              onClick={() => onSelectConcept(index)}
            />
          ))}
        </div>
        <button type="button" onClick={() => onSelectConcept(nextIndex)} aria-label="Next concept">
          Next <ArrowRight size={15} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
};
