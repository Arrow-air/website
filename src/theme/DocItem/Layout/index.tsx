import React, {type ReactNode} from 'react';
import Layout from '@theme-original/DocItem/Layout';
import type LayoutType from '@theme/DocItem/Layout';
import type {WrapperProps} from '@docusaurus/types';
import MarkdownToggle from './MarkdownToggle';
import EndBar from './EndBar';

type Props = WrapperProps<typeof LayoutType>;

export default function LayoutWrapper(props: Props): ReactNode {
  return (
    <MarkdownToggle>
      <Layout {...props} />
      <EndBar />
    </MarkdownToggle>
  );
}
