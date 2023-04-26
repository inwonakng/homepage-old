import Link from '@/components/Link'
import { PageSEO } from '@/components/SEO'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import { getAllTags } from '@/lib/tags'
import kebabCase from '@/lib/utils/kebabCase'

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
  return (
    <>
      <PageSEO title={`Tags - ${siteMetadata.author}`} description="Things I publish/blog about" />
      <div className="flex flex-col items-start justify-start divide-y divide-gray-200 dark:divide-gray-700 md:mt-24 md:flex-row md:items-center md:justify-center md:space-x-6 md:divide-y-0">
        <div className="space-x-2 pb-8 pt-6 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl sm:leading-10 md:border-r-2 md:px-6 md:text-4xl md:leading-14">
            Publication Tags
          </h1>
        </div>
        <div className="flex max-w-lg flex-wrap">
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
      <div className="flex flex-col items-start justify-start divide-y divide-gray-200 dark:divide-gray-700 md:mt-24 md:flex-row md:items-center md:justify-center md:space-x-6 md:divide-y-0">
        <div className="space-x-2 pb-8 pt-6 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl sm:leading-10 md:border-r-2 md:px-6 md:text-4xl md:leading-14">
            Blog Tags
          </h1>
        </div>
        <div className="flex max-w-lg flex-wrap">
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
    </>
  )
}
