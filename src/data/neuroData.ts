import { 
  BrainRegion, 
  EducationalArticle, 
  RehabProtocol, 
  Specialist, 
  ResourceProtocol, 
  ForumPost,
  SubscriptionTier 
} from '../types/neuro';

export const BRAIN_REGIONS: BrainRegion[] = [
  {
    id: 'dlpfc',
    name: 'Dorsolateral Prefrontal Cortex',
    scientificName: 'Brodmann Area 9 & 46 (DLPFC)',
    keyFunctions: ['Working Memory Manipulation', 'Top-Down Attentional Gating', 'Executive Decision Making'],
    cognitiveRole: 'The brain\'s command center. Maintains task-relevant representations while actively shielding attention against environmental distractors.',
    relevantChallenge: 'Dual N-Back & Task Switching',
    neuroplasticityMechanism: 'Dopaminergic D1 receptor activation triggers dendritic spine enlargement and sustained recurrent network firing.',
    coordinates: { x: 38, y: 28 },
  },
  {
    id: 'acc',
    name: 'Anterior Cingulate Cortex',
    scientificName: 'Brodmann Area 24 & 32 (ACC)',
    keyFunctions: ['Conflict Monitoring', 'Error Detection', 'Effort-Value Allocation'],
    cognitiveRole: 'Monitors cognitive competition. Signals when automatic responses must be overridden by deliberate executive control.',
    relevantChallenge: 'Stroop Interference Task',
    neuroplasticityMechanism: 'Synchronous theta-band oscillations coordinate with prefrontal pyramidal cells to resolve sensory ambiguity.',
    coordinates: { x: 46, y: 35 },
  },
  {
    id: 'hippocampus',
    name: 'Hippocampus & Medial Temporal Lobe',
    scientificName: 'Hippocampal Formation (CA1, CA3, DG)',
    keyFunctions: ['Episodic Memory Encoding', 'Pattern Separation', 'Spatial Schema Mapping'],
    cognitiveRole: 'Crucial for consolidating short-term cognitive experiences into enduring synaptic networks via Long-Term Potentiation (LTP).',
    relevantChallenge: 'Spatial Memory & Sequencer',
    neuroplasticityMechanism: 'Adult neurogenesis in the dentate gyrus combined with BDNF expression strengthens synaptogenesis during slow-wave sleep.',
    coordinates: { x: 52, y: 55 },
  },
  {
    id: 'basalganglia',
    name: 'Basal Ganglia & Striatum',
    scientificName: 'Striatum (Caudate / Putamen) & Subthalamic Nucleus',
    keyFunctions: ['Motor Action Gating', 'Response Inhibition', 'Dopaminergic Habit Formation'],
    cognitiveRole: 'Acts as the cognitive gatekeeper. Employs direct (Go) and indirect (No-Go) pathways to either facilitate or suppress reflexive actions.',
    relevantChallenge: 'Go / No-Go Sustained Vigilance',
    neuroplasticityMechanism: 'Long-term depression (LTD) at corticostriatal synapses dampens unwanted impulses and refines automatic motor skill.',
    coordinates: { x: 45, y: 50 },
  },
  {
    id: 'parietal',
    name: 'Posterior Parietal Cortex',
    scientificName: 'Brodmann Area 7 & 40 (Intraparietal Sulcus)',
    keyFunctions: ['Visuospatial Coordinate Transformation', 'Exogenous Spotlight Attention', 'Visual Trail Navigation'],
    cognitiveRole: 'Directs the spotlight of spatial attention across your field of view, calculating continuous trajectories.',
    relevantChallenge: 'Trail Making Test (TMT-B)',
    neuroplasticityMechanism: 'Cross-modal associative rewiring between visual occipital streams and frontal eye fields.',
    coordinates: { x: 62, y: 36 },
  },
];

