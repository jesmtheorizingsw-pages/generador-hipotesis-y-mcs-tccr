export interface CaseData {
  cycleStage: string;
  customCycleStage: string;
  previousCycleDescription: string;
  hypothesisQ1: string;
  hypothesisQ2: string;
  hypothesisQ3: string;
  hypothesisQ4: string;
  hypothesisQ5: string;
  hypothesisQ6: string;
  actors: {
    micro: string[];
    meso: string[];
    macro: string[];
  };
  pms: PMBlock[];
  cdc: CDCBlock[];
  frictions: Friction[];
  indicators: string;
  timespan: string;
}

export interface PMBlock {
  id: string;
  level: 'micro' | 'meso' | 'macro';
  stage: string;
  name: string;
  description: string;
}

export interface CDCBlock {
  id: string;
  level: 'micro' | 'meso' | 'macro';
  stage: string;
  data: string;
  sense: string;
  decision: string;
  effect: string;
}

export interface Friction {
  from: string;
  to: string;
  label: string;
}

export interface GeneratedOutput {
  changeHypothesis: string;
  nullHypothesis: string;
}