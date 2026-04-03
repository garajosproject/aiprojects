/**
 * FitPlus Logo — exact recreation from Figma design system
 * Figma node: 40000001:28169  "FIt Plus Logo"
 *
 * The icon is a 3-D isometric medical plus/cross made of two interlocked
 * rectangular prism arms. Three visible faces per arm: top (lightest),
 * left-front (darkest), right-front (mid).
 */

interface FitPlusLogoProps {
  variant?: 'full' | 'icon'
  scale?: number
  textColor?: string
  fontSize?: number
}

export function FitPlusIcon({ scale = 1 }: { scale?: number }) {
  const S = scale // multiply all coords by S

  // Figma brand blues (Primary/03 = #133696)
  const light = '#5B8DEF'  // top face
  const mid   = '#2351C4'  // right face
  const dark  = '#133696'  // left face (Primary/03 Main)

  // All coordinates are in a 34×36 viewBox
  return (
    <svg
      width={34 * S}
      height={36 * S}
      viewBox="0 0 34 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="FitPlus icon"
    >
      {/* ╔══ VERTICAL ARM ═══╗ */}

      {/* Top face (diamond) */}
      <path d="M17 2 L23 6 L17 10 L11 6 Z" fill={light} />

      {/* Left-front face */}
      <path d="M11 6 L17 10 L17 30 L11 26 Z" fill={dark} />

      {/* Right-front face */}
      <path d="M17 10 L23 6 L23 26 L17 30 Z" fill={mid} />

      {/* Bottom cap */}
      <path d="M11 26 L17 30 L23 26 L17 34 Z" fill={dark} opacity="0.55" />

      {/* ╔══ HORIZONTAL ARM ═══╗ */}

      {/* Top face */}
      <path d="M2 14 L8 10 L26 10 L32 14 L26 18 L8 18 Z" fill={light} />

      {/* Front face */}
      <path d="M2 14 L8 18 L8 22 L2 18 Z" fill={dark} />
      <path d="M8 18 L26 18 L26 22 L8 22 Z" fill={mid} />
      <path d="M26 18 L32 14 L32 18 L26 22 Z" fill={mid} opacity="0.7" />

      {/* The center overlap is already covered by the vertical arm faces */}
    </svg>
  )
}

export default function FitPlusLogo({
  variant = 'full',
  scale = 1,
  textColor = '#48494A',
  fontSize = 20,
}: FitPlusLogoProps) {
  return (
    <div className="flex items-center gap-2 select-none">
      <FitPlusIcon scale={scale} />
      {variant === 'full' && (
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize,
            color: textColor,
            letterSpacing: '-0.01em',
            lineHeight: 1,
          }}
        >
          FitPlus
        </span>
      )}
    </div>
  )
}
