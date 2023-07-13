import Link from '@/components/Link'
import { PageSEO } from '@/components/SEO'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import { getAllTags } from '@/lib/tags'
import kebabCase from '@/lib/utils/kebabCase'
import { useState } from 'react'

export async function getStaticProps() {
  const blogTags = await getAllTags('blog')
  const publicationTags = await getAllTags('publications')
  return { props: { blogTags, publicationTags } }
}

export default function Tags({ blogTags, publicationTags }) {
  const sortedBlogTags = Object.keys(blogTags).sort((a, b) => blogTags[b] - blogTags[a])
  const sortedPublicationTags = Object.keys(publicationTags).sort(
    (a, b) => publicationTags[b] - publicationTags[a]
  )
  const [showBlogTag, setShowBlogTag] = useState(true)
  const onToggleBlogTag = () => {
    setShowBlogTag((status) => !status)
  }
  const [showPubTag, setShowPubTag] = useState(true)
  const onTogglePubTag = () => {
    setShowPubTag((status) => !status)
  }
  return (
    <>
      <PageSEO title={`Tags - ${siteMetadata.author}`} description="Things I publish/blog about" />
      <div className="pb-4">
        <div className="hidden space-x-2 pb-4 sm:block md:space-y-5">
          <h2 className="font-extrabold">Blog Tags</h2>
        </div>
        <button className="block space-x-2 pb-4 sm:hidden md:space-y-5" onClick={onToggleBlogTag}>
          <h2 className="font-extrabold">Blog Tags</h2>
        </button>
        <div className={`sm:block ${showBlogTag ? 'block' : 'hidden'}`}>
          <div className="flex flex-wrap">
            {Object.keys(blogTags).length === 0 && 'No tags found.'}
            {sortedBlogTags.map((t) => {
              return (
                <div key={t} className="mb-2 mr-5 mt-2">
                  <Tag postType="blog" text={t} />
                  <Link
                    href={`/tags/blog/${kebabCase(t)}`}
                    className="-ml-2 text-sm font-semibold uppercase text-gray-600 dark:text-gray-300"
                  >
                    {` (${blogTags[t]})`}
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <hr />
      <div className="pt-6">
        <div className="hidden space-x-2 pb-4 sm:block md:space-y-5">
          <h2 className="font-extrabold">Publication Tags</h2>
        </div>
        <button className="block space-x-2 pb-4 sm:hidden md:space-y-5" onClick={onTogglePubTag}>
          <h2 className="font-extrabold">Publication Tags</h2>
        </button>
        <div className={`sm:block ${showPubTag ? 'block' : 'hidden'}`}>
          <div className="flex flex-wrap">
            {Object.keys(publicationTags).length === 0 && 'No tags found.'}
            {sortedPublicationTags.map((t) => {
              return (
                <div key={t} className="mb-2 mr-5 mt-2">
                  <Tag postType="publications" text={t} />
                  <Link
                    href={`/tags/publications/${kebabCase(t)}`}
                    className="-ml-2 text-sm font-semibold uppercase text-gray-600 dark:text-gray-300"
                  >
                    {` (${publicationTags[t]})`}
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
