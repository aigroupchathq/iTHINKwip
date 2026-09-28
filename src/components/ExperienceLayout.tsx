import React, { useEffect, useState } from 'react';
import { ActiveTab } from '../types/neuro';
import { ExperienceTheme, useTheme } from '../context/ThemeContext';
import { EXPERIENCE_GUIDES } from './experienceThemes/experienceGuides';
import { JungianMatrixLayout } from './experienceThemes/JungianMatrixLayout';
import { StorytellerJourneyLayout } from './experienceThemes/StorytellerJourneyLayout';
import { SocraticDialogueLayout } from './experienceThemes/SocraticDialogueLayout';
import { ModularWorkbenchLayout, WorkbenchDensity } from './experienceThemes/ModularWorkbenchLayout';
import { MinimalistZenLayout } from './experienceThemes/MinimalistZenLayout';
import './ExperienceLayout.css';

interface ExperienceLayoutProps {
  activeTab: ActiveTab;
  children: React.ReactNode;
}

export const ExperienceLayout: React.FC<ExperienceLayoutProps> = ({ activeTab, children }) => {
  const { experienceTheme, experienceConfig } = useTheme();
  const guide = EXPERIENCE_GUIDES[activeTab];
  const [selectedConceptId, setSelectedConceptId] = useState(guide.concepts[0].id);
  const [activeChapter, setActiveChapter] = useState(0);
  const [selectedQuestion, setSelectedQuestion] = useState(0);
  const [density, setDensity] = useState<WorkbenchDensity>('balanced');
  const [zenConceptIndex, setZenConceptIndex] = useState(0);
  const [isZenRevealed, setIsZenRevealed] = useState(false);

  useEffect(() => {
    setSelectedConceptId(guide.concepts[0].id);
    setActiveChapter(0);
    setSelectedQuestion(0);
    setZenConceptIndex(0);
    setIsZenRevealed(false);
  }, [activeTab, guide]);

  const selectedConcept = guide.concepts.find(concept => concept.id === selectedConceptId) ?? guide.concepts[0];

  const renderThemeLayout = (theme: ExperienceTheme) => {
    switch (theme) {
      case 'matrix':
        return (
          <JungianMatrixLayout
            guide={guide}
            selectedConceptId={selectedConcept.id}
            onSelectConcept={setSelectedConceptId}
          />
        );
      case 'story':
        return (
          <StorytellerJourneyLayout
            guide={guide}
            activeChapter={activeChapter}
            onSelectChapter={setActiveChapter}
          />
        );
      case 'socratic':
        return (
          <SocraticDialogueLayout
            guide={guide}
            selectedQuestion={selectedQuestion}
            onSelectQuestion={setSelectedQuestion}
          />
        );
      case 'workbench':
        return (
          <ModularWorkbenchLayout
            guide={guide}
            density={density}
            onChangeDensity={setDensity}
            selectedConcept={selectedConcept}
            onSelectConcept={setSelectedConceptId}
          />
        );
      case 'zen':
        return (
          <MinimalistZenLayout
            guide={guide}
            conceptIndex={zenConceptIndex}
            isRevealed={isZenRevealed}
            onSelectConcept={index => {
              setZenConceptIndex(index);
              setIsZenRevealed(false);
            }}
            onToggleReveal={() => setIsZenRevealed(value => !value)}
          />
        );
    }
  };

  return (
    <div
      className={`experience-layout experience-layout--${experienceTheme}`}
      data-experience-theme={experienceTheme}
      data-density={density}
      role="region"
      aria-label={`${experienceConfig.name} experience`}
    >
      <div className="experience-layout__chrome">
        {renderThemeLayout(experienceTheme)}
      </div>
      <main id="experience-canvas" className="experience-layout__canvas">
        {children}
      </main>
    </div>
  );
};
