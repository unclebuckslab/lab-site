// Reads the project list synced from lab-hq (registry/projects.yaml).
// Only public fields leave this file: notes, agents and private repos never reach a page.
import yaml from 'js-yaml';
import raw from '../data/projects.yaml?raw';

type RegistryProject = {
  id: string;
  name: string;
  working_name?: boolean;
  type: string;
  stage: string;
  status: string;
  show_on_site?: boolean;
  priority?: number;
  public_url?: string | null;
  summary?: string;
};

export type Project = {
  id: string;
  name: string;
  workingName: boolean;
  type: string;
  stage: string;
  status: string;
  priority: number;
  publicUrl: string | null;
  summary: string;
  hasOwnList: boolean;
};

const SHOWN_STATUSES = new Set(['in-the-lab', 'live']);

// Public labels from handbook/IDENTITY.md.
const STATUS_LABELS: Record<string, string> = {
  'in-the-lab': 'In the lab',
  live: 'Live',
  paused: 'Paused',
  archived: 'Archived',
};

const STAGE_LABELS: Record<string, string> = {
  idea: 'Idea',
  explore: 'Explore',
  define: 'Define',
  build: 'Build',
  review: 'Review',
  launch: 'Launch',
  operate: 'Operate',
};

export const STAGES = ['idea', 'explore', 'define', 'build', 'review', 'launch', 'operate'];

const TYPE_LABELS: Record<string, string> = {
  'recurring-report': 'Recurring report',
  dashboard: 'Dashboard',
  'reference-database': 'Reference database',
  writing: 'Writing',
  brand: 'Brand',
};

// Projects with their own email list (decisions/2026-11-10-site-and-newsletters.md).
const OWN_LISTS = new Set(['ai-money-report']);

export const statusLabel = (s: string) => STATUS_LABELS[s] ?? s;
export const stageLabel = (s: string) => STAGE_LABELS[s] ?? s;
export const typeLabel = (t: string) => TYPE_LABELS[t] ?? t;

export function getProjects(): Project[] {
  const data = yaml.load(raw) as { projects: RegistryProject[] };
  return data.projects
    .filter((p) => p.show_on_site === true && SHOWN_STATUSES.has(p.status))
    .map((p) => ({
      id: p.id,
      name: p.name,
      workingName: p.working_name === true,
      type: p.type,
      stage: p.stage,
      status: p.status,
      priority: p.priority ?? 99,
      publicUrl: p.public_url ?? null,
      summary: p.summary ?? '',
      hasOwnList: OWN_LISTS.has(p.id),
    }))
    .sort((a, b) => a.priority - b.priority);
}
