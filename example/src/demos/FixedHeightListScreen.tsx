import { useState } from 'react';
import { Button, FlatList, StyleSheet, Text, View } from 'react-native';
import {
  ModalBottomSheet,
  type Detent,
} from '@wekor/react-native-bottom-sheet';

import {
  DATA,
  DemoScreen,
  ListRow,
  MODAL_SCRIM_COLOR,
  SheetBackground,
  SheetHeader,
  useSheetBottomPadding,
} from '../demoShared';

const DETENT_SETS: { label: string; detents: Detent[] }[] = [
  { label: 'Points', detents: [0, 320, 560] },
  { label: 'Percentages', detents: [0, '50%', '90%'] },
  { label: 'Content', detents: [0, 'content'] },
];

const formatDetent = (detent: Detent) =>
  typeof detent === 'number' ? `${detent}pt` : String(detent);

export const FixedHeightListScreen = () => {
  const [detentSet, setDetentSet] = useState(0);
  const [index, setIndex] = useState(0);
  const [position, setPosition] = useState(0);
  const sheetBottomPadding = useSheetBottomPadding();
  const { detents } = DETENT_SETS[detentSet]!;

  const selectDetentSet = (next: number) => {
    setDetentSet(next);
    // Keep the index in range when the new set has fewer detents.
    setIndex((current) =>
      Math.min(current, DETENT_SETS[next]!.detents.length - 1)
    );
  };

  return (
    <DemoScreen
      title="Fixed-height list"
      sheet={
        <ModalBottomSheet
          detents={detents}
          index={index}
          onIndexChange={setIndex}
          onPositionChange={(event) => setPosition(event.nativeEvent.position)}
          scrimColor={MODAL_SCRIM_COLOR}
          surface={<SheetBackground style={StyleSheet.absoluteFill} />}
        >
          <SheetHeader title="Fixed-height list" onClose={() => setIndex(0)} />
          <DetentSetPicker selected={detentSet} onSelect={selectDetentSet} />
          <FlatList
            data={DATA}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: sheetBottomPadding }}
            renderItem={({ item, index: itemIndex }) => (
              <ListRow item={item} index={itemIndex} />
            )}
          />
        </ModalBottomSheet>
      }
    >
      <View style={styles.controls}>
        <DetentSetPicker selected={detentSet} onSelect={selectDetentSet} />
        {detents.slice(1).map((detent, offset) => (
          <Button
            key={offset}
            title={`Open to ${formatDetent(detent)} (${offset + 1})`}
            onPress={() => setIndex(offset + 1)}
          />
        ))}
      </View>
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Current state</Text>
        <Text>detents: [{detents.map(formatDetent).join(', ')}]</Text>
        <Text>index: {index}</Text>
        <Text>position: {position.toFixed(1)}pt</Text>
        <Text style={styles.body}>
          The list reaches its last row at every detent. Without a content
          detent, it is laid out against the tallest detent, so its end stays on
          screen. Switch sets while the sheet is open to resize it.
        </Text>
      </View>
    </DemoScreen>
  );
};

const DetentSetPicker = ({
  selected,
  onSelect,
}: {
  selected: number;
  onSelect: (detentSet: number) => void;
}) => (
  <View style={styles.picker}>
    {DETENT_SETS.map((set, detentSet) => (
      <Button
        key={set.label}
        title={set.label}
        disabled={detentSet === selected}
        onPress={() => onSelect(detentSet)}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  controls: { gap: 12 },
  picker: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#f3f3f3',
    gap: 6,
  },
  cardLabel: { fontWeight: '600' },
  body: { fontSize: 15, lineHeight: 22, color: '#555' },
});
