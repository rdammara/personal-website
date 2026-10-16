// Facts about the site owner, kept in one place so pages and the ask bar agree.
// A null value means the fact is not available yet; pages show an honest
// "not yet" state instead of a placeholder that looks real.
export const site = {
  name: 'Albert Richard Dammara',
  domain: 'albertdammara.com',
  title: 'Data engineer for industrial and IoT data, with quality assurance discipline.',
  githubUrl: 'https://github.com/rdammara',
  contactEmail: null as string | null,
  resumePdfUrl: null as string | null,
  about: [
    'I’m a data engineer with a background in Information Systems and a minor in Big Data Analytics. My most hands-on work was in industrial manufacturing at an industrial piping manufacturing company, where I designed and deployed real-time pipelines to ingest and visualize sensor data across production sites, and worked with technical and business stakeholders to connect edge data to the central MES. I then moved into industrial analytics, using machine sensor data to support predictive maintenance and equipment reliability decisions.',
    'Today I work as a Software Quality Engineer, and that shapes how I build: pipelines should fail loudly, data should be tested before anyone trusts it, and monitoring should surface problems early. This site documents my projects, including the code, architecture decisions, and quality checks behind each one.',
  ],
};

// Set at build time in next.config.ts, so the footer shows when this build was made.
export const builtAt = process.env.NEXT_PUBLIC_BUILT_AT ?? null;
