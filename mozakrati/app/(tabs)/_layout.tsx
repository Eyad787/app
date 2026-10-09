import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { TabBar } from '@/components/TabBar';
import { TABS } from '@/constants/navigation';
import { useResponsive } from '@/hooks/useResponsive';
import { useColors } from '@/hooks/useTheme';
import { useData } from '@/lib/db/DataProvider';

export default function TabsLayout() {
  const colors = useColors();
  const { isWide } = useResponsive();
  const { data } = useData();

  if (!data.profile.onboardingDone) return <Redirect href="/onboarding" />;

  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} wide={isWide} />}
      screenOptions={{
        headerShown: false,
        tabBarPosition: isWide ? 'left' : 'bottom',
        sceneStyle: { backgroundColor: colors.background },
        animation: 'fade',
      }}
    >
      {TABS.map((t) => (
        <Tabs.Screen key={t.name} name={t.name} options={{ title: t.title }} />
      ))}
    </Tabs>
  );
}
