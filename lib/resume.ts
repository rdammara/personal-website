// Albert's resume, copied word for word from Resume_2026_Albert_Richard_Dammara_PersonalWebsite.pdf
// (date ranges written with "to" instead of a hyphen).
// The Resume page and the ask bar both read from here; keep it in step with the PDF in /public.

export type Role = { title: string; dates: string; detail: string };
export type Job = { organization: string; location: string; roles: Role[] };
export type School = { name: string; location: string; degree: string; dates: string; notes: string[] };

export const resume = {
  pdfUrl: '/Albert-Richard-Dammara-Resume.pdf',
  summary:
    'Fresh graduate Information Systems student specializing in data analytics, data engineering, digital solution design, and software development. Experienced in building data pipelines, business dashboards, and digital transformation initiatives. Strong communicator with hands-on project leadership experience, preparing for future roles in Data Engineering and IT management.',
  experience: [
    {
      organization: 'PT. Wahana Nusantara Rucika (Djabesmen Co.)',
      location: 'Jakarta, Indonesia',
      roles: [
        {
          title: 'Data Analyst - Industrial Manufacturing Analytics',
          dates: 'August 2025 to February 2026',
          detail:
            'Focused on industrial analytics, analyzing manufacturing and machine sensor data to support predictive maintenance, equipment reliability, and data-driven operational decisions.',
        },
        {
          title: 'Data Engineer',
          dates: 'February 2025 to August 2025',
          detail:
            'Designed and deployed scalable, real-time data pipelines using the TIG Stack (Telegraf, InfluxDB, Grafana) to ingest and visualize IoT sensor data across distributed production environments. Partnered with cross-functional technical and business stakeholders to integrate edge data into central Manufacturing Execution Systems (MES), establishing data best practices that reduced equipment downtime risk by 30% and optimized operational agility.',
        },
      ],
    },
    {
      organization: 'PT. PLN (Persero)',
      location: 'Jakarta, Indonesia',
      roles: [
        {
          title: 'Data Analyst',
          dates: 'March 2024 to August 2024',
          detail:
            'Developed a machine learning-powered dashboard to analyze power industry trends for internal training and employee upskilling. Streamlined employee certification recordkeeping through digital filing system integration, resulting in faster retrieval and reduced manual input.',
        },
      ],
    },
    {
      organization: 'Skystar Ventures',
      location: 'Tangerang, Indonesia',
      roles: [
        {
          title: 'Business Incubatee',
          dates: 'February 2023 to November 2023',
          detail:
            'Selected from a highly competitive pool to develop digital product concepts, including fintech payment architectures and productivity SaaS platforms, helped evangelized technical solutions to stakeholders through pitch presentations, business model design, and strategic go-to-market planning, effectively bridging the gap between technical infrastructure and customer needs.',
        },
      ],
    },
  ] satisfies Job[],
  skills: [
    'Python',
    'RAG',
    'LLM',
    'MySQL',
    'Microsoft Excel',
    'Power BI',
    'SAS',
    'Tableau',
    'IT Infrastructure',
    'TIG Stack',
    'ETL',
    'Data Governance',
    'Digital Transformation',
    'Business Process Improvement',
  ],
  education: [
    {
      name: 'Universitas Multimedia Nusantara',
      location: 'Tangerang, Indonesia',
      degree: 'Bachelor of Information Systems',
      dates: 'September 2021 to August 2026',
      notes: [
        'Coursework: Data Structures & Algorithm, Data Analysis, Data Visualization, Software Development, Security Computer Network, Corporate Business Process',
        'Minor in Big Data Analytics',
      ],
    },
    {
      name: 'Douglas College',
      location: 'Vancouver, Canada',
      degree: 'Associate Degree Diploma of Communications',
      dates: 'September 2017 to August 2019',
      notes: [
        'Coursework: Cross-cultural Communications, Business Communications, Management Essentials, Introduction to Programming, System Analysis & Design, Database, The Canadian Economy',
        'Minor in Computing Studies',
      ],
    },
  ] satisfies School[],
};

// Plain-text passages for the ask bar, one per role or school so answers stay specific
export function resumePassages() {
  const passages = [{ id: 'resume-summary', title: 'Resume summary', content: resume.summary }];
  for (const job of resume.experience) {
    for (const role of job.roles) {
      passages.push({
        id: `resume-${role.title}-${job.organization}`,
        title: `${role.title} at ${job.organization}`,
        content: `${role.title} at ${job.organization}, ${job.location} (${role.dates}). ${role.detail}`,
      });
    }
  }
  passages.push({ id: 'resume-skills', title: 'Skills', content: `Skills: ${resume.skills.join(', ')}.` });
  for (const school of resume.education) {
    passages.push({
      id: `resume-${school.name}`,
      title: school.name,
      content: `${school.degree}, ${school.name}, ${school.location} (${school.dates}). ${school.notes.join('. ')}.`,
    });
  }
  return passages;
}