export const EDUCATIONAL_ARTICLES: EducationalArticle[] = [
  {
    id: 'ltp-plasticity',
    title: 'Synaptic Plasticity 101: How Neurons Rewire Under Deliberate Challenge',
    slug: 'synaptic-plasticity-hebbian-learning',
    category: 'Neuroplasticity',
    readTime: '6 min read',
    author: 'Dr. Elena Vance, PhD',
    authorRole: 'Senior Cognitive Neuroscientist, Oxford NeuroDynamics Lab',
    publishDate: 'September 2026',
    summary: 'The biological reality behind "neurons that fire together, wire together": exploring NMDA receptor opening, calcium influx, and structural dendritic remodeling.',
    keyTakeaways: [
      'Neuroplasticity is not passive; it requires high-focus friction (elevated acetylcholine and noradrenaline).',
      'The actual synaptic consolidation occurs during Non-REM sleep and deliberate rest states.',
      'Calibrated cognitive games generate transient error signals that trigger neurotrophin release.',
    ],
    contentSections: [
      {
        heading: 'The Chemical Ignition: Epinephrine & Acetylcholine',
        body: 'When you encounter a challenging cognitive task, such as the Stroop effect or a 2-Back memory match, your brainstem locus coeruleus releases noradrenaline (epinephrine in the brain) for alertness, while basal forebrain cholinergic neurons release acetylcholine. Acetylcholine acts like a neural highlighter pen, marking the specific circuits that produced the error for subsequent remodeling.'
      },
      {
        heading: 'From Hebbian Theory to Physical Dendritic Spines',
        body: 'Hebbian theory stated that simultaneous activation strengthens connectivity. Today, two-photon in vivo imaging reveals this physically: dendritic spines swell in diameter, and additional AMPA receptors are inserted into the postsynaptic density within 30 to 45 minutes of intensive mental engagement.'
      },
      {
        heading: 'The Consolidation Paradox: Rest as the Architect',
        body: 'Training stimulates the plasticity signal, but the actual synaptic synthesis occurs during subsequent downtime. Without slow-wave delta sleep and brief waking quiescent pauses (such as 10-minute NSDR sessions), new synaptic connections remain labile and prone to regression.'
      }
    ]
  },
  {
    id: 'dopamine-focus-architecture',
    title: 'The Prefrontal Gating Mechanism: Overcoming Digital Attention Fragmentation',
    slug: 'prefrontal-gating-dopamine-focus',
    category: 'Focus & Attention',
    readTime: '8 min read',
    author: 'Prof. Julian Sterling, MD, PhD',
    authorRole: 'Clinical Neurologist & Director of Cognitive Performance',
    publishDate: 'August 2026',
    summary: 'Why fragmented task-switching depletes your prefrontal reserves and how structured Go/No-Go inhibition retraining repairs sustained concentration.',
    keyTakeaways: [
      'Task-switching induces "attention residue" that measurably increases reaction time variance by up to 28%.',
      'The prefrontal cortex acts as an active inhibitory brake, consuming high cellular ATP to suppress distraction.',
      'Daily 10-minute response-inhibition practice strengthens striatal dopamine D2 pathway efficiency.',
    ],
    contentSections: [
      {
        heading: 'Attention Residue and Working Memory Cost',
        body: 'Every time you glance at a notification while working, your brain does not instantaneously pivot back. A residual trace of the interrupted task remains active in DLPFC working memory buffers. In neuropsychological testing, this "attention residue" increases cognitive fatigue and degrades deep analytical reasoning.'
      },
      {
        heading: 'The Striatal Gatekeeper: Go vs. No-Go',
        body: 'Focus is not simply about trying harder to look at the work. It can also involve noticing impulses to look away. The subthalamic nucleus and indirect striatal pathway contribute to motor control, but this exercise does not measure or train a specific brain circuit.'
      }
    ]
  },
  {
    id: 'post-stroke-plasticity-windows',
    title: 'The Critical Recovery Window: Neuro-Rehabilitation After Brain Injury',
    slug: 'post-injury-neuro-rehab-window',
    category: 'Recovery & Rehab',
    readTime: '9 min read',
    author: 'Dr. Maya Lin, PT, DPT, NCS',
    authorRole: 'Board Certified Neurologic Clinical Specialist',
    publishDate: 'July 2026',
    summary: 'Clinical mechanisms of spontaneous recovery versus constraint-induced neuroplasticity in stroke survivors, traumatic brain injury, and long-term neurovascular health.',
    keyTakeaways: [
      'The peri-infarct zone experiences heightened neuroplastic gene expression during the first 3-6 months.',
      'Contralateral homologous cortical areas can be recruited to assume lost executive functions.',
      'Gamified progressive difficulty ensures tasks remain within the optimal zone of proximal challenge (ZPD).',
    ],
    contentSections: [
      {
        heading: 'The Peri-Infarct Cortex & Unmasking Silent Synapses',
        body: 'Following an ischemic event or focal trauma, the brain may experience diaschisis, a temporary change in activity in connected areas. As edema subsides, previously silent or latent horizontal cortical connections can be unmasked through high-repetition, meaningful cognitive challenges.'
      },
      {
        heading: 'Constraint-Induced Cognitive Therapy (CICT)',
        body: 'Just as physical therapists restrict the unaffected arm to force stroke survivors to use the affected limb, cognitive rehabilitation restricts reliance on intuitive heuristics, forcing the injured executive networks to engage in deliberate trail-making and inhibition tasks.'
      }
    ]
  },
  {
    id: 'sleep-synaptic-homeostasis',
    title: 'Synaptic Homeostasis: Why Sleep Cleans Your Mental Slate',
    slug: 'sleep-synaptic-homeostasis-pruning',
    category: 'Sleep & Synapses',
    readTime: '5 min read',
    author: 'Dr. Aris Thorne, PhD',
    authorRole: 'Sleep Neurophysiologist & Circadian Biology Researcher',
    publishDate: 'August 2026',
    summary: 'Tononi & Cirelli\'s Synaptic Homeostasis Hypothesis (SHY): how slow-wave sleep selectively scales down net synaptic weights to preserve energy and memory capacity.',
    keyTakeaways: [
      'Waking learning produces net synaptic potentiation that saturates metabolic capacity by evening.',
      'Slow-wave sleep down-scales baseline synapses while preserving high-priority potentiated connections.',
      'The brain\'s glymphatic fluid flow increases by 60% during sleep, flushing out amyloid and metabolic waste.',
    ],
    contentSections: [
      {
        heading: 'The Energetic Unsustainability of Infinite Learning',
        body: 'If synapses only grew stronger, the brain would quickly exhaust its glucose and ATP supply. The Synaptic Homeostasis Hypothesis demonstrates that slow oscillations during deep non-REM sleep orchestrate global down-scaling, keeping only the most salient signal-to-noise connections.'
      }
    ]
  }
];

