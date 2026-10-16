// How content reaches this site. Stages marked `planned` are not built yet and
// draw dashed, so the diagram stays true while parts are still in progress.
type Stage = { title: string; detail: string; planned?: boolean; highlight?: boolean };
type StageKey = 'notion' | 'sync' | 'db' | 'site' | 'resume' | 'ask';

const getStages = (notionLive: boolean): Record<StageKey, Stage> => ({
  notion: { title: 'Notion', detail: 'Where I write posts', planned: !notionLive },
  sync: { title: 'Sync job', detail: 'Every 15 minutes', planned: !notionLive },
  db: { title: 'Database', detail: 'Posts and projects' },
  site: { title: 'This website', detail: 'Pages built from the data' },
  resume: { title: 'Resume', detail: 'Roles, skills, education' },
  ask: { title: 'Ask bar', detail: 'Answers from these only', highlight: true },
});

function describe(stages: Record<StageKey, Stage>) {
  const planned = (Object.values(stages) as Stage[]).filter((s) => s.planned).map((s) => s.title);
  return (
    'Notion feeds a sync job, which loads the database. The database feeds this website and the ask bar. The resume also feeds the ask bar.' +
    (planned.length ? ` Planned, not live yet: ${planned.join(', ')}.` : '')
  );
}

// Card boxes on a 1040 x 312 canvas
const W = 200;
const H = 92;
const boxes = {
  notion: { x: 0, y: 20 },
  sync: { x: 280, y: 20 },
  db: { x: 560, y: 20 },
  site: { x: 840, y: 20 },
  resume: { x: 0, y: 220 },
  ask: { x: 560, y: 220 },
};

// Each arrow stops 1px short of the card it points at
const arrows = [
  'M200 66 H275',
  'M480 66 H555',
  'M760 66 H835',
  'M660 112 V215',
  'M200 266 H555',
];

function Card({ stage, x, y }: { stage: Stage; x: number; y: number }) {
  const cx = x + W / 2;
  return (
    <g>
      <rect
        x={x + 1}
        y={y + 1}
        width={W - 2}
        height={H - 2}
        rx={12}
        className={stage.highlight ? 'fill-bg stroke-fill' : 'fill-bg stroke-control'}
        strokeWidth={stage.highlight ? 2 : 1.25}
        strokeDasharray={stage.planned ? '6 5' : undefined}
      />
      <text x={cx} y={y + (stage.planned ? 36 : 42)} textAnchor="middle" className="fill-ink text-[15px] font-bold">
        {stage.title}
      </text>
      <text x={cx} y={y + (stage.planned ? 56 : 62)} textAnchor="middle" className="fill-ink text-[15px]">
        {stage.detail}
      </text>
      {stage.planned && (
        <text x={cx} y={y + 76} textAnchor="middle" className="fill-muted font-mono text-[12px]">
          planned
        </text>
      )}
    </g>
  );
}

function StackedCard({ stage }: { stage: Stage }) {
  return (
    <div
      className={`rounded-xl bg-bg px-4 py-3 ${
        stage.highlight ? 'border-2 border-fill' : stage.planned ? 'border border-dashed border-control' : 'border border-control'
      }`}
    >
      <p className="font-bold">{stage.title}</p>
      <p className="text-[15px]">{stage.detail}</p>
      {stage.planned && <p className="font-mono text-[12px] text-muted">planned</p>}
    </div>
  );
}

function Down() {
  return (
    <svg viewBox="0 0 16 24" aria-hidden="true" className="mx-auto my-1 h-6 w-4 fill-none stroke-control stroke-[1.5]">
      <path d="M8 0 V20 M3 15 L8 21 L13 15" />
    </svg>
  );
}

export function PipelineDiagram({ notionLive = false }: { notionLive?: boolean }) {
  const stages = getStages(notionLive);
  const description = describe(stages);
  return (
    <figure className="m-0">
      {/* Wide screens: the full diagram */}
      <svg
        viewBox="0 0 1040 312"
        role="img"
        aria-labelledby="pipeline-title"
        className="mx-auto hidden w-full max-w-[1040px] lg:block"
      >
        <title id="pipeline-title">{description}</title>
        <defs>
          <marker id="pipeline-head" viewBox="0 0 8 8" refX="5" refY="4" markerWidth="8" markerHeight="8" orient="auto">
            <path d="M0 0 L8 4 L0 8 Z" className="fill-control" />
          </marker>
        </defs>
        {arrows.map((d) => (
          <path key={d} d={d} className="fill-none stroke-control" strokeWidth={1.75} markerEnd="url(#pipeline-head)" />
        ))}
        {(Object.keys(boxes) as (keyof typeof boxes)[]).map((key) => (
          <Card key={key} stage={stages[key]} {...boxes[key]} />
        ))}
      </svg>

      {/* Narrow screens: the same flow, stacked */}
      <div className="lg:hidden" role="img" aria-label={description}>
        <div aria-hidden="true" className="mx-auto max-w-md">
          <StackedCard stage={stages.notion} />
          <Down />
          <StackedCard stage={stages.sync} />
          <Down />
          <StackedCard stage={stages.db} />
          <Down />
          <div className="grid grid-cols-2 gap-3">
            <StackedCard stage={stages.site} />
            <StackedCard stage={stages.ask} />
          </div>
          <p className="mt-3 text-[15px] text-muted">The ask bar also reads my resume.</p>
        </div>
      </div>

      {Object.values(stages).some((s) => s.planned) && (
        <figcaption className="mt-5 text-sm text-muted">Dashed boxes are planned and not live yet.</figcaption>
      )}
    </figure>
  );
}
