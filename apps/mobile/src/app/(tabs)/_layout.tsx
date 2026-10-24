import { TabList, Tabs, TabSlot, TabTrigger } from 'expo-router/ui';
import { House, Receipt, Settings } from 'lucide-react-native';

import { NavigationBar } from '@/shared/components/NavigationBar/NavigationBar';
import { NavigationBarItem } from '@/shared/components/NavigationBarItem/NavigationBarItem';

export default function TabsLayout() {
  return (
    <Tabs>
      <TabSlot />
      <TabList asChild>
        <NavigationBar>
          <TabTrigger name="index" href="/" asChild>
            <NavigationBarItem icon={House} label="Início" />
          </TabTrigger>
          <TabTrigger name="my-payments" href="/my-payments" asChild>
            <NavigationBarItem icon={Receipt} label="Meus pagamentos" />
          </TabTrigger>
          <TabTrigger name="settings" href="/settings" asChild>
            <NavigationBarItem icon={Settings} label="Configurações" />
          </TabTrigger>
        </NavigationBar>
      </TabList>
    </Tabs>
  );
}
