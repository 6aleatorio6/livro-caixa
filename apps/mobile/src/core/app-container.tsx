import type { ReactNode } from 'react';

import { AppToast } from '@/shared/components/app-toast';
import { FullscreenLoader } from '@/shared/components/fullscreen-loader';

export interface IAppContainerProps {
  children: ReactNode;
}

/** A raiz do app: as telas e o que fica por cima de todas, montado uma vez. */
export function AppContainer({ children }: IAppContainerProps) {
  return (
    <>
      {children}
      <AppToast />
      <FullscreenLoader />
    </>
  );
}
