export type Role = 'MR' | 'Manager' | 'Administrator';
export type Station = 'Local' | 'Outstation' | 'Ex-Station';
export type Status = 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
export type Contact = { id: string; name: string; specialty: string; kind: 'Doctor' | 'Chemist' | 'Stockist'; patch: string; address: string; grade: 'A' | 'B' | 'C'; frequency: number; latitude: number; longitude: number };
export type Product = { id: string; name: string; category: string; description: string; balance: number; price: number; materialUrl: string; imageKey?: string };
export type Day = { date: string; station: Station; patch: string; contactIds: string[]; km: number };
export type Plan = { month: string; status: Status; days: Day[]; feedback: string };
export type Visit = { id: string; date: string; contactId: string; startedAt: string; completedAt?: string; note: string; verification: 'GPS' | 'Demo'; distance?: number; latitude?: number; longitude?: number; accuracy?: number };
export type Deviation = { id: string; date: string; contactId: string; reason: string; status: Status };
export type State = {
  version: 2; contacts: Contact[]; products: Product[]; plans: Plan[];
  templates: { weekday: number; station: Station; patch: string; contactIds: string[]; km: number }[];
  visits: Visit[]; deviations: Deviation[];
  samples: { id: string; visitId: string; productId: string; quantity: number; at: string }[];
  orders: { id: string; contactId: string; productId: string; quantity: number; total: number; at: string; status: Status }[];
  claims: { id: string; date: string; station: Station; km: number; total: number; status: Status }[];
  audits: { id: string; contactId: string; doctorId: string; brand: string; units: number; at: string }[];
  joint: { id: string; date: string; contactId: string; feedback: string; at: string }[];
  enquiries: { id: string; name: string; email: string; message: string; at: string }[];
  log: { id: string; actor: Role | 'Visitor'; action: string; at: string }[];
  rates: Record<Station, number> & { perKm: number };
};
export const localDate = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const monthOf = (date = localDate()) => date.slice(0, 7);
export const id = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
export const money = (v: number) => `₹${v.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
export function datesInMonth(month: string) { const [y, m] = month.split('-').map(Number); return Array.from({ length: new Date(y, m, 0).getDate() }, (_, i) => `${month}-${String(i + 1).padStart(2, '0')}`); }
export function shiftMonth(month: string, delta: number) { const [y, m] = month.split('-').map(Number); return monthOf(localDate(new Date(y, m - 1 + delta, 1))); }
export function distanceMeters(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) { const rad = (v: number) => v * Math.PI / 180; const h = Math.sin(rad(b.latitude - a.latitude) / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(rad(b.longitude - a.longitude) / 2) ** 2; return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)); }
export const officialProducts: Product[] = [
  { id: 'rabistock-dsr', name: 'RABISTOCK-DSR', category: 'Gastroenterology / GERD', description: 'Rabeprazole 20 mg + Domperidone 30 mg (SR) Capsules for GERD, Dyspepsia, and NSAID Induced Ulcer.', balance: 0, price: 0, materialUrl: '', imageKey: 'rabistock-dsr' },
  { id: 'calstock', name: 'CALSTOCK', category: 'Bone Health / Osteoporosis', description: 'Calcitriol 0.25 mcg + Calcium Carbonate 500 mg + Zinc 7.5 mg Softgel Capsules for Osteoporosis.', balance: 0, price: 0, materialUrl: '', imageKey: 'calstock' },
  { id: 'heal-xt', name: 'HEAL-XT', category: 'Anti-Inflammatory / Trauma Care', description: 'Trypsin 48 mg + Bromelain 90 mg + Rutoside 100 mg Tablets. Reduces Oedema, Hastens Recovery.', balance: 0, price: 0, materialUrl: '', imageKey: 'heal-xt' },
  { id: 'calstock-d3', name: 'CALSTOCK D3', category: 'Vitamin D3 Supplement', description: 'Vitamin D3 60K Nano Shot (Oral Solution) for Vitamin D3 deficiency, Rickets, and Osteoporosis.', balance: 0, price: 0, materialUrl: '', imageKey: 'calstock-d3' },
  { id: 'amibuzz-m', name: 'AMIBUZZ-M', category: 'Neuropathic Pain Management', description: 'Amitriptyline 10 mg + Methylcobalamin SR 1500 mcg Tablets for low back and neuropathic pain.', balance: 0, price: 0, materialUrl: '', imageKey: 'amibuzz-m' },
  { id: 'amibuzz-g-300', name: 'AMIBUZZ-G 300', category: 'Neuropathic Pain Management', description: 'Gabapentin 300 mg + Amitriptyline 10 mg Tablets for diabetic neuropathy and postherpetic neuralgia.', balance: 0, price: 0, materialUrl: '', imageKey: 'amibuzz-g-300' },
  { id: 'achguard-sp', name: 'ACHGUARD SP', category: 'Pain & Inflammation', description: 'Aceclofenac 100 mg + Paracetamol 325 mg + Serratiopeptidase 15 mg Tablets for post-operative cases.', balance: 0, price: 0, materialUrl: '', imageKey: 'achguard-sp' },
  { id: 'lcbuzz-m', name: 'Lcbuzz-M', category: 'Anti-Allergy', description: 'Montelukast 10 mg + Levocetirizine 5 mg Tablets for seasonal and perennial allergies.', balance: 0, price: 0, materialUrl: '', imageKey: 'lcbuzz-m' },
  { id: 'tamshot-d', name: 'TAMSHOT-D', category: 'Urology / BPH Management', description: 'Tamsulosin 0.4 mg + Dutasteride 0.5 mg Tablets for Benign Prostatic Hyperplasia.', balance: 0, price: 0, materialUrl: '', imageKey: 'tamshot-d' },
  { id: 'defobest', name: 'DEFOBEST', category: 'Steroid / Anti-Inflammatory', description: 'Deflazacort 6/12/18/24mg Tablets. A trusted steroid for asthma and rheumatoid arthritis.', balance: 0, price: 0, materialUrl: '', imageKey: 'defobest' },
  { id: 'linostock-600', name: 'LINOSTOCK-600', category: 'Antibiotic', description: 'Linezolid 600mg Tablets for difficult infections like nosocomial pneumonia and VRE infections.', balance: 0, price: 0, materialUrl: '', imageKey: 'linostock-600' },
  { id: 'aminomin', name: 'AMINOMIN', category: 'Vitamins & Supplements', description: 'Essential Aminoacids, Vitamins & Minerals Capsules. The building blocks of life.', balance: 0, price: 0, materialUrl: '', imageKey: 'aminomin' },
  { id: 'takeme', name: 'TAKEME', category: 'Cardio-Protective Supplement', description: 'Ginseng, Gingko Biloba, Green Tea & Antioxidant Softgel Capsules for cardiovascular health.', balance: 0, price: 0, materialUrl: '', imageKey: 'takeme' },
];
export function seed(): State {
  const today = localDate();
  const contacts: Contact[] = [
    { id: 'd1', name: 'Dr. Aditi Shah', specialty: 'Cardiology', kind: 'Doctor', patch: 'Central', address: 'Demo clinic · Central Hospital', grade: 'A', frequency: 4, latitude: 19.076, longitude: 72.8777 },
    { id: 'd2', name: 'Dr. Rohan Mehta', specialty: 'General medicine', kind: 'Doctor', patch: 'Central', address: 'Demo clinic · Park Road', grade: 'A', frequency: 4, latitude: 19.077, longitude: 72.878 },
    { id: 'd3', name: 'Dr. Neha Rao', specialty: 'Orthopaedics', kind: 'Doctor', patch: 'Highway', address: 'Demo clinic · Highway Road', grade: 'B', frequency: 2, latitude: 19.08, longitude: 72.88 },
    { id: 'c1', name: 'CarePlus Pharmacy', specialty: 'Retail chemist', kind: 'Chemist', patch: 'Central', address: 'Demo outlet · Market Road', grade: 'B', frequency: 2, latitude: 19.0765, longitude: 72.877 },
    { id: 's1', name: 'Metro Distributors', specialty: 'Regional stockist', kind: 'Stockist', patch: 'Highway', address: 'Demo outlet · Trade Centre', grade: 'C', frequency: 1, latitude: 19.081, longitude: 72.881 },
  ];
  return { version: 2, contacts, products: officialProducts.map(p => ({ ...p })), plans: [{ month: monthOf(), status: 'Approved', feedback: 'Seeded demo plan', days: [{ date: today, station: 'Local', patch: 'Central', contactIds: ['d1', 'd2', 'c1'], km: 12 }] }],
    templates: [{ weekday: 1, station: 'Local', patch: 'Central', contactIds: ['d1', 'c1'], km: 12 }, { weekday: 2, station: 'Outstation', patch: 'Highway', contactIds: ['d3', 's1'], km: 42 }],
    visits: [], deviations: [], samples: [], orders: [], claims: [], audits: [], joint: [], enquiries: [], log: [], rates: { Local: 150, Outstation: 350, 'Ex-Station': 600, perKm: 4 },
  };
}
export function migrate(input: unknown): State {
  const fresh = seed();
  if (!input || typeof input !== 'object') return fresh;
  const old = input as any;
  if (old.version === 2 && Array.isArray(old.products) && Array.isArray(old.contacts) && Array.isArray(old.plans)) return old as State;
  if (old.version !== 1) return fresh;
  return {
    ...fresh,
    contacts: Array.isArray(old.contacts) ? old.contacts : fresh.contacts,
    plans: Array.isArray(old.plans) ? old.plans : fresh.plans,
    templates: Array.isArray(old.templates) ? old.templates : fresh.templates,
    visits: Array.isArray(old.visits) ? old.visits : fresh.visits,
    deviations: Array.isArray(old.deviations) ? old.deviations : fresh.deviations,
    claims: Array.isArray(old.claims) ? old.claims : fresh.claims,
    audits: Array.isArray(old.audits) ? old.audits : fresh.audits,
    joint: Array.isArray(old.joint) ? old.joint : fresh.joint,
    enquiries: Array.isArray(old.enquiries) ? old.enquiries : fresh.enquiries,
    rates: old.rates ?? fresh.rates,
    log: [{ id: id(), actor: 'Administrator', action: 'catalogueMigration', at: new Date().toISOString() }, ...(Array.isArray(old.log) ? old.log : [])],
  };
}
export type Action =
  | { type: 'saveDay'; day: Day }
  | { type: 'saveTemplate'; day: Day }
  | { type: 'applyTemplate'; month: string }
  | { type: 'submitPlan'; month: string }
  | { type: 'revisePlan'; month: string }
  | { type: 'reviewPlan'; month: string; approve: boolean; reason: string }
  | { type: 'startVisit'; contactId: string; verification: 'Demo' | 'GPS'; location?: { latitude: number; longitude: number; accuracy: number } }
  | { type: 'completeVisit'; visitId: string; note: string }
  | { type: 'deviation'; contactId: string; reason: string }
  | { type: 'reviewDeviation'; deviationId: string; approve: boolean }
  | { type: 'sample'; visitId: string; productId: string; quantity: number }
  | { type: 'order'; contactId: string; productId: string; quantity: number }
  | { type: 'claim'; date: string }
  | { type: 'reviewClaim'; claimId: string; approve: boolean }
  | { type: 'audit'; contactId: string; doctorId: string; brand: string; units: number }
  | { type: 'joint'; contactId: string; feedback: string }
  | { type: 'saveContact'; contact: Contact }
  | { type: 'saveProduct'; product: Product }
  | { type: 'rates'; rates: State['rates'] }
  | { type: 'enquiry'; name: string; email: string; message: string };
function requireThat(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }
function requireRole(role: Role | 'Visitor', allowed: (Role | 'Visitor')[]) { requireThat(allowed.includes(role), 'This action is not available to your role.'); }
const nonempty = (v: string) => v.trim().length > 0;
const positiveInt = (v: number) => Number.isSafeInteger(v) && v > 0;
export function transition(current: State, actor: Role | 'Visitor', action: Action): State {
  const s: State = JSON.parse(JSON.stringify(current));
  const today = localDate(); const now = new Date().toISOString();
  const planFor = (date: string) => s.plans.find(p => p.month === monthOf(date));
  const approvedDay = (date: string) => { const p = planFor(date); requireThat(p?.status === 'Approved', 'An approved tour plan is required.'); const d = p.days.find(d => d.date === date); requireThat(d, 'No visits are planned for this date.'); return d; };
  const editable = (month: string) => { let p = s.plans.find(p => p.month === month); if (!p) { p = { month, status: 'Draft', days: [], feedback: '' }; s.plans.push(p); } requireThat(['Draft', 'Rejected'].includes(p.status), 'Request a revision before editing an approved or submitted plan.'); return p; };
  switch (action.type) {
    case 'saveDay': {
      requireRole(actor, ['MR']); const d = action.day;
      requireThat(datesInMonth(monthOf(d.date)).includes(d.date) && d.date >= today, 'Choose today or a future date.');
      requireThat(nonempty(d.patch) && Number.isFinite(d.km) && d.km >= 0 && d.km <= 2000, 'Enter a patch and distance between 0 and 2,000 km.');
      requireThat(d.contactIds.every(cid => s.contacts.some(c => c.id === cid)), 'Choose valid contacts.');
      const p = editable(monthOf(d.date)); p.status = 'Draft'; p.days = p.days.filter(x => x.date !== d.date); if (d.contactIds.length) p.days.push({ ...d, contactIds: [...new Set(d.contactIds)] }); break;
    }
    case 'saveTemplate': {
      requireRole(actor, ['MR']); const d = action.day; requireThat(d.contactIds.length > 0 && nonempty(d.patch) && Number.isFinite(d.km) && d.km >= 0 && d.km <= 2000, 'Select contacts, a patch, and a valid distance first.'); const weekday = new Date(d.date + 'T12:00:00').getDay(); s.templates = s.templates.filter(t => t.weekday !== weekday); s.templates.push({ ...d, weekday }); break;
    }
    case 'applyTemplate': {
      requireRole(actor, ['MR']); const p = editable(action.month); const existing = new Set(p.days.map(d => d.date));
      for (const date of datesInMonth(action.month).filter(d => d >= today && !existing.has(d))) { const t = s.templates.find(t => t.weekday === new Date(date + 'T12:00:00').getDay()); if (t) p.days.push({ date, station: t.station, patch: t.patch, contactIds: [...t.contactIds], km: t.km }); } p.status = 'Draft'; break;
    }
    case 'submitPlan': { requireRole(actor, ['MR']); const p = editable(action.month); requireThat(p.days.length > 0, 'Add at least one planned day.'); p.status = 'Submitted'; p.feedback = ''; break; }
    case 'revisePlan': { requireRole(actor, ['MR']); const p = planFor(action.month); requireThat(p && ['Approved', 'Rejected'].includes(p.status), 'Only approved or rejected plans can be revised.'); p.status = 'Draft'; p.feedback = 'Revision started; approval is required again.'; break; }
    case 'reviewPlan': { requireRole(actor, ['Manager', 'Administrator']); const p = planFor(action.month); requireThat(p?.status === 'Submitted', 'This plan is not awaiting review.'); requireThat(action.approve || nonempty(action.reason), 'A rejection reason is required.'); p.status = action.approve ? 'Approved' : 'Rejected'; p.feedback = action.reason.trim(); break; }
    case 'startVisit': {
      requireRole(actor, ['MR']); const d = approvedDay(today); requireThat(d.contactIds.includes(action.contactId), 'This contact is not on today’s approved plan.');
      requireThat(!s.visits.some(v => v.date === today && v.contactId === action.contactId), 'This visit has already been started.');
      requireThat(!s.visits.some(v => !v.completedAt), 'Complete the active visit before starting another.');
      requireThat(!s.deviations.some(v => v.date === today && v.contactId === action.contactId && v.status !== 'Rejected'), 'This visit has an active deviation request.');
      const contact = s.contacts.find(c => c.id === action.contactId)!; let distance: number | undefined;
      if (action.verification === 'GPS') { requireThat(action.location && Number.isFinite(action.location.latitude) && Number.isFinite(action.location.longitude) && Number.isFinite(action.location.accuracy) && action.location.accuracy >= 0 && action.location.accuracy <= 100, 'GPS accuracy must be within 100 metres. Try again outdoors.'); distance = distanceMeters(contact, action.location); requireThat(distance <= 200, `You are ${Math.round(distance)} m away. Check-in requires being within 200 m of the clinic.`); }
      s.visits.push({ id: id(), date: today, contactId: action.contactId, startedAt: now, note: '', verification: action.verification, distance, ...action.location }); break;
    }
    case 'completeVisit': { requireRole(actor, ['MR']); const v = s.visits.find(v => v.id === action.visitId); requireThat(v && !v.completedAt, 'Select an active visit.'); requireThat(nonempty(action.note), 'Add a visit outcome before completing the call.'); v.note = action.note.trim(); v.completedAt = now; break; }
    case 'deviation': { requireRole(actor, ['MR']); const d = approvedDay(today); requireThat(d.contactIds.includes(action.contactId) && nonempty(action.reason), 'Select a planned contact and enter a reason.'); requireThat(!s.visits.some(v => v.date === today && v.contactId === action.contactId), 'A started visit cannot be marked as unavailable.'); requireThat(!s.deviations.some(v => v.date === today && v.contactId === action.contactId && v.status !== 'Rejected'), 'A deviation already exists.'); s.deviations.push({ id: id(), date: today, contactId: action.contactId, reason: action.reason.trim(), status: 'Submitted' }); break; }
    case 'reviewDeviation': { requireRole(actor, ['Manager', 'Administrator']); const d = s.deviations.find(d => d.id === action.deviationId); requireThat(d?.status === 'Submitted', 'Deviation is not pending.'); d.status = action.approve ? 'Approved' : 'Rejected'; break; }
    case 'sample': { requireRole(actor, ['MR']); const p = s.products.find(p => p.id === action.productId); const v = s.visits.find(v => v.id === action.visitId); requireThat(v && !v.completedAt && s.contacts.find(c => c.id === v.contactId)?.kind === 'Doctor', 'Issue samples during an active doctor visit.'); requireThat(p && positiveInt(action.quantity) && action.quantity <= p.balance, 'Enter a whole quantity within your available balance.'); p.balance -= action.quantity; s.samples.push({ id: id(), visitId: v.id, productId: p.id, quantity: action.quantity, at: now }); break; }
    case 'order': { requireRole(actor, ['MR']); const c = s.contacts.find(c => c.id === action.contactId); const p = s.products.find(p => p.id === action.productId); requireThat(c && c.kind !== 'Doctor' && p && p.price > 0 && positiveInt(action.quantity), 'Choose a chemist/stockist, a priced product, and a positive whole quantity.'); s.orders.push({ id: id(), contactId: c.id, productId: p.id, quantity: action.quantity, total: Math.round(p.price * action.quantity * 100) / 100, at: now, status: 'Submitted' }); break; }
    case 'claim': { requireRole(actor, ['MR']); requireThat(action.date <= today, 'Future travel cannot be claimed.'); const d = approvedDay(action.date); requireThat(s.visits.some(v => v.date === action.date && v.completedAt), 'Complete at least one visit before claiming.'); requireThat(!s.claims.some(c => c.date === action.date && c.status !== 'Rejected'), 'A claim already exists for this date.'); s.claims.push({ id: id(), date: action.date, station: d.station, km: d.km, total: Math.round((s.rates[d.station] + d.km * s.rates.perKm) * 100) / 100, status: 'Submitted' }); break; }
    case 'reviewClaim': { requireRole(actor, ['Manager', 'Administrator']); const c = s.claims.find(c => c.id === action.claimId); requireThat(c?.status === 'Submitted', 'Claim is not pending.'); c.status = action.approve ? 'Approved' : 'Rejected'; break; }
    case 'audit': { requireRole(actor, ['MR']); requireThat(s.contacts.some(c => c.id === action.contactId && c.kind === 'Chemist') && s.contacts.some(c => c.id === action.doctorId && c.kind === 'Doctor') && nonempty(action.brand) && positiveInt(action.units), 'Choose a chemist, a doctor, competitor brand, and positive whole units.'); s.audits.push({ ...action, id: id(), at: now, brand: action.brand.trim() }); break; }
    case 'joint': { requireRole(actor, ['Manager']); requireThat(approvedDay(today).contactIds.includes(action.contactId) && nonempty(action.feedback), 'Choose a planned contact and add feedback.'); s.joint.push({ id: id(), date: today, contactId: action.contactId, feedback: action.feedback.trim(), at: now }); break; }
    case 'saveContact': { requireRole(actor, ['Administrator']); const c = action.contact; requireThat(nonempty(c.name) && nonempty(c.patch) && nonempty(c.address) && positiveInt(c.frequency) && c.frequency <= 31 && Number.isFinite(c.latitude) && Math.abs(c.latitude) <= 90 && Number.isFinite(c.longitude) && Math.abs(c.longitude) <= 180, 'Enter a name, patch, address, valid coordinates, and frequency from 1 to 31.'); const index = s.contacts.findIndex(x => x.id === c.id); if (index < 0) s.contacts.push(c); else s.contacts[index] = c; break; }
    case 'saveProduct': { requireRole(actor, ['Administrator']); const p = action.product; requireThat(nonempty(p.name) && nonempty(p.category) && Number.isSafeInteger(p.balance) && p.balance >= 0 && Number.isFinite(p.price) && p.price >= 0 && (!p.materialUrl || /^https:\/\/\S+$/i.test(p.materialUrl)), 'Enter product details, nonnegative stock/price, and an HTTPS material URL if supplied.'); const index = s.products.findIndex(x => x.id === p.id); if (index < 0) s.products.push(p); else s.products[index] = p; break; }
    case 'rates': { requireRole(actor, ['Administrator']); requireThat(Object.values(action.rates).every(v => Number.isFinite(v) && v >= 0), 'Rates must be nonnegative numbers.'); s.rates = action.rates; break; }
    case 'enquiry': { requireRole(actor, ['Visitor']); requireThat(nonempty(action.name) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(action.email) && nonempty(action.message), 'Enter your name, a valid email address, and a message.'); s.enquiries.push({ id: id(), name: action.name.trim(), email: action.email.trim(), message: action.message.trim(), at: now }); break; }
  }
  s.log.unshift({ id: id(), actor, action: action.type, at: now }); return s;
}
export function coverage(s: State, month: string) { const days = s.plans.find(p => p.month === month)?.days ?? []; return s.contacts.filter(c => c.kind === 'Doctor').map(c => ({ ...c, scheduled: days.filter(d => d.contactIds.includes(c.id)).length, completed: s.visits.filter(v => v.contactId === c.id && v.date.startsWith(month) && v.completedAt).length })); }
