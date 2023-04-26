// import Link from '@/components/Link'
// import { PageSEO } from '@/components/SEO'
// import Tag from '@/components/Tag'
// import siteMetadata from '@/data/siteMetadata'
// import { getAllFilesFrontMatter } from '@/lib/mdx'
// import formatDate from '@/lib/utils/formatDate'
// import Image from '@/components/Image'
import { MDXLayoutRenderer } from '@/components/MDXComponents'
import { getFileBySlug } from '@/lib/mdx'

// import NewsletterForm from '@/components/NewsletterForm'

// import headShot from '/static/images/hawaii.jpeg'

// const MAX_DISPLAY = 5

// export async function getStaticProps() {
//   const posts = await getAllFilesFrontMatter('blog')

//   return { props: { posts } }
// }

const DEFAULT_LAYOUT = 'AuthorLayout'

export async function getStaticProps() {
  const authorDetails = await getFileBySlug('authors', ['default'])
  return { props: { authorDetails } }
}

export default function Home({ authorDetails }) {
  const { mdxSource, frontMatter } = authorDetails

  return (
    <MDXLayoutRenderer
      layout={frontMatter.layout || DEFAULT_LAYOUT}
      mdxSource={mdxSource}
      frontMatter={frontMatter}
    />
  )
}