export const REHAB_PROTOCOLS: RehabProtocol[] = [
  {
    id: 'stroke-attention-pathway',
    condition: 'Post-Stroke Cognitive & Executive Rehabilitation',
    badge: 'Clinical Protocol #01',
    description: 'Evidence-based cognitive trajectory for restoring sustained visual attention, spatial navigation, and response inhibition following cerebrovascular accidents.',
    targetAreas: ['Prefrontal Cortex', 'Anterior Cingulate', 'Right Parietal Lobe'],
    durationWeeks: 12,
    evidenceTier: 'Grade A (RCT Proven)',
    phases: [
      {
        phase: 1,
        title: 'Weeks 1–3: Sensory Stabilisation & Vigilance',
        focus: 'Low-friction continuous vigilance tasks to re-engage peri-infarct alertness networks.',
        exercises: ['Slow Go/No-Go (1500ms stimulus window)', 'Visual Tracking Calibration', '40Hz Acoustic Entrainment (15 min/day)']
      },
      {
        phase: 2,
        title: 'Weeks 4–8: Conflict Resolution & Working Memory',
        focus: 'Progressive interference exposure to retrain prefrontal decision hierarchies.',
        exercises: ['Congruent-to-Incongruent Stroop Task', '1-Back to 2-Back Spatial Grid', 'Daily 90-Minute Ultradian Sleep hygiene']
      },
      {
        phase: 3,
        title: 'Weeks 9–12: Multitasking & Cognitive Flexibility',
        focus: 'Complex dual-tasking and cognitive sequencing under light time constraints.',
        exercises: ['Trail Making Test B (Alternating Alphanumeric)', 'Complex Rule-Switching Challenge', 'Independent Community Navigation']
      }
    ]
  },
  {
    id: 'tbi-concussion-pacing',
    condition: 'Mild TBI & Post-Concussive Cognitive Resumption',
    badge: 'Clinical Protocol #02',
    description: 'A sub-symptom threshold cognitive exercise framework designed to prevent symptom flare-ups while stimulating neurovascular coupling.',
    targetAreas: ['Diffuse Axonal Bundles', 'Dorsal Attention Network', 'Hippocampus'],
    durationWeeks: 8,
    evidenceTier: 'Grade A (RCT Proven)',
    phases: [
      {
        phase: 1,
        title: 'Weeks 1–2: Sub-Symptom Baseline Calibration',
        focus: 'Establishing cognitive threshold limits without triggering headaches or photophobia.',
        exercises: ['Low-contrast Go/No-Go (5 min max)', 'Brown Noise Acoustic Masking for Sensory Gating', 'Rest intervals between sets']
      },
      {
        phase: 2,
        title: 'Weeks 3–5: Visual-Motor Coordination & Processing Speed',
        focus: 'Gradual speed escalation while monitoring autonomic heart-rate variability.',
        exercises: ['Trail Making Test A & B', 'Auditory 1-Back Memory Trials', 'Active Recovery Walk Protocol']
      },
      {
        phase: 3,
        title: 'Weeks 6–8: High-Order Executive Function',
        focus: 'Full reintegration into complex work, academic, and social environments.',
        exercises: ['2-Back Dual Modality', 'Stress-Inoculated Stroop Test', 'Real-world multitasking simulations']
      }
    ]
  },
  {
    id: 'adhd-executive-rewiring',
    condition: 'Adult ADHD & Executive Dysfunction Neuromodulation',
    badge: 'Clinical Protocol #03',
    description: 'Behavioral and cognitive challenge regimen targeting dopaminergic striatal pathways to enhance impulse control and task persistence.',
    targetAreas: ['Basal Ganglia', 'Frontoparietal Network', 'DLPFC'],
    durationWeeks: 10,
    evidenceTier: 'Grade B (Peer Reviewed)',
    phases: [
      {
        phase: 1,
        title: 'Weeks 1–3: Impulse Invalidation & Motor Inhibition',
        focus: 'Strengthening the physiological brake on reflexive action triggers.',
        exercises: ['High-Frequency Go/No-Go Challenge', 'Dopamine Friction Habit Logging', '40Hz Binaural Beats during deep work blocks']
      },
      {
        phase: 2,
        title: 'Weeks 4–7: Working Memory Buffer Expansion',
        focus: 'Expanding the mental workbench to reduce reliance on external reminders.',
        exercises: ['Dual N-Back Training (20 min daily)', 'Structured Pomodoro with Ultradian Breaks', 'Task breakdown scaffolding']
      },
      {
        phase: 3,
        title: 'Weeks 8–10: Cognitive Stamina & Self-Regulation',
        focus: 'Sustaining focus during low-stimulation, high-friction analytical tasks.',
        exercises: ['Interleaved Stroop Challenge', 'Accountability Milestone Logging', 'Long-form deep reading sprints']
      }
    ]
  },
  {
    id: 'neuro-burnout-vagal-reset',
    condition: 'Chronic Cognitive Burnout & Neuro-Inflammatory Reset',
    badge: 'Clinical Protocol #04',
    description: 'Comprehensive restorative protocol addressing sympathetic nervous system overactivation, brain fog, and chronic cognitive depletion.',
    targetAreas: ['Amygdala Down-Regulation', 'Vagus Nerve', 'Prefrontal Glymphatics'],
    durationWeeks: 6,
    evidenceTier: 'Clinical Consensus',
    phases: [
      {
        phase: 1,
        title: 'Weeks 1–2: Autonomic Down-Regulation',
        focus: 'Restoring vagal tone and dampening amygdala hyper-vigilance.',
        exercises: ['Theta (6Hz) Audio Sessions', '10-Minute Physiological Sigh / NSDR Audio', 'Screen-free morning circadian light']
      },
      {
        phase: 2,
        title: 'Weeks 3–4: Gentle Cognitive Reactivation',
        focus: 'Reintroducing low-stress cognitive challenges with high success feedback.',
        exercises: ['Trail Making Level 1', 'Alpha 10Hz Flow audio work blocks', 'Magnesium L-Threonate & Glycine sleep routine']
      },
      {
        phase: 3,
        title: 'Weeks 5–6: Sustainable Cognitive Architecture',
        focus: 'Building resilient boundaries to protect against repeat burnout.',
        exercises: ['Full Cognitive Battery Assessment', 'Habit Loop Design Worksheets', 'Weekly peer accountability check-in']
      }
    ]
  }
];

