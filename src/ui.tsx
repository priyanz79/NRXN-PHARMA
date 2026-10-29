import React, { useState } from 'react';
import { Text, View, Pressable, TextInput, StyleSheet, TextInputProps } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
export const colors = { ink: '#153D3A', muted: '#6E817F', teal: '#087E75', mint: '#E5F3EF', bg: '#F4F7F5', line: '#DFE8E3', amber: '#A56819', white: '#FFFFFF' };
export function Icon({ name, color = colors.teal, size = 21 }: { name: React.ComponentProps<typeof Ionicons>['name']; color?: string; size?: number }) { return <Ionicons name={name} size={size} color={color} />; }
export function Card({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) { return <View style={[styles.card, dark && { backgroundColor: colors.ink, borderColor: colors.ink }]}>{children}</View>; }
export function H({ children }: { children: React.ReactNode }) { return <Text style={styles.heading}>{children}</Text>; }
export function Small({ children }: { children: React.ReactNode }) { return <Text style={styles.small}>{children}</Text>; }
export function Label({ children }: { children: React.ReactNode }) { return <Text style={styles.label}>{children}</Text>; }
export function Row({ children }: { children: React.ReactNode }) { return <View style={styles.row}>{children}</View>; }
export function Button({ title, onPress, secondary = false, disabled = false, icon }: { title: string; onPress: () => void; secondary?: boolean; disabled?: boolean; icon?: React.ComponentProps<typeof Ionicons>['name'] }) { return <Pressable accessibilityRole="button" accessibilityLabel={title} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, secondary && styles.secondary, { opacity: disabled ? 0.4 : pressed ? 0.75 : 1 }]}>{icon && <Icon name={icon} size={18} color={secondary ? colors.teal : 'white'} />}<Text style={[styles.buttonText, secondary && { color: colors.teal }]}>{title}</Text></Pressable>; }
export function Chip({ title, selected, onPress }: { title: string; selected?: boolean; onPress?: () => void }) { return <Pressable accessibilityRole={onPress ? 'button' : 'text'} accessibilityState={{ selected: !!selected }} onPress={onPress} style={[styles.chip, selected && { backgroundColor: colors.teal, borderColor: colors.teal }]}><Text style={{ color: selected ? 'white' : colors.ink, fontSize: 12, fontWeight: '600' }}>{title}</Text></Pressable>; }
export function Badge({ value }: { value: string }) { const good = ['Approved', 'Completed', 'GPS'].includes(value); return <View style={[styles.badge, { backgroundColor: good ? '#E2F3EA' : '#F5F0E3' }]}><Text style={{ color: good ? '#28724E' : '#896521', fontSize: 11, fontWeight: '700' }}>{value}</Text></View>; }
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  const [focused, setFocused] = useState(false); const [draft, setDraft] = useState('');
  const numeric = ['decimal-pad', 'number-pad', 'numbers-and-punctuation'].includes(props.keyboardType ?? '');
  return <View style={{ gap: 7 }}><Label>{label}</Label><TextInput accessibilityLabel={label} placeholderTextColor="#9AA9A4" {...props} value={numeric && focused ? draft : props.value} onFocus={e => { setDraft(props.value ?? ''); setFocused(true); props.onFocus?.(e); }} onBlur={e => { setFocused(false); props.onBlur?.(e); }} onChangeText={value => { setDraft(value); props.onChangeText?.(value); }} style={[styles.input, props.multiline && { minHeight: 90, textAlignVertical: 'top' }, props.style]} /></View>;
}
export function Empty({ text }: { text: string }) { return <View style={styles.empty}><Icon name="leaf-outline" /><Small>{text}</Small></View>; }
export function Metric({ value, label }: { value: string | number; label: string }) { return <View style={styles.metric}><Text style={{ fontSize: 28, fontWeight: '700', color: colors.ink }}>{value}</Text><Small>{label}</Small></View>; }
export const styles = StyleSheet.create({
  card: { backgroundColor: 'white', borderWidth: 1, borderColor: colors.line, borderRadius: 20, padding: 20, gap: 14, marginBottom: 16 },
  heading: { color: colors.ink, fontSize: 19, fontWeight: '700', letterSpacing: -0.4 },
  small: { color: colors.muted, fontSize: 13, lineHeight: 20 }, label: { color: colors.ink, fontSize: 12, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10 },
  button: { backgroundColor: colors.teal, borderRadius: 12, paddingHorizontal: 17, paddingVertical: 13, minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  buttonText: { color: 'white', fontWeight: '600', fontSize: 13 }, secondary: { backgroundColor: colors.mint },
  chip: { paddingHorizontal: 13, paddingVertical: 10, minHeight: 40, borderRadius: 10, borderWidth: 1, borderColor: colors.line, backgroundColor: 'white' },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 6 },
  input: { borderWidth: 1, borderColor: colors.line, borderRadius: 10, paddingHorizontal: 13, paddingVertical: 12, color: colors.ink, fontSize: 14, backgroundColor: '#FAFCFB', minHeight: 46 },
  empty: { padding: 24, alignItems: 'center', gap: 10 }, metric: { flex: 1, minWidth: 95, gap: 5, padding: 16, borderRadius: 15, backgroundColor: 'white', borderWidth: 1, borderColor: colors.line },
  item: { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 14, gap: 9 },
  title: { fontSize: 15, fontWeight: '600', color: colors.ink },
});
