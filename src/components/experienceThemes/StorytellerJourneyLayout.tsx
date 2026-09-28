import React from 'react';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { ExperienceGuide } from './experienceGuides';

interface StorytellerJourneyLayoutProps {
  guide: ExperienceGuide;
  activeChapter: number;
  onSelectChapter: (chapter: number) => void;
}

export const StorytellerJourneyLayout: React.FC<StorytellerJourneyLayoutProps> = ({
  guide,
  activeChapter,
  onSelectChapter,
}) => {
  const chapter = guide.concepts[activeChapter] ?? guide.concepts[0];
  const chapterNumber = activeChapter + 1;

  return (
    <section className="experience-story" aria-label="Storyteller's learning journey">
      <div className="experience-story__masthead">
        <span>{guide.eyebrow} <i /> A STORY IN {String(guide.concepts.length).padStart(2, '0')} CHAPTERS</span>
        <span>CHAPTER {String(chapterNumber).padStart(2, '0')} / {String(guide.concepts.length).padStart(2, '0')}</span>
      </div>
      <div
        className="experience-story__progress"
        role="progressbar"
        aria-label="Story chapter selected"
        aria-valuemin={1}
        aria-valuemax={guide.concepts.length}
        aria-valuenow={chapterNumber}
        aria-valuetext={`Chapter ${chapterNumber} of ${guide.concepts.length}`}
      >
        <span style={{ width: `${(chapterNumber / guide.concepts.length) * 100}%` }} />
      </div>
      <div className="experience-story__body">
        <div className="experience-story__chapter-mark">
          <span>0{chapterNumber}</span>
          <i />
          <small>{chapter.title}</small>
        </div>
        <div className="experience-story__copy" aria-live="polite">
          <p className="experience-story__lead">{guide.introduction}</p>
          <h1>{chapter.title}</h1>
          <p>{chapter.detail}</p>
          <details className="experience-story__aside">
            <summary>Pause here: what does this idea not mean?</summary>
            <p>{guide.boundary}</p>
          </details>
          <a href="#experience-canvas" className="experience-story__continue">
            Continue into the experience <ArrowDown size={15} aria-hidden="true" />
          </a>
        </div>
      </div>
      <nav aria-label="Story chapters" className="experience-story__chapters">
        {guide.concepts.map((concept, index) => (
          <button
            key={concept.id}
            type="button"
            aria-pressed={activeChapter === index}
            onClick={() => onSelectChapter(index)}
          >
            <span>0{index + 1}</span>
            {concept.title}
            {index < guide.concepts.length - 1 && <ArrowRight size={13} aria-hidden="true" />}
          </button>
        ))}
      </nav>
    </section>
  );
};
