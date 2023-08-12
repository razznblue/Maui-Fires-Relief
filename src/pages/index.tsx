import Image from 'next/image'
import styles from './styles/page.module.css'
import { useEffect } from 'react'

export default function Home() {

  useEffect(() => {
    
  })

  return (
    <main className={styles.main}>
      <h2>Maui Relief Effort</h2>
      <p>A Community-Made list of Relief Efforts. These are trusted sources where you can help donate to!</p>
    </main>
  )
}
