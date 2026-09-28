import React from 'react';
import { ArrowUpRight, Network } from 'lucide-react';
import { ExperienceGuide } from './experienceGuides';

interface JungianMatrixLayoutProps {
  guide: ExperienceGuide;
  selectedConceptId: string;
  onSelectConcept: (conceptId: string) => void;
}

export const JungianMatrixLayout: React.FC<JungianMatrixLayoutProps> = ({
  guide,
  selectedConceptId,
  onSelectConcept,
}) => {
  const selectedConcept = guide.concepts.find(concept => concept.id === selectedConceptId) ?? guide.concepts[0];

  return (
    <>
      <aside className="experience-matrix__rail" aria-label="Analytical concept map">
        <div className="experience-matrix__heading">
          <span><Network size={13} aria-hidden="true" /> JUNGIAN MATRIX <i /> CONCEPT CONSTELLATION</span>
          <h1>{guide.title}</h1>
          <p>{guide.introduction}</p>
        </div>

        <div className="experience-matrix__map-heading">
          <span>CONCEPT RELATIONSHIP MAP</span>
          <small>Focus a node</small>
        </div>
        <div className="experience-matrix__graph" role="group" aria-label="Four connected concept nodes">
          <svg viewBox="0 0 240 150" preserveAspectRatio="none" aria-hidden="true">
            <path className="experience-matrix__edge experience-matrix__edge--north" d="M120 24 C153 25 177 42 190 67" />
            <path className="experience-matrix__edge experience-matrix__edge--east" d="M190 78 C180 108 152 126 120 128" />
            <path className="experience-matrix__edge experience-matrix__edge--south" d="M109 128 C76 126 48 108 39 79" />
            <path className="experience-matrix__edge experience-matrix__edge--west" d="M39 67 C50 41 77 25 109 24" />
            <path className="experience-matrix__edge experience-matrix__edge--cross" d="M48 68 C82 55 154 55 181 68 M48 79 C83 93 154 94 181 79" />
          </svg>
          <div className="experience-matrix__core" aria-hidden="true">
            <span><i /><i /><i /></span>
            <strong>MODEL</strong>
          </div>
          {guide.concepts.map((concept, index) => (
            <button
              key={concept.id}
              type="button"
              aria-pressed={selectedConcept.id === concept.id}
              onClick={() => onSelectConcept(concept.id)}
              className={`experience-matrix__node experience-matrix__node--${index + 1}`}
            >
              <span className="experience-matrix__node-mark">
                <span>{String(index + 1).padStart(2, '0')}</span>
              </span>
              <strong>{concept.title}</strong>
            </button>
          ))}
        </div>
        <p className="experience-matrix__boundary">
          A navigational analogy, not a clinical, causal, or archetype assessment.
        </p>
      </aside>

      <aside className="experience-matrix__inspector" aria-label="Selected concept details" aria-live="polite">
        <div className="experience-matrix__inspector-kicker">LIVE ANALYSIS <i /> NODE SELECTED</div>
        <span className="experience-matrix__inspector-number">
          {String(guide.concepts.findIndex(concept => concept.id === selectedConcept.id) + 1).padStart(2, '0')}
        </span>
        <h2>{selectedConcept.title}</h2>
        <p className="experience-matrix__inspector-summary">{selectedConcept.summary}</p>
        <div className="experience-matrix__breakdown">
          <span>WHY IT MATTERS</span>
          <p>{selectedConcept.detail}</p>
        </div>
        <div className="experience-matrix__related">
          <span>RELATED NODES <i /> SELECT TO TRACE</span>
          {guide.concepts
            .filter(concept => concept.id !== selectedConcept.id)
            .slice(0, 2)
            .map(concept => (
              <button
                key={concept.id}
                type="button"
                onClick={() => onSelectConcept(concept.id)}
              >
                {concept.title} <ArrowUpRight size={13} aria-hidden="true" />
              </button>
            ))}
        </div>
        <p className="experience-matrix__source-note">{guide.boundary}</p>
      </aside>
    </>
  );
};
