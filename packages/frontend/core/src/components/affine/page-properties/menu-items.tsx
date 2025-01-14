import {
  Input,
  MenuIcon,
  MenuItem,
  type MenuItemProps,
  MenuSeparator,
  Scrollable,
} from '@affine/component';
import type { PageInfoCustomPropertyMeta } from '@affine/core/modules/workspace/properties/schema';
import { useAFFiNEI18N } from '@affine/i18n/hooks';
import {
  cloneElement,
  isValidElement,
  type KeyboardEventHandler,
  type MouseEventHandler,
  useCallback,
} from 'react';

import {
  getDefaultIconName,
  getSafeIconName,
  nameToIcon,
  type PagePropertyIcon,
} from './icons-mapping';
import { IconsSelectorButton } from './icons-selector';
import * as styles from './styles.css';
export type MenuItemOption =
  | React.ReactElement
  | '-'
  | {
      text: string;
      onClick: MouseEventHandler;
      key?: string;
      icon?: React.ReactElement;
      selected?: boolean;
      checked?: boolean;
      type?: MenuItemProps['type'];
    }
  | MenuItemOption[];

const isElementOption = (e: MenuItemOption): e is React.ReactElement => {
  return isValidElement(e);
};

export const renderMenuItemOptions = (options: MenuItemOption[]) => {
  return options.map((option, index) => {
    if (option === '-') {
      return <MenuSeparator key={index} />;
    } else if (isElementOption(option)) {
      return cloneElement(option, { key: index });
    } else if (Array.isArray(option)) {
      // this is an area that needs scrollbar
      return (
        <Scrollable.Root key={index} className={styles.menuItemListScrollable}>
          <Scrollable.Viewport className={styles.menuItemList}>
            {renderMenuItemOptions(option)}
            <Scrollable.Scrollbar className={styles.menuItemListScrollbar} />
          </Scrollable.Viewport>
        </Scrollable.Root>
      );
    } else {
      const { text, icon, onClick, type, key, checked, selected } = option;
      return (
        <MenuItem
          key={key ?? index}
          type={type}
          selected={selected}
          checked={checked}
          preFix={icon ? <MenuIcon>{icon}</MenuIcon> : null}
          onClick={onClick}
        >
          {text}
        </MenuItem>
      );
    }
  });
};

export const EditPropertyNameMenuItem = ({
  property,
  onNameBlur: onBlur,
  onNameChange,
  onIconChange,
}: {
  onNameBlur: (e: string) => void;
  onNameChange: (e: string) => void;
  onIconChange: (icon: PagePropertyIcon) => void;
  property: PageInfoCustomPropertyMeta;
}) => {
  const iconName = getSafeIconName(property.icon, property.type);
  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = useCallback(
    e => {
      if (e.key !== 'Escape') {
        e.stopPropagation();
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        onBlur(e.currentTarget.value);
      }
    },
    [onBlur]
  );
  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      onBlur(e.target.value);
    },
    [onBlur]
  );

  const t = useAFFiNEI18N();
  return (
    <div className={styles.propertyRowNamePopupRow}>
      <IconsSelectorButton
        selected={iconName}
        onSelectedChange={onIconChange}
      />
      <Input
        defaultValue={property.name}
        onBlur={handleBlur}
        onChange={onNameChange}
        placeholder={t['unnamed']()}
        onKeyDown={onKeyDown}
      />
    </div>
  );
};

export const PropertyTypeMenuItem = ({
  property,
}: {
  property: PageInfoCustomPropertyMeta;
}) => {
  const Icon = nameToIcon(getDefaultIconName(property.type), property.type);
  const t = useAFFiNEI18N();
  return (
    <div className={styles.propertyRowTypeItem}>
      {t['com.affine.page-properties.create-property.menu.header']()}
      <div className={styles.propertyTypeName}>
        <Icon />
        {t[`com.affine.page-properties.property.${property.type}`]()}
      </div>
    </div>
  );
};
