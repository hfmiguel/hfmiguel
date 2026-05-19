import { getReadmeContent } from '@/lib/mdx-utils';
import Link from 'next/link';
import './globals.css';

export default async function Home() {
  const readmeContent = await getReadmeContent();

  return (
    <main className="container">
      <div className="profile-card">
        <div className="profile-header">
          <h1 className="profile-title">Henrique Felix</h1>
          <p className="profile-subtitle">Full Stack Developer & UI Designer</p>
        </div>

        <div className="markdown-body" dangerouslySetInnerHTML={{ __html: readmeContent }} />

        <div className="actions">
          <Link href="/resume.pdf" download className="btn btn-primary">
            📄 Download Resume PDF
          </Link>
        </div>
      </div>
    </main>
  );
}
