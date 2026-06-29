import type { CSSProperties } from 'react'
import { LINEAR_LOGO_SVG } from './linear-logo-content'

/** Based on linear.svg */
export function LinearLogo({
  className,
  style,
}: {
  className?: string
  style?: CSSProperties
}) {
  return (
    <span
      className={className}
      style={style}
      aria-hidden
      dangerouslySetInnerHTML={{ __html: LINEAR_LOGO_SVG }}
    />
  )
}
