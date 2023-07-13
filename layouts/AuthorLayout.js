import SocialIcon from '@/components/social-icons'
import Image from '@/components/Image'
import { PageSEO } from '@/components/SEO'

export default function AuthorLayout({ children, frontMatter }) {
  const { name, avatar, occupation, company, email, twitter, linkedin, github } = frontMatter

  return (
    <>
      <PageSEO title={`About - ${name}`} description={`About me - ${name}`} />
      <h2 className="font-extrabold leading-9">About me</h2>
      <div className="prose max-w-none pb-4 pt-4 dark:prose-dark xl:col-span-2">{children}</div>

      <div className="flex space-x-6 pt-6">
        <SocialIcon kind="mail" href={`mailto:${email}`} />
        <SocialIcon kind="github" href={github} />
        <SocialIcon kind="linkedin" href={linkedin} />
        {/* <SocialIcon kind="twitter" href={twitter} /> */}
      </div>
      {/* <div className="divide-y divide-gray-200 dark:divide-gray-700"> */}
      {/* <div className="space-y-2 pb-8 pt-6 md:space-y-5"> */}
      {/* <h1 className="text-2xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl sm:leading-10 md:text-4xl md:leading-14"> */}
      {/*   {name} */}
      {/* </h1> */}
      {/* </div> */}
      {/* <div className="items-start space-y-2 xl:grid xl:grid-cols-3 xl:gap-x-8 xl:space-y-0"> */}
      {/*   <div className="flex flex-col items-center pt-8"> */}
      {/* <Image */}
      {/*   src={avatar} */}
      {/*   alt="avatar" */}
      {/*   width="192px" */}
      {/*   height="192px" */}
      {/*   className="h-48 w-48 rounded-full" */}
      {/* /> */}
      {/* <h3 className="pb-2 pt-4 text-2xl font-bold leading-8 tracking-tight">{name}</h3> */}
      {/* <div className="text-gray-500 dark:text-gray-400">{occupation}</div> */}
      {/* <div className="text-gray-500 dark:text-gray-400">{company}</div> */}
      {/* <div className="flex space-x-3 pt-6"> */}
      {/* <SocialIcon kind="mail" href={`mailto:${email}`} /> */}
      {/* <SocialIcon kind="github" href={github} /> */}
      {/* <SocialIcon kind="linkedin" href={linkedin} /> */}
      {/* <SocialIcon kind="twitter" href={twitter} /> */}
      {/* </div> */}
      {/*   </div> */}
      {/* </div> */}
      {/* </div> */}
    </>
  )
}
