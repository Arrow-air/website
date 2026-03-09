import React, {type ReactNode} from 'react';
import Link from '@theme-original/DocSidebarItem/Link';
import type LinkType from '@theme/DocSidebarItem/Link';
import type {WrapperProps} from '@docusaurus/types';

type Props = WrapperProps<typeof LinkType>;

export default function LinkWrapper(props: Props): ReactNode {
  const customProps = props.item?.customProps as { icon?: string } | undefined;
  const iconName = customProps?.icon;

  // Add data attribute for CSS to pick up
  if (iconName) {
    return (
      <span data-sidebar-icon={iconName}>
        <Link {...props} />
      </span>
    );
  }

  return <Link {...props} />;
}
