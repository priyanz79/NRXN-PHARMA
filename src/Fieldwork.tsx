import React, { useState } from 'react';
import { Linking, Text, View } from 'react-native';
import * as Location from 'expo-location';
import { useStore } from './store';
import { localDate, money, monthOf } from './domain';
import { Badge, Button, Card, Chip, Empty, Field, H, Row, Small, styles } from './ui';
const GPS_ACCURACY_LIMIT = 100;
const GPS_FIX_TIMEOUT_MS = 20_000;
function getAccurateLocation() {
  return new Promise<Location.LocationObject>((resolve, reject) => {
    let subscription: Location.LocationSubscription | null = null;
    let best: Location.LocationObject | null = null;
    let finished = false;
    const timeout = setTimeout(() => finish(best), GPS_FIX_TIMEOUT_MS);
    const finish = (location: Location.LocationObject | null, error?: Error) => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      subscription?.remove();
      if (error) reject(error);
      else if (location) resolve(location);
      else reject(new Error('No GPS reading arrived. Check that location is enabled and try again outdoors.'));
    };
    void Location.watchPositionAsync(
      { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 1000, distanceInterval: 0 },
      location => {
        const accuracy = location.coords.accuracy;
        if (accuracy !== null && Number.isFinite(accuracy) && (!best || accuracy < (best.coords.accuracy ?? Infinity))) best = location;
        if (accuracy !== null && Number.isFinite(accuracy) && accuracy <= GPS_ACCURACY_LIMIT) finish(location);
      },
      message => finish(best, new Error(message))
    ).then(value => {
      subscription = value;
      if (finished) subscription.remove();
    }).catch(error => finish(best, error instanceof Error ? error : new Error('Location unavailable.')));
  });
}
export function Visits() {
  const { state, act } = useStore(); const today = localDate(); const p = state.plans.find(p => p.month === monthOf()); const day = p?.days.find(d => d.date === today);
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [notes, setNotes] = useState<Record<string, string>>({}); const [reason, setReason] = useState('Doctor unavailable'); const [reasonDetail, setReasonDetail] = useState(''); const [selected, setSelected] = useState('');
  const checkIn = async (contactId: string) => { setBusy(true); setError(''); try { const permission = await Location.requestForegroundPermissionsAsync(); if (permission.status !== 'granted') throw new Error('Location permission was declined. Allow precise location access and try again.'); const loc = await getAccurateLocation(); const accuracy = loc.coords.accuracy ?? Infinity; if (!Number.isFinite(accuracy) || accuracy > GPS_ACCURACY_LIMIT) throw new Error(`GPS accuracy is ${Number.isFinite(accuracy) ? `about ${Math.round(accuracy)} m` : 'unavailable'}; this check-in needs ${GPS_ACCURACY_LIMIT} m or better. Enable precise location and try outdoors.`); await act({ type: 'startVisit', contactId, verification: 'GPS', location: { latitude: loc.coords.latitude, longitude: loc.coords.longitude, accuracy } }); } catch (e) { setError(e instanceof Error ? e.message : 'Location unavailable.'); } finally { setBusy(false); } };
  return <><Card><H>Today’s call report</H><Small>{today} · {day?.patch ?? 'No route'} · {day?.station ?? 'No station'}</Small><Badge value={p?.status ?? 'No plan'} /><Small>GPS check-in requires accuracy within 100 m and a location within 200 m of the saved clinic. Demo check-ins are explicitly marked and excluded from GPS verification metrics.</Small>{error ? <Small>{error}</Small> : null}</Card>
    {p?.status !== 'Approved' ? <Empty text="Your monthly plan needs approval before you can start today’s visits." /> : !day?.contactIds.length ? <Empty text="No visits planned for today. Add visits in Tour Plan." /> : day.contactIds.map((cid, i) => {
      const c = state.contacts.find(c => c.id === cid)!; const v = state.visits.find(v => v.date === today && v.contactId === cid); const deviation = state.deviations.find(d => d.date === today && d.contactId === cid && d.status !== 'Rejected');
      return <Card key={cid}><Row><Chip title={String(i + 1).padStart(2, '0')} /><View style={{ flex: 1 }}><Text style={styles.title}>{c.name}</Text><Small>{c.specialty} · {c.patch}</Small></View><Badge value={v?.completedAt ? 'Completed' : v ? 'In progress' : deviation ? `Deviation ${deviation.status}` : 'Planned'} /></Row><Small>{c.address}</Small>
        {!v && !deviation && <Row><Button title={busy ? 'Finding accurate GPS…' : 'GPS check-in'} disabled={busy} onPress={() => { void checkIn(cid); }} /><Button title="Demo check-in" secondary onPress={() => { void act({ type: 'startVisit', contactId: cid, verification: 'Demo' }); }} /><Button title="Request deviation" secondary onPress={() => setSelected(selected === cid ? '' : cid)} /></Row>}
        {selected === cid && !v && !deviation && <><Row>{['Doctor unavailable', 'Clinic closed', 'Route disruption', 'Other'].map(r => <Chip title={r} key={r} selected={reason === r} onPress={() => setReason(r)} />)}</Row><Field label="Reason details" value={reasonDetail} onChangeText={setReasonDetail} /><Button title="Submit deviation" onPress={async () => { if (reason === 'Other' && !reasonDetail.trim()) { setError('Describe the reason for this deviation.'); return; } if (await act({ type: 'deviation', contactId: cid, reason: `${reason}${reasonDetail ? ': ' + reasonDetail : ''}` })) { setSelected(''); setReasonDetail(''); } }} /></>}
        {v && <><Small>{v.verification === 'GPS' ? `GPS verified · ${Math.round(v.distance ?? 0)} m from clinic` : 'Demo check-in · location not verified'} · Started {new Date(v.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Small>{v.completedAt ? <Small>Outcome: {v.note}</Small> : <><Field label={`Visit outcome for ${c.name}`} multiline value={notes[cid] ?? ''} onChangeText={n => setNotes({ ...notes, [cid]: n })} placeholder="Discussion, response, and next steps" /><Small>Use Inventory to record samples before completing the visit.</Small><Button title="Complete visit" onPress={() => { void act({ type: 'completeVisit', visitId: v.id, note: notes[cid] ?? '' }); }} /></>}</>}
        {deviation && <Small>{deviation.reason}</Small>}
      </Card>;
    })}
    <Card><H>Recent completed calls</H>{state.visits.filter(v => v.completedAt).slice(-10).reverse().map(v => <View key={v.id} style={styles.item}><Text style={styles.title}>{state.contacts.find(c => c.id === v.contactId)?.name}</Text><Small>{v.date} · {v.note}</Small></View>)}{!state.visits.some(v => v.completedAt) && <Small>Your completed calls will appear here.</Small>}</Card>
  </>;
}
export function Inventory() {
  const { state, act } = useStore(); const [productId, setProductId] = useState(state.products[0]?.id ?? ''); const [quantity, setQuantity] = useState('1'); const active = state.visits.find(v => !v.completedAt); const [urlError, setUrlError] = useState('');
  return <><Card><H>Samples & materials</H><Small>Your locally saved balances. Issue stock during an active doctor visit.</Small>{state.products.map(p => <View style={styles.item} key={p.id}><Row><View style={{ flex: 1 }}><Text style={styles.title}>{p.name}</Text><Small>{p.category}</Small></View><Text style={{ fontSize: 24, fontWeight: '700' }}>{p.balance}</Text></Row></View>)}</Card>
    <Card><H>Record a distribution</H><Small>{active ? `Active visit: ${state.contacts.find(c => c.id === active.contactId)?.name}` : 'Start a doctor visit first.'}</Small><Row>{state.products.map(p => <Chip key={p.id} title={p.name} selected={productId === p.id} onPress={() => setProductId(p.id)} />)}</Row><Field label="Quantity to issue" keyboardType="number-pad" value={quantity} onChangeText={setQuantity} /><Button title="Issue from my stock" disabled={!active} onPress={() => { if (active) void act({ type: 'sample', visitId: active.id, productId, quantity: Number(quantity) }); }} /></Card>
    <Card><H>E-detailing library</H><Small>Administrators can attach approved HTTPS PDF or video links. This build opens them in your device’s viewer; downloaded offline decks are not yet supported.</Small>{state.products.map(p => <View key={p.id} style={styles.item}><Text style={styles.title}>{p.name}</Text>{p.materialUrl ? <Button title={`Open material: ${p.name}`} secondary onPress={() => { Linking.openURL(p.materialUrl).catch(() => setUrlError('Unable to open this material. Check the saved URL.')); }} /> : <Small>No approved material attached.</Small>}</View>)}{urlError ? <Small>{urlError}</Small> : null}</Card>
    <Card><H>Distribution history</H>{state.samples.length ? state.samples.slice().reverse().map(x => <View key={x.id} style={styles.item}><Text style={styles.title}>{state.products.find(p => p.id === x.productId)?.name} × {x.quantity}</Text><Small>{state.contacts.find(c => c.id === state.visits.find(v => v.id === x.visitId)?.contactId)?.name} · {new Date(x.at).toLocaleDateString()}</Small></View>) : <Small>No stock issued yet.</Small>}</Card></>;
}
export function Orders() {
  const { state, act } = useStore(); const [contactId, setContact] = useState(''); const [productId, setProduct] = useState(''); const [qty, setQty] = useState('1'); const product = state.products.find(p => p.id === productId);
  return <><Card><H>Personal order booking</H><Small>Book an order for a chemist or stockist. Orders are saved locally for this demo.</Small><Row>{state.contacts.filter(c => c.kind !== 'Doctor').map(c => <Chip key={c.id} title={c.name} selected={contactId === c.id} onPress={() => setContact(c.id)} />)}</Row><Row>{state.products.filter(p => p.price > 0).map(p => <Chip key={p.id} title={`${p.name} · ${money(p.price)}`} selected={productId === p.id} onPress={() => setProduct(p.id)} />)}</Row>{!state.products.some(p => p.price > 0) ? <Small>The NRXN website does not publish product prices. An administrator must add internal order prices in Product Master before MRs can book orders.</Small> : null}<Field label="Order quantity" keyboardType="number-pad" value={qty} onChangeText={setQty} /><H>{money((product?.price ?? 0) * (Number(qty) || 0))}</H><Button title="Book order" disabled={!state.products.some(p => p.price > 0)} onPress={async () => { if (await act({ type: 'order', contactId, productId, quantity: Number(qty) })) setQty('1'); }} /></Card><Card><H>Order book</H>{state.orders.length ? state.orders.slice().reverse().map(o => <View key={o.id} style={styles.item}><Row><Text style={[styles.title, { flex: 1 }]}>{state.contacts.find(c => c.id === o.contactId)?.name}</Text><Badge value={o.status} /></Row><Small>{state.products.find(p => p.id === o.productId)?.name} × {o.quantity} · {money(o.total)}</Small></View>) : <Empty text="No orders booked yet." />}</Card></>;
}
export function Expenses() {
  const { state, act } = useStore(); const [date, setDate] = useState(localDate()); const p = state.plans.find(p => p.month === monthOf(date)); const d = p?.days.find(d => d.date === date); const amount = d ? state.rates[d.station] + d.km * state.rates.perKm : 0;
  return <><Card><H>Travel & daily allowance</H><Field label="Claim date (YYYY-MM-DD)" value={date} onChangeText={setDate} /><Small>Allowance and kilometres are taken from your approved tour plan. Rates below are editable demo policy values.</Small>{d && <><Row><Chip title={d.station} /><Chip title={`${d.km} km`} /><Badge value={p!.status} /></Row><Small>{money(state.rates[d.station])} daily allowance + {d.km} km × {money(state.rates.perKm)}</Small><H>{money(amount)}</H></>}<Button title="Submit expense claim" disabled={!d} onPress={() => { void act({ type: 'claim', date }); }} /></Card><Card><H>My claims</H>{state.claims.length ? state.claims.slice().reverse().map(c => <View key={c.id} style={styles.item}><Row><Text style={[styles.title, { flex: 1 }]}>{c.date} · {money(c.total)}</Text><Badge value={c.status} /></Row><Small>{c.station} · {c.km} km</Small></View>) : <Empty text="Complete a visit, then submit your first claim." />}</Card></>;
}
export function RCPA() {
  const { state, act } = useStore(); const [chemist, setChemist] = useState(''); const [doctor, setDoctor] = useState(''); const [brand, setBrand] = useState(''); const [units, setUnits] = useState('');
  return <><Card><H>Retail prescription audit</H><Small>Record aggregate competitor observations. Do not enter patient information.</Small><Row>{state.contacts.filter(c => c.kind === 'Chemist').map(c => <Chip key={c.id} title={c.name} selected={chemist === c.id} onPress={() => setChemist(c.id)} />)}</Row><Row>{state.contacts.filter(c => c.kind === 'Doctor').map(c => <Chip key={c.id} title={c.name} selected={doctor === c.id} onPress={() => setDoctor(c.id)} />)}</Row><Field label="Competitor brand" value={brand} onChangeText={setBrand} /><Field label="Observed units" value={units} keyboardType="number-pad" onChangeText={setUnits} /><Button title="Save audit" onPress={async () => { if (await act({ type: 'audit', contactId: chemist, doctorId: doctor, brand, units: Number(units) })) { setBrand(''); setUnits(''); } }} /></Card><Card><H>Recent observations</H>{state.audits.length ? state.audits.slice().reverse().map(a => <View key={a.id} style={styles.item}><Text style={styles.title}>{a.brand} · {a.units} units</Text><Small>{state.contacts.find(c => c.id === a.contactId)?.name} · {state.contacts.find(c => c.id === a.doctorId)?.name}</Small></View>) : <Empty text="No observations recorded yet." />}</Card></>;
}
