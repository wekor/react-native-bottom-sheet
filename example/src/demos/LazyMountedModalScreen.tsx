import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import {
  ModalBottomSheet,
  type ModalBottomSheetProps,
} from '@wekor/react-native-bottom-sheet';

import {
  DemoScreen,
  MODAL_SCRIM_COLOR,
  SECTION_HEIGHT,
  SheetBackground,
  SheetHeader,
  useSheetBottomPadding,
} from '../demoShared';

type Mount = NonNullable<ModalBottomSheetProps['mount']>;

const MOUNTS: Mount[] = ['open', 'once', 'always'];

export const LazyMountedModalScreen = () => {
  const [index, setIndex] = useState(0);
  const [mount, setMount] = useState<Mount>('open');
  const [mounted, setMounted] = useState(false);
  const [mountCount, setMountCount] = useState(0);

  const handleContentMount = () => {
    setMounted(true);
    setMountCount((previous) => previous + 1);
  };

  return (
    <DemoScreen
      title="Lazy mounted modal"
      sheet={
        <ModalBottomSheet
          // Remount when the mode changes so each mode starts fresh.
          key={mount}
          index={index}
          mount={mount}
          onIndexChange={setIndex}
          scrimColor={MODAL_SCRIM_COLOR}
          surface={<SheetBackground style={StyleSheet.absoluteFill} />}
        >
          <LazyContent
            mountCount={mountCount}
            onClose={() => setIndex(0)}
            onMount={handleContentMount}
            onUnmount={() => setMounted(false)}
          />
        </ModalBottomSheet>
      }
    >
      <Button title="Open sheet" onPress={() => setIndex(1)} />
      <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
        {MOUNTS.map((value) => (
          <Button
            key={value}
            title={value === mount ? `[${value}]` : value}
            onPress={() => setMount(value)}
          />
        ))}
      </View>
      <Text>mount: {mount}</Text>
      <Text>content mounted: {mounted ? 'yes' : 'no'}</Text>
      <Text>content mounts: {mountCount}</Text>
    </DemoScreen>
  );
};

const LazyContent = ({
  mountCount,
  onClose,
  onMount,
  onUnmount,
}: {
  mountCount: number;
  onClose: () => void;
  onMount: () => void;
  onUnmount: () => void;
}) => {
  const sheetBottomPadding = useSheetBottomPadding(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: report only the mount and unmount of this content
  useEffect(() => {
    onMount();
    return onUnmount;
  }, []);

  return (
    <>
      <SheetHeader title="Lazy mounted modal" onClose={onClose} />
      <View
        style={{
          height: SECTION_HEIGHT + sheetBottomPadding,
          paddingBottom: sheetBottomPadding,
          paddingHorizontal: 20,
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <Text>content mounts: {mountCount}</Text>
        <Button title="Close from sheet" onPress={onClose} />
      </View>
    </>
  );
};
