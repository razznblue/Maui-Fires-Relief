import Image from 'next/image'
import styles from './styles/page.module.css'
import { useEffect, useState } from 'react'
import Home from '@/components/home'

export default function Index() {

  return <Home />

  // return (
  //   <main className={styles.main}>
  //     <h2>Maui Relief Effort</h2>
  //     <p>A Community-Made list of Relief Efforts. These are trusted sources where you can help donate to!</p>
  //   </main>
  // )
}
