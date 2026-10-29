import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useStore } from './store';
import { Day, Station, coverage, datesInMonth, localDate, monthOf, shiftMonth } from './domain';
import { Badge, Button, Card, Chip, Field, H, Row, Small, colors, styles } from './ui';
export function Coverage({ month }: { month: string }) {
  const { state } = useStore();
  return <Card><H>Doctor coverage</H><Small>Scheduled visits / monthly target. Targets are editable by administrators.</Small>{coverage(state, month).map(c => <View key={c.id} style={styles.item}><Row><Text style={[styles.title, { flex: 1 }]}>{c.name}</Text><Chip title={`Class ${c.grade}`} /><Text style={styles.title}>{c.scheduled} / {c.frequency}</Text></Row><View style={{ height: 5, borderRadius: 4, backgroundColor: colors.mint }}><View style={{ height: 5, borderRadius: 4, width: `${Math.min(100, c.scheduled / c.frequency * 100)}%`, backgroundColor: c.scheduled < c.frequency ? '#D6A653' : colors.teal }} /></View><Small>{c.scheduled < c.frequency ? `${c.frequency - c.scheduled} more visit(s) needed` : c.scheduled > c.frequency ? 'Above target — review frequency' : 'On target'} · {c.completed} completed</Small></View>)}</Card>;
}
export function Planning() {
  const { state, act, role } = useStore(); const [month, setMonth] = useState(monthOf()); const [date, setDate] = useState(localDate());
  const plan = state.plans.find(p => p.month === month);
  const blank = (d: string): Day => ({ date: d, station: 'Local', patch: 'Central', km: 0, contactIds: [] });
  const [draft, setDraft] = useState<Day>(plan?.days.find(d => d.date === date) ?? blank(date)); const [view, setView] = useState('Month'); const [reason, setReason] = useState('');
  const changeDate = (d: string) => { setDate(d); setDraft(state.plans.find(p => p.month === monthOf(d))?.days.find(x => x.date === d) ?? blank(d)); };
  const changeMonth = (delta: number) => { const m = shiftMonth(month, delta); setMonth(m); changeDate(`${m}-01`); };
  const canEdit = role === 'MR' && (!plan || ['Draft', 'Rejected'].includes(plan.status));
  const offset = (new Date(month + '-01T12:00:00').getDay() + 6) % 7;
  const allDates = datesInMonth(month); const weekIndex = Math.floor((Number(date.slice(-2)) - 1 + offset) / 7);
  const cells: (string | null)[] = [...Array(offset).fill(null), ...allDates];
  return <>
    <Card><Row><View style={{ flex: 1 }}><H>Tour planner</H><Small>Build a purposeful month in the field.</Small></View><Badge value={plan?.status ?? 'Draft'} /></Row>
      <Row><Button title="Previous month" secondary onPress={() => changeMonth(-1)} /><Text style={styles.title}>{new Date(month + '-01T12:00:00').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</Text><Button title="Next month" secondary onPress={() => changeMonth(1)} /></Row>
      <Row>{['Month', 'Week'].map(v => <Chip key={v} title={v} selected={view === v} onPress={() => setView(v)} />)}</Row>
      {view === 'Week' && <Row><Button title="Previous week" secondary onPress={() => changeDate(allDates[Math.max(0, Number(date.slice(-2)) - 8)])} /><Button title="Next week" secondary onPress={() => changeDate(allDates[Math.min(allDates.length - 1, Number(date.slice(-2)) + 6)])} /></Row>}
      <View style={{ flexDirection: 'row' }}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <Text key={i} style={{ width: '14.2857%', textAlign: 'center', color: colors.muted, fontSize: 12 }}>{d}</Text>)}</View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>{(view === 'Week' ? cells.slice(weekIndex * 7, weekIndex * 7 + 7) : cells).map((d, i) => <View key={d ?? i} style={{ width: '14.2857%', padding: 3 }}>{d && <Pressable accessibilityRole="button" accessibilityLabel={`Select ${d}`} accessibilityState={{ selected: date === d }} onPress={() => changeDate(d)} style={{ alignItems: 'center', justifyContent: 'center', height: 48, borderRadius: 12, backgroundColor: date === d ? colors.teal : d === localDate() ? colors.mint : '#F8FAF8' }}><Text style={{ color: date === d ? 'white' : colors.ink, fontWeight: '600' }}>{Number(d.slice(-2))}</Text><View style={{ height: 4, width: 4, marginTop: 4, borderRadius: 2, backgroundColor: plan?.days.some(x => x.date === d) ? (date === d ? 'white' : colors.teal) : 'transparent' }} /></Pressable>}</View>)}</View>
      {plan?.feedback ? <Small>{plan.feedback}</Small> : null}
      {canEdit && <Row><Button title="Apply weekly templates" secondary onPress={async () => { await act({ type: 'applyTemplate', month }, 'Templates applied to unplanned future days. Tap a date to review.'); }} /><Button title="Submit month for approval" onPress={() => { void act({ type: 'submitPlan', month }); }} /></Row>}
      {role === 'MR' && plan?.status === 'Approved' && <><Small>Revising this month pauses new check-ins until your manager approves it again. For a missed call today, use a deviation instead.</Small><Button title="Revise this month" secondary onPress={() => { void act({ type: 'revisePlan', month }); }} /></>}
      {role !== 'MR' && plan?.status === 'Submitted' && <><Field label="Review feedback (required for rejection)" value={reason} onChangeText={setReason} /><Row><Button title="Approve month" onPress={() => { void act({ type: 'reviewPlan', month, approve: true, reason }); }} /><Button title="Reject month" secondary onPress={() => { void act({ type: 'reviewPlan', month, approve: false, reason }); }} /></Row></>}
    </Card>
    <Card key={date}><H>{new Date(date + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</H>
      {canEdit ? <><Field label="Patch / route" value={draft.patch} onChangeText={patch => setDraft({ ...draft, patch })} /><Row>{(['Local', 'Outstation', 'Ex-Station'] as Station[]).map(station => <Chip key={station} title={station} selected={draft.station === station} onPress={() => setDraft({ ...draft, station })} />)}</Row><Field label="Planned travel (km)" keyboardType="decimal-pad" value={String(draft.km)} onChangeText={v => setDraft({ ...draft, km: Number(v) })} />
        {state.contacts.map(c => <Pressable key={c.id} accessibilityRole="checkbox" accessibilityState={{ checked: draft.contactIds.includes(c.id) }} accessibilityLabel={c.name} style={styles.item} onPress={() => setDraft({ ...draft, contactIds: draft.contactIds.includes(c.id) ? draft.contactIds.filter(x => x !== c.id) : [...draft.contactIds, c.id] })}><Row><Chip title={draft.contactIds.includes(c.id) ? '✓' : '+'} selected={draft.contactIds.includes(c.id)} /><View><Text style={styles.title}>{c.name}</Text><Small>{c.kind} · {c.patch}</Small></View></Row></Pressable>)}
        <Row><Button title="Save day" onPress={() => { void act({ type: 'saveDay', day: draft }); }} /><Button title="Save as weekday template" secondary onPress={() => { void act({ type: 'saveTemplate', day: draft }); }} /></Row>
      </> : <><Small>{plan?.days.find(d => d.date === date)?.station ?? 'No route'} · {plan?.days.find(d => d.date === date)?.patch ?? 'Unplanned'}</Small>{(plan?.days.find(d => d.date === date)?.contactIds ?? []).map(cid => <Text style={styles.title} key={cid}>{state.contacts.find(c => c.id === cid)?.name}</Text>)}</>}
    </Card><Coverage month={month} />
  </>;
}
