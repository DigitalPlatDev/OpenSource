import React from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import Heading from '@theme/Heading';
import MDXContent from '@theme/MDXContent';
import LicenseBadgeStudio from '@site/src/components/LicenseBadgeStudio';
import LicenseToolkit from '@site/src/components/LicenseToolkit';

function useSyntheticTitle() {
  const {metadata, frontMatter, contentTitle} = useDoc();
  const shouldRender =
    !frontMatter.hide_title && typeof contentTitle === 'undefined';
  return shouldRender ? metadata.title : null;
}

export default function DocItemContent({children}) {
  const syntheticTitle = useSyntheticTitle();
  const {metadata, frontMatter} = useDoc();

  return (
    <div className={clsx(ThemeClassNames.docs.docMarkdown, 'markdown')}>
      {syntheticTitle && (
        <header>
          <Heading as="h1">{syntheticTitle}</Heading>
        </header>
      )}
      {frontMatter.spdxId && (
        <>
          <LicenseToolkit spdxId={frontMatter.spdxId} />
          <LicenseBadgeStudio
            spdxId={frontMatter.spdxId}
            licenseName={metadata.title}
            permalink={metadata.permalink}
          />
        </>
      )}
      <MDXContent>{children}</MDXContent>
    </div>
  );
}
