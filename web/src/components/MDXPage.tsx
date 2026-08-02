import { MDXProvider } from '@mdx-js/react'
import { Link, useResolvedPath } from 'react-router-dom'
import type { ComponentProps, ReactNode } from 'react'

/*
 * Turn any <a href="/internal/path"> in MDX content into a React-Router
 * <Link>, so navigation stays SPA-fast. External URLs and anchor links
 * pass through as regular <a>.
 */
function SmartLink({ href, children, ...rest }: ComponentProps<'a'>) {
  const isInternal = href?.startsWith('/') && !href.startsWith('//')
  const resolved = useResolvedPath(href ?? '')
  if (isInternal) {
    return <Link to={resolved.pathname}>{children}</Link>
  }
  return <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>{children}</a>
}

const components = {
  a: SmartLink,
}

export default function MDXPage({ children }: { children: ReactNode }) {
  return (
    <article className="article">
      <MDXProvider components={components}>{children}</MDXProvider>
    </article>
  )
}
