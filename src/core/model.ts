import type { Language, Mode, TrackId } from '../content/schema';

export interface Settings {
  theme: 'dark' | 'light';
  fontSize: number;
  keybindings: 'default' | 'vim';
  language: Language;
  sound: boolean;
  reducedMotion: boolean;
  role: 'Backend SWE' | 'DevOps/SRE' | 'ML/AI Engineer';
  dailyMinutes: number;
  interviewDate: string;
  milestoneThreshold: number;
}
export interface Attempt {
  id: string;
  problemId: string;
  track: TrackId;
  date: string;
  passed: boolean;
  hints: number;
  stuck: number;
  language: Language;
  mode: Mode;
  elapsed: number;
  runtime: number;
  xp: number;
}
export interface Note {
  id: string;
  title: string;
  body: string;
  tags: string[];
  track?: TrackId;
  context: string;
  created: string;
  updated: string;
  pinned: boolean;
  reviewDue?: string;
}
export interface Review {
  interval: number;
  ease: number;
  repetitions: number;
  due: string;
}
export interface CustomCard {
  id: string;
  front: string;
  back: string;
  track?: TrackId;
}
export interface LearningEntry {
  id: string;
  source: string;
  sourceType: 'problem' | 'lesson' | 'quick';
  track: TrackId;
  title: string;
  learned: string;
  interview: string;
  resume: string;
  evidence: string;
  confidence: 'solid' | 'shaky' | 'needs review';
  date: string;
  promoted: boolean;
  hidden: boolean;
}
export interface Report {
  id: string;
  title: string;
  track?: TrackId;
  date: string;
  body: string;
}
export interface Story {
  id: string;
  title: string;
  competency: string;
  situation: string;
  task: string;
  action: string;
  result: string;
}
export interface Progress {
  version: 1;
  xp: number;
  attempts: Attempt[];
  solved: Record<string, string>;
  completedLessons: string[];
  completedQuick: string[];
  notes: Note[];
  cards: CustomCard[];
  reviews: Record<string, Review>;
  log: LearningEntry[];
  reports: Report[];
  stories: Story[];
  drafts: Record<string, string>;
  coachStages: Record<string, number>;
  modes: Partial<Record<TrackId, Mode>>;
  help: Record<string, { hints: number; stuck: number }>;
  languages: Partial<Record<TrackId, Language>>;
  activity: Record<string, number>;
  freezes: number;
  freezeDates: string[];
  rewardedNotes: string[];
  settings: Settings;
  onboarding: boolean;
  placement: Partial<Record<TrackId, number>>;
  lastProblem?: string;
  resume: string;
  starDraft?: string;
}
export function initialProgress(): Progress {
  return {
    version: 1,
    xp: 0,
    attempts: [],
    solved: {},
    completedLessons: [],
    completedQuick: [],
    notes: [],
    cards: [],
    reviews: {},
    log: [],
    reports: [],
    stories: [],
    drafts: {},
    coachStages: {},
    help: {},
    modes: {},
    languages: {},
    activity: {},
    freezes: 2,
    freezeDates: [],
    rewardedNotes: [],
    onboarding: false,
    placement: {},
    resume: '',
    settings: {
      theme: 'dark',
      fontSize: 14,
      keybindings: 'default',
      language: 'java',
      sound: false,
      reducedMotion: false,
      role: 'Backend SWE',
      dailyMinutes: 30,
      interviewDate: '',
      milestoneThreshold: 80,
    },
  };
}