export const SPECIALISTS: Specialist[] = [
  {
    id: 'dr-kavita-sharma',
    name: 'Dr. Kavita Sharma, MD',
    title: 'Cognitive Neurologist & Neurorehabilitation Fellow',
    institution: 'Johns Hopkins Department of Neurology',
    location: 'Baltimore, MD (Telehealth & In-Person)',
    rating: 4.96,
    reviewCount: 142,
    specialties: ['Stroke Recovery', 'Mild Cognitive Impairment', 'Aphasia', 'Motor Relearning'],
    bio: 'Specializing in neurovascular recovery and computerized cognitive remediation protocols. Has guided over 800 stroke survivors through evidence-based neuroplasticity pathways.',
    yearsExperience: 14,
    verified: true,
    acceptingPatients: true,
    consultationFee: '$260 / Initial Intake',
  },
  {
    id: 'dr-marcus-weber',
    name: 'Dr. Marcus Weber, PhD, ABPP-CN',
    title: 'Board Certified Clinical Neuropsychologist',
    institution: 'Stanford Cognitive Neuroscience Clinic',
    location: 'Palo Alto, CA (Telehealth Nationwide)',
    rating: 4.98,
    reviewCount: 98,
    specialties: ['Traumatic Brain Injury', 'Sports Concussion', 'Executive Dysfunction', 'ADHD'],
    bio: 'Pioneered computerized dual N-back and response inhibition protocols for clinical athletic recovery and adult executive function restructuring.',
    yearsExperience: 16,
    verified: true,
    acceptingPatients: true,
    consultationFee: '$290 / Initial Intake',
  },
  {
    id: 'dr-sophie-dubois',
    name: 'Dr. Sophie Dubois, DPT, NCS',
    title: 'Neurologic Physical Therapist & Vestibular Specialist',
    institution: 'Mount Sinai Rehabilitation Hospital',
    location: 'New York, NY (In-Person & Hybrid)',
    rating: 4.92,
    reviewCount: 114,
    specialties: ['Post-Concussion Syndrome', 'Vestibular Dysfunction', 'Spatial Neglect', 'Balance'],
    bio: 'Expert in multi-sensory integration, combining visual-motor challenges (like Trail Making and saccadic training) with physical rehabilitation exercises.',
    yearsExperience: 11,
    verified: true,
    acceptingPatients: false,
    consultationFee: '$210 / Initial Intake',
  },
  {
    id: 'dr-david-chen',
    name: 'Dr. David Chen, MD, PhD',
    title: 'Neuro-Psychiatrist & Circadian Biologist',
    institution: 'Northwestern Memorial Neuroscience Institute',
    location: 'Chicago, IL (Telehealth)',
    rating: 4.95,
    reviewCount: 87,
    specialties: ['Brain Fog / Long COVID', 'Burnout Neurobiology', 'Sleep Architecture', 'ADHD'],
    bio: 'Researches the intersection of chronic neuro-inflammation, autonomic dysregulation, and prefrontal dopamine clearance in high-cognitive-demand professionals.',
    yearsExperience: 12,
    verified: true,
    acceptingPatients: true,
    consultationFee: '$275 / Initial Intake',
  }
];

