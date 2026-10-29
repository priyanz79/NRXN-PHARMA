import { ImageSourcePropType } from 'react-native';

export const company = {
  name: 'NRXN Pharmaceuticals',
  legalName: 'NRXN Pharmaceutical Pvt. Ltd.',
  officeAddress: 'NRXN Pharmaceuticals Private Limited, Bareilly, Uttar Pradesh',
  phone: '7417299189',
  phoneUri: 'tel:7417299189',
  hero: 'Innovative healthcare solutions improving lives around the world.',
  aboutLead: 'Dedicated to delivering world-class healthcare and pharmaceutical innovation.',
  overview: 'NRXN Pharmaceuticals is a research-driven company focused on creating high-quality, affordable, and effective healthcare products. Our mission is to enhance the quality of life for people across the globe through continuous innovation and dedication.',
  science: 'With a strong foundation in science and technology, we deliver reliable pharmaceutical solutions that meet international standards and patient needs.',
  sourceUrl: 'https://nrxn-pharma.vercel.app/',
};

export const leaders = [
  { name: 'Gaurav Kumar Varshney', role: 'CEO & Co-Founder', image: require('../assets/nrxn/gaurav-varshney.jpg'), bio: 'Under the visionary leadership of Gaurav Kumar Varshney, NRXN Pharmaceuticals has become a trusted name in healthcare innovation. His focus on research excellence, ethical practices, and patient welfare drives our mission forward.' },
  { name: 'Neha Varshney', role: 'Managing Director (MD) & Co-Founder', image: require('../assets/nrxn/neha-varshney.jpg'), bio: 'Neha Varshney brings strategic direction and operational excellence to NRXN Pharmaceuticals. Her leadership ensures sustainable growth and empowers our teams to deliver top-quality healthcare solutions worldwide.' },
] as const;

export const values = [
  { title: 'Patient First', icon: 'heart-outline' as const, description: 'Every product we make is centered on improving patient health and safety.' },
  { title: 'Innovation', icon: 'flask-outline' as const, description: 'We invest in cutting-edge research to bring novel medicines to market.' },
  { title: 'Integrity', icon: 'hand-left-outline' as const, description: 'We uphold the highest ethical standards in everything we do.' },
];

export const heroImage: ImageSourcePropType = require('../assets/nrxn/hero.jpg');
export const officialLogo: ImageSourcePropType = require('../assets/nrxn/official-logo.png');
export const productImages: Record<string, ImageSourcePropType> = {
  'rabistock-dsr': require('../assets/nrxn/rabistock-dsr.jpg'),
  calstock: require('../assets/nrxn/calstock.jpg'),
  'heal-xt': require('../assets/nrxn/heal-xt.jpg'),
  'calstock-d3': require('../assets/nrxn/calstock-d3.jpg'),
  'amibuzz-m': require('../assets/nrxn/amibuzz-m.jpg'),
  'amibuzz-g-300': require('../assets/nrxn/amibuzz-g-300.jpg'),
  'achguard-sp': require('../assets/nrxn/achguard-sp.jpg'),
  'lcbuzz-m': require('../assets/nrxn/lcbuzz-m.jpg'),
  'tamshot-d': require('../assets/nrxn/tamshot-d.jpg'),
  defobest: require('../assets/nrxn/defobest.jpg'),
  'linostock-600': require('../assets/nrxn/linostock-600.jpg'),
  aminomin: require('../assets/nrxn/aminomin.jpg'),
  takeme: require('../assets/nrxn/takeme.jpg'),
};
