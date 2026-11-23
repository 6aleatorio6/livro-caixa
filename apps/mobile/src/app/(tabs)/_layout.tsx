import { TabList, Tabs, TabSlot, TabTrigger } from 'expo-router/ui';
import { House, Receipt, Settings } from 'lucide-react-native';

import { useEnsureOwnName } from '@/features/auth/hooks/useEnsureOwnName/useEnsureOwnName';
import { useBillReminders } from '@/features/home/hooks/useBillReminders/useBillReminders';
import { usePushRegistration } from '@/features/notifications/hooks/usePushRegistration/usePushRegistration';
import { NavigationBar } from '@/shared/components/NavigationBar/NavigationBar';
import { NavigationBarItem } from '@/shared/components/NavigationBarItem/NavigationBarItem';
import { AboveNavigationBarContext } from '@/shared/components/Screen/AboveNavigationBarContext';

export default function TabsLayout() {
  useEnsureOwnName();
  usePushRegistration();
  useBillReminders();

  return (
    <Tabs>
      <AboveNavigationBarContext value>
        <TabSlot />
      </AboveNavigationBarContext>
      <TabList asChild>
        <NavigationBar>
          <TabTrigger name="index" href="/" asChild>
            <NavigationBarItem icon={House} label="Início" />
          </TabTrigger>
          <TabTrigger name="my-payments" href="/my-payments" asChild>
            <NavigationBarItem icon={Receipt} label="Pagamentos" />
          </TabTrigger>
          <TabTrigger name="settings" href="/settings" asChild>
            <NavigationBarItem icon={Settings} label="Configurações" />
          </TabTrigger>
        </NavigationBar>
      </TabList>
    </Tabs>
  );
}