export const RESOURCE_PROTOCOLS: ResourceProtocol[] = [
  {
    id: 'res-ultradian',
    title: 'The 90-Minute Ultradian Focus Sprint Protocol',
    category: 'Focus Protocol',
    duration: '90 min work + 20 min reset',
    difficulty: 'Beginner',
    citation: 'Kleitman, N. (1982). Basic rest-activity cycle, 22 years later. Sleep, 5(4), 311-317.',
    description: 'Biological rhythm protocol utilizing your natural 90-minute basic rest-activity cycles to maximize DLPFC output without triggering cognitive fatigue.',
    steps: [
      'Minute 0–5: Cognitive Ramp-Up (Set single clear target, eliminate physical clutter, 40Hz audio on).',
      'Minute 5–15: Friction Zone (Acknowledge initial mental resistance; noradrenaline elevates).',
      'Minute 15–75: Deep Linear Focus (Peak synaptic binding; execute without task switching).',
      'Minute 75–90: Synthesis & Cool-Down (Log progress, catalog next friction point).',
      'Minute 90–110: Absolute Non-Sleep Deep Rest / Panoramic Vision Walk (No phone, no reading).'
    ],
    downloadFileName: 'SynapSync_90Min_Ultradian_Protocol.pdf'
  },
  {
    id: 'res-nsdr',
    title: 'Physiological Sigh & 10-Min Non-Sleep Deep Rest (NSDR)',
    category: 'Sleep & Recovery',
    duration: '10–12 min',
    difficulty: 'Beginner',
    citation: 'Balban et al. (2023). Brief structured respiration practices enhance mood and reduce physiological arousal. Cell Reports Medicine.',
    description: 'A rapid autonomic down-regulator that resets extracellular striatal dopamine levels and reduces cortisol within 10 minutes of deliberate breathing.',
    steps: [
      'Step 1: Perform 2 consecutive nasal inhales (one deep, followed immediately by a sharp top-off).',
      'Step 2: Release through mouth with a long, unforced exhale until lungs are empty.',
      'Step 3: Repeat 3 times to immediately lower heart rate via the respiratory sinus arrhythmia mechanism.',
      'Step 4: Transition to 8 minutes of passive body-scan neuro-meditation with 6Hz Theta audio.'
    ],
    downloadFileName: 'SynapSync_NSDR_Autonomic_Guide.pdf'
  },
  {
    id: 'res-habit-rewire',
    title: 'Dopaminergic Habit Rewiring Matrix',
    category: 'Habit Architecture',
    duration: 'Daily 5-min audit',
    difficulty: 'Intermediate',
    citation: 'Wood, W., & Rünger, D. (2016). Psychology of habit. Annual Review of Psychology, 67, 289-314.',
    description: 'Systematic framework to uncouple the automatic striatal habit loop (Cue -> Craving -> Response -> Reward) by inserting deliberate prefrontal delay friction.',
    steps: [
      'Identify the exact sensory Cue (e.g. feeling tired -> opening social media app).',
      'Introduce a 60-second Go/No-Go pause threshold between Craving and Action.',
      'Substitute an alternative high-dopamine adaptive action (e.g. 10 jumping jacks or 20 deep breaths).',
      'Anchor an immediate cognitive reward: record completion in the plasticity streak tracker.'
    ],
    downloadFileName: 'SynapSync_Habit_Rewiring_Matrix.pdf'
  },
  {
    id: 'res-concussion-checklist',
    title: 'Return-to-Learn & Cognitive Concussion Pacing Checklist',
    category: 'Recovery & Rehab',
    duration: 'Weekly tracking',
    difficulty: 'Clinical',
    citation: 'McCrory et al. (2017). Consensus statement on concussion in sport. British Journal of Sports Medicine.',
    description: 'Tiered clinical staging rubric for students, professionals, and patients navigating symptom-free cognitive return after mild traumatic brain injury.',
    steps: [
      'Stage 1: Daily living activities that do not provoke symptoms (>2 on 10-point scale).',
      'Stage 2: School or work activities at home (15-minute intervals with auditory masking).',
      'Stage 3: Return to part-time desk work with cognitive accommodations (no exams or high-stakes deadlines).',
      'Stage 4: Full cognitive load clearance following computerized neuro-cognitive reassessment.'
    ],
    downloadFileName: 'SynapSync_Concussion_Pacing_Rubric.pdf'
  }
];

