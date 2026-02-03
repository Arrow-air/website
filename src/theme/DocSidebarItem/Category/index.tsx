import React, {type ReactNode} from 'react';
import Category from '@theme-original/DocSidebarItem/Category';
import type CategoryType from '@theme/DocSidebarItem/Category';
import type {WrapperProps} from '@docusaurus/types';

type Props = WrapperProps<typeof CategoryType>;

export default function CategoryWrapper(props: Props): ReactNode {
  const customProps = props.item?.customProps as { icon?: string } | undefined;
  const iconName = customProps?.icon;

  if (iconName) {
    return (
      <div data-sidebar-icon={iconName} data-sidebar-category>
        <Category {...props} />
      </div>
    );
  }

  return <Category {...props} />;
}
