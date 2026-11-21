// Extra content for project pages and tiles that the registry doesn't carry yet:
// the lead image, the facts row and the "how it's made" block.
// Facts here are method facts taken from each project's own README, not brand copy.
// Move these into the registry (public fields) once lab-hq adds them.
import type { ImageMetadata } from 'astro';
import denverMap from '../assets/projects/denver-sales-map.jpg';
import denverChart from '../assets/projects/denver-sales-chart.jpg';

export type ProjectPage = {
  tile?: { src: ImageMetadata; alt: string };
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
      alt: 'Map of Denver with one dot per home sale since 2015, shaded by price, clustered in 17 neighborhoods.',
    },
    figure: {
      src: denverChart,
      alt: 'Chart of every sale price since 2015 in Washington Park and West Highland, with a rolling median line for each rising over time.',
      caption: 'Every sale since 2015 in two of the 17 neighborhoods, as the dashboard shows it. Screenshot, Nov 20, 2026.',
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
  'ai-money-report': {
    facts: [
      { label: 'Cadence', value: 'Every two weeks' },
      { label: 'Status', value: 'Practice issues' },
      { label: 'Built from', value: 'Public filings and data' },
      { label: 'Price', value: 'Free' },
    ],
    howMade: [
      {
        label: 'Sources',
        text: 'SEC filings (private fundraising, insider trades, ownership stakes, financial statements and executive pay), federal lobbying disclosures, layoff notices, and Census and energy data.',
      },
      {
        label: 'How it runs',
        text: 'Scheduled pipelines pull the public data. An AI layer reads and explains it, and agents draft each issue.',
      },
      {
        label: 'Labels',
        text: 'Every number links to its source document. Every claim about why something happened is labeled: Fact, Stated (what the company says) or Our read.',
      },
      { label: 'Human check', text: 'A person reviews every issue before it ships. Mistakes are corrected publicly in a corrections log.' },
      { label: 'Note', text: 'Not investment advice.' },
    ],
  },
  'congress-cards': {
    facts: [
      { label: 'Covers', value: 'Every member of Congress' },
      { label: 'Status', value: 'Being defined' },
      { label: 'Profiles', value: 'Not published yet' },
      { label: 'Price', value: 'Free' },
    ],
    howMade: [
      {
        label: 'Sources',
        text: 'Public records on campaign finance, lobbying, legislation and votes. Every fact on a card is sourced.',
      },
      { label: 'Standard', text: 'One standard for every party. The cards carry no opinion.' },
      { label: 'Human check', text: '[VOICE PENDING] Who reviews what before it ships.' },
    ],
  },
  'annual-outings': {
    facts: [
      { label: 'For', value: 'One crew, one trip a year' },
      { label: 'Status', value: 'Pilot with one group' },
      { label: 'Price', value: 'Free' },
    ],
    howMade: [
      {
        label: 'Picking the trip',
        text: "Everyone rates the options I'm in, Maybe or Can't. Code applies the rule: the option with the fewest Can'ts wins. The AI only explains the result, and the planner confirms. The AI never decides the trip.",
      },
      {
        label: 'Prices',
        text: 'Free price sources only. Every estimate shows a range, a conservative number to plan for, and the date prices were checked.',
      },
      { label: 'Privacy', text: "Nobody sees another person's budget, hard nos or individual ratings." },
    ],
  },
  dorkgraphs: {
    facts: [
      { label: 'Where', value: 'Instagram, @dorkgraphs' },
      { label: 'Cadence', value: 'Daily' },
      { label: 'Launch', value: 'January 2027' },
      { label: 'Price', value: 'Free' },
    ],
    howMade: [
      { label: 'Sources', text: 'An approved library of public data sources. Numbers are computed in code, not by the AI.' },
      {
        label: 'How it runs',
        text: 'Separate agents find and compute a finding, test it, pick the angle, render the chart from locked templates and write the caption.',
      },
      {
        label: 'Checks',
        text: 'Reviewers run as separate agents and never grade their own work: one tests every finding, one checks every chart is clear and honest, one scores the finished post.',
      },
      { label: 'Human check', text: 'A person gives final approval on every post.' },
    ],
  },
};

export const projectPage = (id: string): ProjectPage | undefined => PROJECT_PAGES[id];