export const FORUM_POSTS: ForumPost[] = [
  {
    id: 'post-1',
    author: 'Marcus_T_Rehab',
    authorBadge: 'Stroke Survivor · 18 Mo Post',
    timeAgo: '2 hours ago',
    title: 'How daily Stroop & 2-Back tasks helped me regain conversational fluency after MCA stroke',
    category: 'Stroke Recovery',
    content: 'When I had my left middle cerebral artery ischemic stroke in early 2025, word-finding was a nightmare. My speech therapist recommended doing 10 minutes of response inhibition (Go/No-Go and Stroop) every morning alongside traditional speech drills. The hypothesis was that training prefrontal conflict resolution would help unblock lexical retrieval. After 90 consecutive days, my verbal latency dropped from 1400ms down to 680ms. Don\'t give up on neuroplasticity!',
    upvotes: 42,
    repliesCount: 6,
    replies: [
      {
        id: 'rep-1',
        author: 'Dr_Sharma_Neuro',
        timeAgo: '1 hour ago',
        content: 'Remarkable progress, Marcus! What you experienced is classical recruitment of peri-infarct associative networks. Keeping that daily habit consistent is the gold standard.'
      },
      {
        id: 'rep-2',
        author: 'Elena_K',
        timeAgo: '45 mins ago',
        content: 'Did you use binaural audio while doing the tasks or quiet room? I am at 6 months post-concussion and trying to build my routine.'
      }
    ]
  },
  {
    id: 'post-2',
    author: 'ADHD_Hacker_99',
    authorBadge: 'Software Architect',
    timeAgo: '5 hours ago',
    title: '40Hz Gamma Audio + 2-Back warmups completely transformed my coding deep work',
    category: 'ADHD & Focus',
    content: 'I have severe combined ADHD and medication helped, but I still suffered from chronic task-switching paralysis. For the past month, my ritual is: 5 minutes of 2-Back Spatial Training right before opening my IDE, with 40Hz Gamma binaural beats running through open-back headphones. It feels like putting physical training wheels on my prefrontal cortex. Anyone else find 40Hz works better than brown noise for analytical code?',
    upvotes: 38,
    repliesCount: 4,
    replies: [
      {
        id: 'rep-3',
        author: 'Liam_NeuroDev',
        timeAgo: '3 hours ago',
        content: 'Yes! The 40Hz oscillation binds sensory processing. MIT research on gamma oscillations shows it drives parvalbumin-positive interneurons which directly dampens background chatter.'
      }
    ]
  },
  {
    id: 'post-3',
    author: 'Sarah_LongCovid',
    authorBadge: 'Recovery Patient',
    timeAgo: '1 day ago',
    title: 'Pacing vs Pushing: Why gradual Trail Making scores showed me I was over-training',
    category: 'Brain Fog / Long Covid',
    content: 'In early recovery from post-viral neuro-inflammation, I made the mistake of pushing through fatigue. When I started logging my Trail Making Test reaction times in SynapSync, I noticed that on days my reaction latency jumped by >25%, I had a major crash 48 hours later. Now I use my morning cognitive latency as a biomarker: if latency is high, I switch to 10Hz Alpha and NSDR instead of pushing intense work.',
    upvotes: 29,
    repliesCount: 3,
    replies: [
      {
        id: 'rep-4',
        author: 'NeuroDoc_Chen',
        timeAgo: '18 hours ago',
        content: 'Using cognitive reaction time variance as an objective symptom surrogate is brilliant. We often see cognitive latency shifts precede subjective post-exertional malaise.'
      }
    ]
  }
];

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'free',
    name: 'Starter Neuro-Explorer',
    priceMonthly: 0,
    priceAnnual: 0,
    description: 'Essential scientific challenges and evidence-based educational library for daily cognitive maintenance.',
    features: [
      'Access to Stroop & Go/No-Go daily challenges',
      'Basic 7-day cognitive performance history',
      'Access to 40 Hz Gamma & 10 Hz Alpha soundscapes',
      'Full access to Educational Hub & Neuroscience Atlas',
      'Community discussion board read & post access',
    ],
    limitations: [
      'Limited to 3 training sessions per day',
      'No personalized clinical recovery protocols',
      'No clinician PDF data export',
    ],
    ctaText: 'Current Active Tier',
  },
  {
    id: 'pro',
    name: 'Pro Neuro-Athlete',
    priceMonthly: 19,
    priceAnnual: 180,
    popular: true,
    badge: 'Most Popular',
    description: 'For knowledge workers, students, and athletes committed to peak executive function and working memory capacity.',
    features: [
      'Unlimited access to all 4 scientific paradigms (Dual N-Back, TMT-B, Stroop, Go/No-Go)',
      'High-resolution millisecond latency analytics & percentile benchmarking',
      'Full Neuro-Audio Studio (all 6 binaural carrier frequencies & noise colors)',
      'Dynamic difficulty scaling (Adaptive N-Back level 1–5)',
      'Comprehensive Neuroplasticity Index (NPI) & domain radar tracking',
      'Automated habit rewiring matrix & printable clinical worksheets',
    ],
    ctaText: 'Upgrade to Pro Athlete',
  },
  {
    id: 'clinical',
    name: 'Clinical & Rehabilitation',
    priceMonthly: 49,
    priceAnnual: 470,
    badge: 'Clinical Grade',
    description: 'Tailored for stroke recovery, TBI survivors, ADHD neuromodulation, and direct collaboration with licensed specialists.',
    features: [
      'Everything in Pro Neuro-Athlete tier',
      'Curated 6–12 week guided rehabilitation pathways with milestone certification',
      'Direct provider portal: share HIPAA-compliant longitudinal reports with your therapist',
      'Sub-symptom pacing telemetry & cognitive crash early-warning alert',
      'Priority booking intake with verified board-certified neurologists & specialists',
      'Monthly live interactive Q&A roundtables with clinical neuroscientists',
    ],
    ctaText: 'Access Clinical Care',
  }
];
