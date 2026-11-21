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
  priority: number;
  publicUrl: string | null;
  summary: string;
  hasOwnList: boolean;
  retired: boolean;
};

// The site is a library of finished work: live projects plus retired (archived) ones.
// Nothing in progress or paused appears (decisions/2026-11-11-site-shows-finished-work.md).
const SHOWN_STATUSES = new Set(['live', 'archived']);

const TYPE_LABELS: Record<string, string> = {
  'recurring-report': 'Recurring report',
  dashboard: 'Dashboard',
  'reference-database': 'Reference database',
  writing: 'Writing',
  brand: 'Data brand',
  product: 'Product',
};

// Projects with their own email list (decisions/2026-11-10-site-and-newsletters.md).
const OWN_LISTS = new Set(['ai-money-report']);

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
      priority: p.priority ?? 99,
      publicUrl: p.public_url ?? null,
      summary: p.summary ?? '',
      hasOwnList: OWN_LISTS.has(p.id) && p.status === 'live',
      retired: p.status === 'archived',
    }))
    // Live work first, then retired work; by priority within each.
    .sort((a, b) => Number(a.retired) - Number(b.retired) || a.priority - b.priority);
}
