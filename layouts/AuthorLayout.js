import SocialIcon from '@/components/social-icons'
import Image from '@/components/Image'
import { PageSEO } from '@/components/SEO'

export default function AuthorLayout({ children, frontMatter }) {
  const { name, avatar, occupation, company, email, twitter, linkedin, github } = frontMatter

  return (
    <>
      <PageSEO title={`About - ${name}`} description={`About me - ${name}`} />
      <h2 className="font-extrabold leading-9">About me</h2>
      <div className="flex flex-col sm:flex-row">
        <div className="m-auto flex flex-col items-center pb-4 pt-4 xl:w-2/5">
          <Image
            src={avatar}
            alt="avatar"
            width="192px"
            height="192px"
            className="h-48 w-48 rounded-full"
          />
          <div className="pt-4 text-gray-500 dark:text-gray-400">{occupation}</div>
          <div className="text-gray-500 dark:text-gray-400">{company}</div>
          <div className="flex space-x-3 pt-6">
            <SocialIcon kind="mail" href={`mailto:${email}`} />
            <SocialIcon kind="github" href={github} />
            <SocialIcon kind="linkedin" href={linkedin} />
            <SocialIcon kind="twitter" href={twitter} />
          </div>
        </div>
        <div className="prose max-w-none pb-4 pt-4 dark:prose-dark xl:col-span-2 xl:w-3/5">
          {children}
        </div>
      </div>
    </>
  )
}
