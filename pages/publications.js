import { getAllFilesFrontMatter } from '@/lib/mdx'
import siteMetadata from '@/data/siteMetadata'
import ListLayout from '@/layouts/ListLayout'
import { PageSEO } from '@/components/SEO'

export const PUBLICATIONS_PER_PAGE = 5

export async function getStaticProps() {
  const publications = await getAllFilesFrontMatter('publications')
  const initialDisplayPublications = publications.slice(0, PUBLICATIONS_PER_PAGE)
  const pagination = {
    currentPage: 1,
    totalPages: Math.ceil(publications.length / PUBLICATIONS_PER_PAGE),
  }

  return { props: { initialDisplayPublications, publications, pagination } }
}

export default function Publications({ initialDisplayPublications, publications, pagination }) {
  return (
    <>
      <PageSEO
        title={`Publications - ${siteMetadata.author}`}
        description={siteMetadata.description}
      />
      <ListLayout
        postType="publications"
        posts={publications}
        initialDisplayPosts={initialDisplayPublications}
        pagination={pagination}
        title="All Publications"
      />
    </>
  )
}
