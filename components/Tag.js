import Link from 'next/link'
import kebabCase from '@/lib/utils/kebabCase'

const Tag = ({ postType, text }) => {
  return (
    <Link href={`/tags/${postType}/${kebabCase(text)}`}>
      <a className="mr-3 text-sm font-medium uppercase text-primary-500 hover:text-primary-600 dark:hover:text-primary-400">
        {text.split(' ').join('-')}
      </a>
    </Link>
  )
}

export default Tag
