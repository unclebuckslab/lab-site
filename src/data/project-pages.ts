// Extra content for project pages and tiles that the registry doesn't carry yet:
// the lead image, the facts row and the "how it's made" block.
// Facts here are method facts taken from each project's own README, not brand copy.
// Move these into the registry (public fields) once lab-hq adds them.
import type { ImageMetadata } from 'astro';
import denverMap from '../assets/projects/denver-sales-map.jpg';
import denverChart from '../assets/projects/denver-sales-chart.jpg';

export type ProjectPage = {
  tile: { src: ImageMetadata; alt: string };
  figure?: { src: ImageMetadata; alt: string; caption: string };
  facts: { label: string; value: string }[];
  howMade: { label: string; text: string }[];
  methodsUrl?: string;
  secondaryLink?: { label: string; href: string };
};

export const PROJECT_PAGES: Record<string, ProjectPage> = {
  'denver-sales': {
    tile: {
      src: denverMap,
      alt: 'Map of the 17 Denver neighborhoods with one dot per home, shaded by its latest sale price; darker dots cost more.',
    },
    figure: {
      src: denverChart,
      alt: 'Chart of every sale price since 2015 in Washington Park and West Highland, with a rolling median line for each rising over time.',
      caption: 'Every sale since 2015 in two of the 17 neighborhoods, as the dashboard shows it. Captured Nov 21, 2026.',
    },
    facts: [
      { label: 'Updated', value: 'Weekly, Mondays' },
      { label: 'Coverage', value: '17 neighborhoods' },
      { label: 'History', value: '2015 to now' },
      { label: 'Source', value: 'Denver open data' },
    ],
    howMade: [
      {
        label: 'Sources',
        text: "City and County of Denver Open Data: sales, parcels, residential characteristics and neighborhood boundaries. FRED's consumer price index for today's dollars.",
      },
      {
        label: 'How it runs',
        text: "A scheduled job pulls the data every Monday, cleans it and rebuilds the dashboard. Guards stop any run that looks wrong, so last week's data stays live.",
      },
      { label: 'Privacy', text: 'Buyer and seller names are reduced to yes/no flags before anything is saved.' },
      { label: 'Human check', text: '[VOICE PENDING] Who reviews what before it ships.' },
    ],
    methodsUrl: 'https://github.com/unclebuck20/denver-dashboard',
    secondaryLink: { label: 'Open the map', href: 'https://unclebuck20.github.io/denver-dashboard/map.html' },
  },
};

export const projectPage = (id: string): ProjectPage | undefined => PROJECT_PAGES[id];
