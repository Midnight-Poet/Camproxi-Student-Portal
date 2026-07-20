export const LODGES = [
  { id:'l1', name:'Westend Lodge', cat:'Lodges', kind:'lodge', type:'Self-Con', price:220000, unit:'/year', rating:4.8, dist:'0.4 km', badge:'Available', label:'lodge — exterior' },
  { id:'l2', name:'Crystal Heights', cat:'Lodges', kind:'lodge', type:'Flat', price:180000, unit:'/year', rating:4.6, dist:'0.8 km', badge:'Available', label:'lodge — room' },
  { id:'l3', name:'Maple Court', cat:'Lodges', kind:'lodge', type:'Hostel', price:120000, unit:'/year', rating:4.5, dist:'1.2 km', badge:'Few left', label:'lodge — building' },
  { id:'l4', name:'Sunrise Hostel', cat:'Lodges', kind:'lodge', type:'Shared Room', price:90000, unit:'/year', rating:4.3, dist:'1.5 km', badge:'Taken', label:'hostel — block' },
];

export const BUSINESSES = [
  { id:'f1', name:"Mama T's Kitchen", cat:'Food & Drinks', kind:'business', type:'Food & Drinks', rating:4.9, dist:'0.3 km', badge:'Open', cta:'Order Interest', label:'food — meals', menu:[{n:'Jollof Rice & Chicken',p:1800},{n:'Fried Rice & Chicken',p:2500},{n:'Egusi Soup + Swallow',p:2000},{n:'Beef Shawarma',p:2200},{n:'Fruit Smoothie',p:1200}] },
  { id:'f2', name:'Campus Bites', cat:'Food & Drinks', kind:'business', type:'Food & Drinks', rating:4.4, dist:'0.6 km', badge:'Open', cta:'Order Interest', label:'food — snacks', menu:[{n:'Beef Burger',p:2000},{n:'Chicken & Chips',p:2800},{n:'Meat Pie',p:700},{n:'Chapman (bottle)',p:1000}] },
  { id:'g1', name:'FreshMart Mini', cat:'Groceries', kind:'business', type:'Personal Care', rating:4.6, dist:'0.5 km', badge:'Open', cta:'Order Interest', label:'groceries — shelves', menu:[{n:'Indomie (pack of 40)',p:8500},{n:'Eggs (crate)',p:3500},{n:'Rice (5kg)',p:6500},{n:'Milo & Milk combo',p:4200},{n:'Toiletries bundle',p:3000}] },
  { id:'s1', name:'SwiftPrint & Photocopy', cat:'Services', kind:'business', type:'Study & Office', rating:4.7, dist:'0.6 km', badge:'Open', cta:'Schedule', label:'service — print shop', menu:[{n:'B/W print (per page)',p:50},{n:'Color print (per page)',p:150},{n:'Spiral binding',p:500},{n:'Lamination',p:300},{n:'Project printing',p:3500}] },
  { id:'s2', name:'ClipKings Barbershop', cat:'Services', kind:'business', type:'Barbing & Hairdressing', rating:4.8, dist:'0.7 km', badge:'Open', cta:'Schedule', label:'service — barber chair', menu:[{n:'Haircut',p:1500},{n:'Cut + Wash',p:2000},{n:'Beard trim',p:800},{n:'Hair dye',p:2500},{n:'Kids cut',p:1200}] },
];

export const ALL_ITEMS = [...LODGES, ...BUSINESSES];

export const INITIAL_CONVERSATIONS = [
  { id:'c1', name:'Mr. Bayo Adeyemi', listing:'Westend Lodge', kind:'lodge', time:'10:24', unread:2, msgs:[
    { from:'them', t:'Hello! Thanks for your interest in Westend Lodge.', time:'10:20' },
    { from:'them', t:'Yes, the self-contained unit is still available. When would you like to inspect it?', time:'10:24' },
  ]},
  { id:'c2', name:"Mama T's Kitchen", listing:'Food & Drinks', kind:'business', time:'09:05', unread:0, msgs:[
    { from:'me', t:'Hi, can I get the Jollof Rice & Chicken?', time:'08:58' },
    { from:'them', t:'Sure! Your order will be ready in about 15 minutes.', time:'09:05' },
  ]},
  { id:'c3', name:'SwiftPrint & Photocopy', listing:'Services', kind:'business', time:'Yesterday', unread:0, msgs:[
    { from:'me', t:'Sent my project for printing & spiral binding.', time:'Yesterday' },
    { from:'them', t:"We've received your files. Pickup after 2pm.", time:'Yesterday' },
  ]},
];

export const INITIAL_ACTIVITY = [
  { id:'a1', name:'Westend Lodge', type:'Lodges', status:'Pending', when:'2h ago' },
  { id:'a2', name:"Mama T's Kitchen", type:'Food & Drinks', status:'Confirmed', when:'Yesterday' },
  { id:'a3', name:'SwiftPrint & Photocopy', type:'Services', status:'Declined', when:'3d ago' },
];

export const CATEGORIES = [
  { name:'Lodge', icon:'home_work', color:'#12b5a6', bg:'#e2f7f3', count: 48 },
  { name:'Vendor', icon:'restaurant', color:'#7c6cf0', bg:'#ecebfe', count: 32 },
  { name:'Service', icon:'handyman', color:'#6f86f2', bg:'#eaeffe', count: 25 },
];

export function fmt(n) { return '₦' + Number(n).toLocaleString('en-NG'); }

export function catIcon(cat) {
  const map = {
    'Lodge': 'home_work', 'Lodges': 'home_work',
    'Vendor': 'restaurant', 'Vendors': 'restaurant', 'Food & Drinks': 'restaurant',
    'Service': 'handyman', 'Services': 'handyman',
  };
  return map[cat] || 'storefront';
}

export function badgeConfig(badge) {
  const map = { 'Available':['#15a06b','#e3f6ee'], 'Few left':['#bb8500','#fbf1d4'], 'Taken':['#8a909b','#ecedf0'], 'Open':['#15a06b','#e3f6ee'] };
  const [color, bg] = map[badge] || map['Open'];
  return { color, bg };
}

export function statusConfig(status) {
  const s = String(status || '').toUpperCase();
  const map = { 
    'PENDING': ['#bb8500','#fbf1d4'], 
    'ACCEPTED': ['#15a06b','#e3f6ee'], 
    'APPROVED': ['#15a06b','#e3f6ee'], 
    'CONFIRMED': ['#15a06b','#e3f6ee'], 
    'COMPLETED': ['#15a06b','#e3f6ee'], 
    'REJECTED': ['#d05a5a','#fbe9e9'],
    'DECLINED': ['#d05a5a','#fbe9e9'],
    'CANCELLED': ['#8a909b','#ecedf0']
  };
  const [color, bg] = map[s] || map['PENDING'];
  return { color, bg };
}

export function getPrice(item) {
  // Properties (lodges): show annual price + unit
  if (item.kind === 'lodge') return { text: fmt(item.price || 0), sub: item.unit || '/year' };
  // Services: show price + perUnit (e.g. "₦1,500 /hr")
  if (item.kind === 'service') {
    const base = fmt(item.price || 0);
    return { text: base, sub: item.perUnit ? `/${item.perUnit}` : '' };
  }
  // Products: if there's a menu (mock data), use min price; otherwise use item.price from API
  if (item.menu && item.menu.length > 0) {
    const prices = item.menu.map(m => m.p).filter(p => typeof p === 'number' && isFinite(p));
    if (prices.length > 0) return { text: 'from ' + fmt(Math.min(...prices)), sub: '' };
  }
  return { text: fmt(item.price || 0), sub: '' };
}
