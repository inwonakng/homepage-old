import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'
import { useRouter } from 'next/router'
import Logo from '@/data/logo.svg'
import Link from './Link'
import SectionContainer from './SectionContainer'
import Footer from './Footer'
import ThemeSwitch from './ThemeSwitch'

import { useState } from 'react'
const LayoutWrapper = ({ children }) => {
  const [navShow, setNavShow] = useState(false)
  const onToggleNav = () => {
    setNavShow((status) => {
      return !status
    })
  }
  const router = useRouter()

  return (
    <SectionContainer>
      <div className="flex h-screen flex-col justify-between">
        <header>
          <div className="flex items-center justify-between pb-8 pt-8">
            <Link href="/" aria-label={siteMetadata.headerTitle}>
              <h1 className="text-2xl font-extrabold">{siteMetadata.headerTitle}</h1>
            </Link>
            <div className="hidden sm:block">
              <div className="flex items-center justify-between">
                <nav className="flex items-center text-base">
                  {headerNavLinks.map((link) => (
                    <Link
                      key={link.title}
                      href={link.href}
                      className={`p-1 font-medium underline-offset-2 hover:underline sm:ml-4 ${
                        router.pathname.startsWith(link.href) ? 'underline decoration-dotted' : ''
                      }`}
                    >
                      {link.title}
                    </Link>
                  ))}
                </nav>
                <ThemeSwitch />
              </div>
            </div>
            <button
              type="button"
              className="ml-1 mr-1 h-8 w-8 rounded sm:hidden"
              aria-label="Toggle Menu"
              onClick={onToggleNav}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          <div className={`${navShow ? '' : 'hidden'}`}>
            <nav className="flex-col items-center justify-between">
              <hr />
              {headerNavLinks.map((link) => (
                <div key={link.title} className="px-2 py-2">
                  <Link
                    href={link.href}
                    onClick={onToggleNav}
                    className={`underline-offset-2 hover:underline ${
                      router.pathname.startsWith(link.href) ? 'underline decoration-dotted' : ''
                    }`}
                  >
                    {link.title}
                  </Link>
                </div>
              ))}
              <div className="px-2 py-2">
                <ThemeSwitch />
              </div>
            </nav>
            <hr />
          </div>
        </header>
        <main className="mb-auto">{children}</main>
        <Footer />
      </div>
    </SectionContainer>
  )
}

export default LayoutWrapper
