import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className={clsx('hero__subtitle', styles.tagline)}>
          {siteConfig.tagline}
        </p>
        <div className={styles.buttons}>
          <Link className="button button--secondary button--lg" to="/docs/public-licenses">
            Browse Public Licenses
          </Link>
          <Link className="button button--outline button--lg" to="/docs/opensource-ngo-licenses">
            OpenSource.ngo Licenses (Coming Soon)
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  return (
    <Layout
      title="OpenSource.ngo"
      description="A nonprofit reference library for open source licenses with clear provenance.">
      <HomepageHeader />
      <main className={styles.mainSection}>
        <div className="container">
          <div className={styles.summary}>
            <Heading as="h2">A nonprofit reference library for open source licenses.</Heading>
            <p>
              OpenSource.ngo provides a public catalog of licenses sourced from SPDX, along with
              timestamps and provenance so you can verify what was synced and when.
            </p>
            <p className={styles.disclaimer}>
              <strong>Not legal advice.</strong> This site is for informational purposes only.
            </p>
          </div>
        </div>
      </main>
    </Layout>
  );
}
