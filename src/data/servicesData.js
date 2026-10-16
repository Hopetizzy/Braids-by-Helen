export const SALON_INFO = {
  name: "Braids by Helen",
  tagline: "Your Hair, Our Art.",
  phone: "09010189746",
  whatsappNumber: "2349010189746",
  whatsappDisplay: "0901 018 9746",
  facebook: "BraidsByHelen",
  tiktok: "hair_by_helen01",
  address: "Ibadan, Oyo State (Studio & Home Service)",
  hours: "Monday to Saturday: 8:00 AM to 7:00 PM | Sunday: 1:00 PM to 6:00 PM",
  currency: "₦",
  pricingNote: "Starting rates shown. Braids by Helen confirms final pricing based on hair length, density, and extensions provided."
};

export const SERVICE_CATEGORIES = [
  { id: 'all', name: 'All Services', icon: 'Grid' },
  { id: 'braids', name: 'Knotless & Twists', icon: 'Scissors' },
  { id: 'weaving', name: 'All-back', icon: 'Crown' },
  { id: 'care', name: 'Hair Care & Wash', icon: 'Flower2' },
  { id: 'children', name: "Children's Hair", icon: 'Heart' },
];

export const SERVICES = [
  {
    id: 'short-knotless-twists',
    category: 'braids',
    name: 'Short Knotless Braids / Twists',
    subtitle: 'Neck to shoulder length lightweight protective styling',
    description: 'Clean parting with natural root start to protect edges and eliminate scalp tension. Tailored to neck or shoulder length.',
    duration: '2.5 to 3.5 hrs',
    priceEstimate: 'From ₦5,000',
    popular: true,
    styles: ['Short Knotless Braids', 'Short Passion Twists', 'Bob Length Knotless', 'Short Senegalese Twists'],
    image: '/images/knotless-braids.png',
    tag: 'Popular'
  },
  {
    id: 'long-knotless-twists',
    category: 'braids',
    name: 'Long Knotless Braids / Twists',
    subtitle: 'Mid back to waist length full glam finish',
    description: 'Sleek, flowy knotless braids or twists extending to mid back or waist length. Lightweight feel with flawless weight distribution.',
    duration: '3.5 to 5 hrs',
    priceEstimate: 'From ₦7,000',
    popular: true,
    styles: ['Mid back Knotless', 'Waist Length Knotless', 'Long Passion Twists', 'Long French Curl Knotless'],
    image: '/images/box-braids.png',
    tag: 'Signature'
  },
  {
    id: 'all-back',
    category: 'weaving',
    name: 'All-back Cornrows',
    subtitle: 'Neat straight back cornrow precision',
    description: 'Classic, crisp feed in cornrows directed straight back. Beautiful as a standalone look or protective base for wigs.',
    duration: '1 to 2 hrs',
    priceEstimate: 'From ₦1,500',
    popular: false,
    styles: ['Classic All-back (4 to 6 lines)', 'Neat Micro All-back', 'Stitch All-back', 'Cornrows for Wig Base'],
    image: '/images/ghana-weaving-allback.png',
    tag: 'Quick Style'
  },
  {
    id: 'retouching',
    category: 'care',
    name: 'Retouching',
    subtitle: 'Perimeter refresh and edge maintenance',
    description: 'Revitalize your hairstyle by taking down and redoing the front perimeter and crown lines for a fresh, just styled look.',
    duration: '1 to 1.5 hrs',
    priceEstimate: 'From ₦2,000',
    popular: false,
    styles: ['Front Perimeter Retouch', 'Crown and Edges Refresh', 'Braid Take down and Redo', 'Parting Reneatening'],
    image: '/images/hair-retouching.jpg',
    tag: 'Maintenance'
  },
  {
    id: 'hair-washing',
    category: 'care',
    name: 'Hair Washing',
    subtitle: 'Deep clarifying wash, scalp scrub and conditioning',
    description: 'Invigorating salon shampoo, thorough scalp cleanse, deep conditioning moisture massage, and gentle blow dry preparation.',
    duration: '45 mins to 1 hr',
    priceEstimate: 'From ₦2,000',
    popular: false,
    styles: ['Clarifying Wash and Conditioning', 'Scalp Scrub and Massage', 'Steam Moisture Treatment', 'Wash and Blow dry Prep'],
    image: '/images/hair-washing.jpg',
    tag: 'Essential'
  },
  {
    id: 'children-hairstyles',
    category: 'children',
    name: "Children's Hairstyles",
    subtitle: 'Gentle, pain free, and neat styling for kids',
    description: 'Extra gentle styling crafted specially for sensitive young scalps, adorned with colorful beads and hair accessories.',
    duration: '1.5 to 2.5 hrs',
    priceEstimate: 'From ₦3,000',
    popular: true,
    styles: ['Beaded Natural Cornrows', 'Kids All-back with Beads', 'Puff Balls and Twists', 'Gentle Natural Braids'],
    image: '/images/children-hair.png',
    tag: 'Kids Favorite'
  }
];

export const TIME_SLOTS = {
  morning: [
    { time: '09:00 AM', label: 'Morning Slot 1', available: true },
    { time: '10:30 AM', label: 'Morning Slot 2', available: true },
    { time: '11:45 AM', label: 'Morning Slot 3', available: true },
  ],
  afternoon: [
    { time: '01:00 PM', label: 'Afternoon Slot 1', available: true },
    { time: '02:30 PM', label: 'Afternoon Slot 2', available: true },
    { time: '03:45 PM', label: 'Afternoon Slot 3', available: true },
  ],
  evening: [
    { time: '05:00 PM', label: 'Evening Slot 1', available: true },
    { time: '06:15 PM', label: 'Evening Slot 2', available: true },
  ]
};
