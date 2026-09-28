import { ActiveTab } from '../../types/neuro';

export interface ExperienceConcept {
  id: string;
  title: string;
  summary: string;
  detail: string;
}

export interface ExperienceQuestion {
  question: string;
  response: string;
}

export interface ExperienceGuide {
  eyebrow: string;
  title: string;
  introduction: string;
  boundary: string;
  concepts: ExperienceConcept[];
  questions: ExperienceQuestion[];
}

export const EXPERIENCE_GUIDES: Record<ActiveTab, ExperienceGuide> = {
  training: {
    eyebrow: 'COGNITIVE PRACTICE',
    title: 'A task is not a brain scan.',
    introduction: 'Practice a defined skill, notice what the task records, and keep the result in context.',
    boundary: 'Task performance can describe this exercise; it does not diagnose a condition or directly measure brain activity.',
    concepts: [
      { id: 'attention', title: 'Attention', summary: 'Respond to a target while filtering competing cues.', detail: 'Selective attention tasks create a specific demand. They show how you performed under those instructions, not how attentive you are in every setting.' },
      { id: 'working-memory', title: 'Working memory', summary: 'Keep and update information while a task unfolds.', detail: 'A working memory exercise samples performance on that task. One score cannot stand in for the whole of memory or intelligence.' },
      { id: 'inhibition', title: 'Response control', summary: 'Choose when to act and when to withhold a response.', detail: 'Response inhibition is one process involved in some tasks; a result can also reflect instructions, practice, fatigue, and context.' },
      { id: 'measurement', title: 'Task measures', summary: 'Accuracy and response time describe task performance.', detail: 'These are behavioral measures. They are not neural signals and should not be read as a diagnosis.' },
    ],
    questions: [
      { question: 'What is this practice designed to exercise?', response: 'Each exercise sets a particular task demand, such as tracking a target, holding information in mind, or deciding when to respond.' },
      { question: 'What can I learn from a result?', response: 'You can review your performance on that exercise and compare sessions cautiously, noting changes in instructions, practice, and context.' },
      { question: 'What can’t a score tell me?', response: 'A task score is not a direct brain measurement, a diagnosis, or a complete account of your cognitive abilities.' },
    ],
  },
  flow: {
    eyebrow: 'FLOW · FIRST PERSON INQUIRY',
    title: 'Describe the experience before naming it.',
    introduction: 'Explore how challenge, attention, feedback, and felt experience may come together during an activity.',
    boundary: 'These are psychological ideas for reflection, not a checklist that confirms flow or a state this site can detect.',
    concepts: [
      { id: 'challenge', title: 'Challenge and skill fit', summary: 'A meaningful stretch that still feels within reach.', detail: 'Flow theory often discusses a balance between challenge and skill. This fit depends on context, changes over time, and does not guarantee flow.' },
      { id: 'goals', title: 'Clear next steps', summary: 'Know what action the moment asks for.', detail: 'Clear goals can make it easier to direct attention. A useful goal may be the next step, not a distant outcome.' },
      { id: 'feedback', title: 'Understandable feedback', summary: 'Notice cues about how an action is working.', detail: 'Feedback may come from the activity itself. It need not mean praise, a score, or immediate success.' },
      { id: 'experience', title: 'Felt experience', summary: 'Notice absorption, time, control, and reward.', detail: 'People can describe these experiences differently. No single feature, including deep focus, establishes that flow occurred.' },
    ],
    questions: [
      { question: 'What do psychologists mean by flow?', response: 'Flow describes deep involvement in an activity. Research commonly examines several reported features, not one magic feeling.' },
      { question: 'What can I notice in my own session?', response: 'Start with concrete details: the task, its challenge, the next step, feedback, interruptions, and how the experience felt from the inside.' },
      { question: 'Can this page tell me I was in flow?', response: 'No. The sliders and prompts are teaching and reflection tools. They do not detect, score, or diagnose a flow state.' },
    ],
  },
  soundscape: {
    eyebrow: 'SOUND · PERSONAL CONTEXT',
    title: 'A soundscape is an invitation, not an instrument.',
    introduction: 'Explore listening environments as optional context for your own work or reflection.',
    boundary: 'Audio preferences are personal. Playback does not read attention, brainwaves, or emotional state.',
    concepts: [
      { id: 'ambience', title: 'Ambient sound', summary: 'A steady backdrop without a task to complete.', detail: 'An ambient track can offer a listening environment. Whether it feels useful is individual and can vary by activity.' },
      { id: 'rhythm', title: 'Rhythm & pace', summary: 'Sound can shape the feel of a listening session.', detail: 'A rhythm may feel energizing or distracting to different listeners. That response is not a measurement of cognitive state.' },
      { id: 'choice', title: 'Personal choice', summary: 'Notice what you prefer, including silence.', detail: 'Choosing silence is a valid option. A soundscape is not required for focus, recovery, or flow.' },
      { id: 'evidence', title: 'Evidence boundary', summary: 'Listening does not reveal neural activity.', detail: 'This player delivers audio. It has no sensor that measures brain activity or identifies a mental state.' },
    ],
    questions: [
      { question: 'What is a soundscape for?', response: 'It provides an optional listening environment. You can use it, change it, or choose silence.' },
      { question: 'How do I know whether it suits me?', response: 'Notice your own experience during a task and compare contexts cautiously. A preference is personal, not a universal effect.' },
      { question: 'Can audio reveal my state?', response: 'No. Playback is not a brain sensor and cannot infer your attention, mood, or flow.' },
    ],
  },
  tracker: {
    eyebrow: 'PRACTICE · OBSERVE CHANGE',
    title: 'A log is a record, not a verdict.',
    introduction: 'Use repeated task entries to notice patterns in your own practice over time.',
    boundary: 'Session records summarize task results. They are not clinical evidence or direct measures of brain function.',
    concepts: [
      { id: 'repeat', title: 'Repeated sessions', summary: 'Patterns are easier to notice across more than one attempt.', detail: 'Repeated observations can raise useful questions, while task familiarity and everyday context may also change.' },
      { id: 'accuracy', title: 'Accuracy', summary: 'A count of correct responses in a defined task.', detail: 'Accuracy needs task instructions and context to make sense; it is not a general rating of cognitive ability.' },
      { id: 'response-time', title: 'Response time', summary: 'How quickly a response was recorded in the task.', detail: 'Speed can trade off with accuracy and can vary with device, practice, and other conditions.' },
      { id: 'comparison', title: 'Careful comparison', summary: 'Ask what changed before explaining why.', detail: 'A difference from one session to the next alone does not establish a cause. Record context and treat patterns as clues.' },
    ],
    questions: [
      { question: 'What does the tracker collect?', response: 'It organizes practice results saved by the exercises. Check the task and its conditions before interpreting a number.' },
      { question: 'How should I compare sessions?', response: 'Look for repeated patterns, note changes in context, and avoid treating one difference as proof that a particular factor caused it.' },
      { question: 'Is a trend a diagnosis?', response: 'No. A practice log is a personal record, not a validated clinical assessment or a direct brain measurement.' },
    ],
  },
  education: {
    eyebrow: 'NEUROSCIENCE · LEARNING MODELS',
    title: 'A brain model is a map, not a scan.',
    introduction: 'Use diagrams and explanations to learn about brain structures, networks, and psychological ideas.',
    boundary: 'Educational visuals simplify research. They do not show your brain or assign a single mental function to one region.',
    concepts: [
      { id: 'regions', title: 'Brain regions', summary: 'Structures participate in multiple, connected processes.', detail: 'A region label is a teaching aid. Most behavior depends on networks and context, not one isolated spot.' },
      { id: 'networks', title: 'Networks', summary: 'Connected regions can coordinate during a task.', detail: 'Network diagrams simplify complex connections; an animation here is not a live signal or personal brain recording.' },
      { id: 'pathways', title: 'Neural pathways', summary: 'Information can travel through connected circuits.', detail: 'Pathway illustrations help explain a concept. They should not be mistaken for a literal view of an individual thought.' },
      { id: 'evidence', title: 'Research evidence', summary: 'Methods determine what a study can support.', detail: 'Interpret a finding in light of its methods, sample, limitations, and whether other evidence supports it.' },
    ],
    questions: [
      { question: 'What does a brain diagram show?', response: 'It is a simplified educational representation, useful for naming structures and discussing research.' },
      { question: 'Why talk about networks?', response: 'Many cognitive processes involve coordinated activity across multiple regions rather than a single isolated area.' },
      { question: 'Is this animation my brain activity?', response: 'No. The animation is an illustration; this application does not record or display your neural activity.' },
    ],
  },
  rehab: {
    eyebrow: 'CARE · FIND AND VERIFY',
    title: 'A directory can start a conversation.',
    introduction: 'Use provider and program information as a starting point for your own verification and questions.',
    boundary: 'Listings are not endorsements or personal medical advice. Confirm credentials, availability, and suitability directly.',
    concepts: [
      { id: 'scope', title: 'Scope of care', summary: 'Clarify what a service offers and whom it serves.', detail: 'Ask whether the provider has experience relevant to your needs and what an initial consultation includes.' },
      { id: 'credentials', title: 'Credentials', summary: 'Verify qualifications with an appropriate source.', detail: 'A listing alone cannot verify a professional’s current registration, training, or suitability for your situation.' },
      { id: 'questions', title: 'Useful questions', summary: 'Ask about approach, access, costs, and follow-up.', detail: 'A direct conversation can help you understand options and decide what additional information you need.' },
      { id: 'choice', title: 'Your decision', summary: 'Choose care with qualified people who understand your context.', detail: 'This directory is informational. It does not replace assessment or advice from a qualified professional.' },
    ],
    questions: [
      { question: 'What is this directory for?', response: 'It is an informational starting point for exploring services and preparing questions.' },
      { question: 'What should I verify?', response: 'Check current credentials, location, availability, costs, and whether the service fits your needs directly with the provider.' },
      { question: 'Does a listing recommend treatment?', response: 'No. A listing is not an endorsement, diagnosis, or personalized treatment recommendation.' },
    ],
  },
  library: {
    eyebrow: 'LIBRARY · READ WITH CONTEXT',
    title: 'A protocol is a structured resource.',
    introduction: 'Explore educational materials and examine how each source describes its evidence and limits.',
    boundary: 'Library content is for learning and does not prescribe a personal treatment plan.',
    concepts: [
      { id: 'source', title: 'Source', summary: 'Notice who created the resource and for whom.', detail: 'Authorship, expertise, and intended audience help you decide how to read a resource.' },
      { id: 'method', title: 'Method', summary: 'Ask how the underlying claim was studied.', detail: 'Study design and measurement shape the kind of conclusion that can be drawn.' },
      { id: 'limits', title: 'Limitations', summary: 'Find what the evidence cannot answer.', detail: 'Sample size, context, uncertainty, and replication all matter when judging a claim.' },
      { id: 'application', title: 'Application', summary: 'Separate general education from personal advice.', detail: 'A research summary does not establish which action is right for an individual.' },
    ],
    questions: [
      { question: 'How should I read a protocol?', response: 'Start with its goal, audience, source, methods, and stated limitations.' },
      { question: 'What makes evidence useful?', response: 'A clear method, appropriate measures, transparent uncertainty, and corroboration from other research can strengthen a claim.' },
      { question: 'Can a resource decide my care?', response: 'No. Educational material can inform questions, but a qualified professional can help apply evidence to your circumstances.' },
    ],
  },
  community: {
    eyebrow: 'COMMUNITY · LISTEN WITH CARE',
    title: 'A personal account is a starting point.',
    introduction: 'Exchange experiences with curiosity while distinguishing lived experience from general evidence.',
    boundary: 'Community discussion is peer conversation, not professional care, diagnosis, or a substitute for urgent support.',
    concepts: [
      { id: 'experience', title: 'Lived experience', summary: 'A person’s account matters on its own terms.', detail: 'Respect what someone says about their experience without assuming it represents everyone’s.' },
      { id: 'curiosity', title: 'Open questions', summary: 'Ask before interpreting another person’s story.', detail: 'Open questions make space for people to define what they mean.' },
      { id: 'evidence', title: 'Evidence & opinion', summary: 'Label a personal view as a personal view.', detail: 'Anecdotes can suggest questions; they do not by themselves establish a general cause or treatment effect.' },
      { id: 'boundaries', title: 'Support boundaries', summary: 'Know when to turn to qualified help.', detail: 'Peer support has limits. For personal medical concerns, consult a qualified professional.' },
    ],
    questions: [
      { question: 'What makes a discussion supportive?', response: 'Listen, ask open questions, avoid assumptions, and respect each person’s boundaries and choices.' },
      { question: 'Does one story prove a general claim?', response: 'No. Personal accounts are meaningful but cannot by themselves establish what is true for everyone.' },
      { question: 'Is peer conversation clinical care?', response: 'No. Community discussion does not replace assessment, treatment, or urgent support from qualified services.' },
    ],
  },
  blueprint: {
    eyebrow: 'PLATFORM · DESIGN & EVIDENCE',
    title: 'Build tools around honest limits.',
    introduction: 'Explore how learning, practice, reflection, and privacy fit into one platform.',
    boundary: 'The product organizes exercises and educational material; it does not observe neural signals or diagnose users.',
    concepts: [
      { id: 'practice', title: 'Practice tools', summary: 'Interactive tasks capture defined user responses.', detail: 'A task can report its recorded performance, not a hidden neural process or a broad clinical conclusion.' },
      { id: 'education', title: 'Learning layer', summary: 'Explanations clarify concepts and uncertainty.', detail: 'A useful educational experience distinguishes established evidence, simplified models, and metaphor.' },
      { id: 'reflection', title: 'Reflection layer', summary: 'Prompts help users describe their own experience.', detail: 'Reflecting on an experience can support curiosity but is not an objective sensor or controlled experiment.' },
      { id: 'privacy', title: 'Privacy boundaries', summary: 'Make storage and sharing choices visible.', detail: 'Local storage, clipboard actions, and external services have different privacy implications; make those boundaries explicit.' },
    ],
    questions: [
      { question: 'What does the platform bring together?', response: 'It combines interactive practice, educational material, reflection prompts, and optional supporting resources.' },
      { question: 'What is the most important evidence boundary?', response: 'Distinguish observed task results and personal reports from neural measurement, diagnosis, or causal proof.' },
      { question: 'How should a feature earn trust?', response: 'Explain its purpose and limits, preserve user choice, use accessible interaction, and be clear about what data is stored or shared.' },
    ],
  },
};
