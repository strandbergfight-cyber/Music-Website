export default function PageFrame({ source, title }) {
  return (
    <main className="page-shell">
      <iframe className="page-frame" src={source} title={title} />
    </main>
  )
}
