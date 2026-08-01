import { Link } from 'react-router-dom'

interface Props {
  title: string
  note?: string
}

export default function Placeholder({ title, note }: Props) {
  return (
    <div className="article">
      <h1>{title}</h1>
      <p>{note ?? 'This page hasn\'t been migrated yet.'}</p>
      <p><Link to="/">← Back to home</Link></p>
    </div>
  )
}
