import { Crumbs } from './blocks'

export interface LegalSection {
  id: string
  title: string
  body: string[]
}

/** long-form policy layout — sticky contents on wide screens, plain flow on phones */
export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string
  updated: string
  intro: string
  sections: LegalSection[]
}) {
  return (
    <div className="page">
      <Crumbs items={[{ label: 'Home', to: '/' }, { label: 'Help', to: '/help' }, { label: title }]} />
      <header className="rise prose-head" style={{ '--i': 0 } as React.CSSProperties}>
        <h1 className="page-title">{title}</h1>
        <p className="mono-label">Last updated {updated}</p>
        <p className="lede">{intro}</p>
      </header>
      <div className="legal rise" style={{ '--i': 1 } as React.CSSProperties}>
        <nav className="legal__toc" aria-label="Contents">
          <p className="tag">Contents</p>
          <ol>
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.title}</a>
              </li>
            ))}
          </ol>
        </nav>
        <article className="prose">
          {sections.map((s) => (
            <section key={s.id} id={s.id}>
              <h2>{s.title}</h2>
              {s.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </section>
          ))}
        </article>
      </div>
    </div>
  )
}
