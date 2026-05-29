import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'POS ร้านน้ำ',
    short_name: 'ร้านน้ำ',
    description: 'ระบบ POS ร้านน้ำขนาดเล็ก',
    start_url: '/',
    display: 'standalone',
    background_color: '#f7f3ee',
    theme_color: '#8b5e3c',
    orientation: 'any',
    icons: [
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  }
}
