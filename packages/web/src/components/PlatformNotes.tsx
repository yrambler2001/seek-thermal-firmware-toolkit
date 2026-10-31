/** The platform notes, carried over word for word (app:platform.*). Shown on the Info tab, below the read. */

import type { ReactElement, ReactNode } from 'react';
import { Laptop, Monitor, Smartphone, TabletSmartphone, Terminal } from 'lucide-react';
import { HexBlock } from './HexBlock';
import { Panel, PanelTitle } from './Panel';
import { Prose } from './Prose';
import { Section } from './Section';
import { useT } from '@/i18n';

const UDEV_RULE = `# /etc/udev/rules.d/70-seek-thermal.rules
SUBSYSTEM=="usb", ATTR{idVendor}=="289d", MODE="0666", TAG+="uaccess"

sudo udevadm control --reload-rules && sudo udevadm trigger`;

function Platform({
  name,
  icon,
  children,
}: {
  readonly name: string;
  readonly icon: ReactNode;
  readonly children: ReactNode;
}): ReactElement {
  return (
    <Panel className="h-full">
      <PanelTitle icon={icon}>{name}</PanelTitle>
      <Prose>{children}</Prose>
    </Panel>
  );
}

export function PlatformNotes(): ReactElement {
  const { t, rich } = useT();
  return (
    <Section id="platform" title={t('app:platform.title')} icon={<Laptop />}>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Platform name="macOS" icon={<Laptop />}>
          <p>{rich('app:platform.macos')}</p>
        </Platform>

        <Platform name="Linux" icon={<Terminal />}>
          <p>{rich('app:platform.linux.access')}</p>
          <HexBlock>{UDEV_RULE}</HexBlock>
          <p>{rich('app:platform.linux.sandbox')}</p>
        </Platform>

        <Platform name="Windows" icon={<Monitor />}>
          <p>
            {rich('app:platform.windows', {
              slots: {
                zadig: (text) => (
                  <a href="https://zadig.akeo.ie/" rel="noopener">
                    {text}
                  </a>
                ),
              },
            })}
          </p>
        </Platform>

        <Platform name="Android" icon={<Smartphone />}>
          <p>{rich('app:platform.android')}</p>
        </Platform>

        <Platform name={t('app:platform.ios.name')} icon={<TabletSmartphone />}>
          <p>{rich('app:platform.ios.cannot')}</p>
          <p>{rich('app:platform.ios.decrypt')}</p>
        </Platform>
      </div>
    </Section>
  );
}
