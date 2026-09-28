import React from 'react';
import { ArrowRight, MessageCircleQuestion } from 'lucide-react';
import { ExperienceGuide } from './experienceGuides';

interface SocraticDialogueLayoutProps {
  guide: ExperienceGuide;
  selectedQuestion: number;
  onSelectQuestion: (question: number) => void;
}

export const SocraticDialogueLayout: React.FC<SocraticDialogueLayoutProps> = ({
  guide,
  selectedQuestion,
  onSelectQuestion,
}) => {
  const question = guide.questions[selectedQuestion] ?? guide.questions[0];

  return (
    <section className="experience-socratic" aria-label="Guided Socratic inquiry">
      <div className="experience-socratic__intro">
        <span><MessageCircleQuestion size={14} aria-hidden="true" /> THE SOCRATIC DIALOGUE</span>
        <h1>Start with a better question.</h1>
        <p>{guide.introduction}</p>
      </div>
      <div className="experience-socratic__conversation">
        <div className="experience-socratic__questions" role="group" aria-label="Choose an inquiry">
          {guide.questions.map((item, index) => (
            <button
              key={item.question}
              type="button"
              aria-pressed={selectedQuestion === index}
              onClick={() => onSelectQuestion(index)}
            >
              <span>ASK 0{index + 1}</span>
              <strong>{item.question}</strong>
              <ArrowRight size={14} aria-hidden="true" />
            </button>
          ))}
        </div>
        <div className="experience-socratic__answer" aria-live="polite">
          <span>GUIDED RESPONSE / NOT A PERSONAL DIAGNOSIS</span>
          <h2>{question.question}</h2>
          <p>{question.response}</p>
        </div>
      </div>
      <details className="experience-socratic__branches">
        <summary>Follow a concept deeper <span>OPEN AN INQUIRY TREE</span></summary>
        <div className="experience-socratic__branch-list">
          {guide.concepts.map((concept, index) => (
            <details key={concept.id}>
              <summary><span>0{index + 1}</span>{concept.title}</summary>
              <p>{concept.detail}</p>
            </details>
          ))}
        </div>
      </details>
      <p className="experience-socratic__boundary">{guide.boundary}</p>
    </section>
  );
};
