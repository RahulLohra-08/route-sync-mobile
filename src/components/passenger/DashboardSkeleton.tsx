import { View } from 'react-native';

import { Skeleton } from '@/components/feedback/Skeleton';

/** Matches the real layout so nothing jumps when data arrives. */
export function DashboardSkeleton() {
  return (
    <View style={{ gap: 24 }}>
      <View style={{ paddingHorizontal: 20 }}>
        <Skeleton height={300} radius={26} />
      </View>

      <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 20 }}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={{ flex: 1, gap: 8, alignItems: 'center' }}>
            <Skeleton height={58} radius={18} />
            <Skeleton height={10} width={40} radius={5} />
          </View>
        ))}
      </View>

      <View style={{ gap: 12 }}>
        <Skeleton height={20} width={160} style={{ marginLeft: 20 }} />
        <View style={{ flexDirection: 'row', gap: 12, paddingLeft: 20 }}>
          <Skeleton width={232} height={200} radius={22} />
          <Skeleton width={232} height={200} radius={22} />
        </View>
      </View>

      <View style={{ gap: 12, paddingHorizontal: 20 }}>
        <Skeleton height={20} width={180} />
        <Skeleton height={168} radius={20} />
        <Skeleton height={168} radius={20} />
      </View>
    </View>
  );
}
