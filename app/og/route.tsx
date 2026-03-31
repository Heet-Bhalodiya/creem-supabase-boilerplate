import { NextRequest, NextResponse } from 'next/server'
import { getOpenGraphSettings } from '@/lib/actions/app-settings'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  // Get parameters from URL or use settings defaults
  const settings = await getOpenGraphSettings()

  const title = searchParams.get('title') || settings.preview_title || 'Creem SaaS'
  const template = searchParams.get('template') || settings.template || 'gradient'
  const startColor = searchParams.get('start_color') || settings.start_color || '#6366f1'
  const endColor = searchParams.get('end_color') || settings.end_color || '#8b5cf6'
  const textColor = searchParams.get('text_color') || settings.text_color || '#ffffff'

  // Generate SVG-based Open Graph image
  const svg = generateOpenGraphSVG(title, template, startColor, endColor, textColor)

  // Convert SVG to response
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  })
}

function generateOpenGraphSVG(
  title: string,
  template: string,
  startColor: string,
  endColor: string,
  textColor: string
): string {
  const width = 1200
  const height = 630

  // Escape HTML entities in title
  const safeTitle = title
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

  // Split title into lines (max ~50 chars per line)
  const words = safeTitle.split(' ')
  const lines: string[] = []
  let currentLine = ''

  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    if (testLine.length > 50 && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  })
  if (currentLine) lines.push(currentLine)

  // Limit to 3 lines
  const displayLines = lines.slice(0, 3)
  if (lines.length > 3) {
    displayLines[2] = displayLines[2] + '...'
  }

  // Calculate vertical centering
  const lineHeight = 80
  const totalHeight = displayLines.length * lineHeight
  const startY = (height - totalHeight) / 2 + lineHeight * 0.75

  let backgroundDef = ''
  let backgroundFill = ''

  if (template === 'gradient') {
    backgroundDef = `
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${startColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${endColor};stop-opacity:1" />
        </linearGradient>
      </defs>
    `
    backgroundFill = 'fill="url(#bgGradient)"'
  } else if (template === 'stripes') {
    backgroundDef = `
      <defs>
        <pattern id="stripes" patternUnits="userSpaceOnUse" width="60" height="60" patternTransform="rotate(45)">
          <rect width="30" height="60" fill="${startColor}"/>
          <rect x="30" width="30" height="60" fill="${endColor}"/>
        </pattern>
      </defs>
    `
    backgroundFill = 'fill="url(#stripes)"'
  } else {
    // solid
    backgroundFill = `fill="${startColor}"`
  }

  const svg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  ${backgroundDef}
  
  <!-- Background -->
  <rect width="${width}" height="${height}" ${backgroundFill}/>
  
  <!-- Decorative elements -->
  <circle cx="100" cy="100" r="150" fill="white" opacity="0.1"/>
  <circle cx="${width - 100}" cy="${height - 100}" r="200" fill="white" opacity="0.1"/>
  
  <!-- Title -->
  <text 
    x="${width / 2}" 
    y="${startY}"
    font-family="system-ui, -apple-system, sans-serif" 
    font-size="68" 
    font-weight="bold" 
    fill="${textColor}"
    text-anchor="middle"
  >
    ${displayLines.map((line, i) => `<tspan x="${width / 2}" dy="${i === 0 ? 0 : lineHeight}">${line}</tspan>`).join('')}
  </text>
  
  <!-- Logo/Brand -->
  <text 
    x="${width / 2}" 
    y="${height - 60}"
    font-family="system-ui, -apple-system, sans-serif" 
    font-size="32" 
    font-weight="600" 
    fill="${textColor}"
    text-anchor="middle"
    opacity="0.9"
  >
    Creem
  </text>
</svg>
  `.trim()

  return svg
}
