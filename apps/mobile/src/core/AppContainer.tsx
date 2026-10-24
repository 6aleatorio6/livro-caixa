import type { ReactNode } from 'react';

import { AppToast } from '@/core/components/AppToast/AppToast';
import { FullscreenLoaderModal } from '@/core/components/FullscreenLoaderModal/FullscreenLoaderModal';

export interface IAppContainerProps {
  children: ReactNode;
}

/** A raiz do app: as telas e o que fica por cima de todas, montado uma vez. */
export function AppContainer({ children }: IAppContainerProps) {
  return (
    <>
      {children}
      <AppToast />
      <FullscreenLoaderModal />
    </>
  );
}
