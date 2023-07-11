import Link from '@/components/Link'
import ListLayout from '@/layouts/ListLayout'
import { PageSEO } from '@/components/SEO'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import { getAllFilesFrontMatter } from '@/lib/mdx'
import formatDate from '@/lib/utils/formatDate'

const MAX_DISPLAY = 10

export async function getStaticProps() {
  const blogPosts = await getAllFilesFrontMatter('blog')
  const publicaionPosts = await getAllFilesFrontMatter('publications')
  const posts = [...blogPosts, ...publicaionPosts]
  const initialDisplayPosts = posts.slice(0, MAX_DISPLAY)
  const pagination = false
  return { props: { initialDisplayPosts, posts, pagination } }
}

export default function Recent({ initialDisplayPosts, posts, pagination }) {
  return (
    <>
      <PageSEO title={siteMetadata.title} description={siteMetadata.description} />

      <ListLayout
        posts={posts}
        initialDisplayPosts={initialDisplayPosts}
        pagination={pagination}
        title="All Posts"
      />
      {posts.length > MAX_DISPLAY && (
        <div className="flex justify-end text-base font-medium leading-6">
          <Link
            href="/publications"
            className="pl-8 text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
            aria-label="all posts"
          >
            All Publications &rarr;
          </Link>
          <Link
            href="/blog"
            className="pl-8 text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
            aria-label="all posts"
          >
            All Blog Posts &rarr;
          </Link>
        </div>
      )}
      {/* {siteMetadata.newsletter.provider !== '' && (
        <div className="flex items-center justify-center pt-4">
          <NewsletterForm />
        </div>
      )} */}
    </>
  )
}
