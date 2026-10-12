import { createHash } from 'node:crypto';

export const SUPPLY = 256;
export const CONTENT_BUDGET = 960; // conservative: docs say roughly 960 bytes of Quark content
export const VERSION = 'QG1';
export const digest = (x) => createHash('sha256').update(x).digest('hex');
export const svgBytes = (s) => Buffer.byteLength(s, 'utf8');
const colors = [
  { name:'GHOST', bg:'#060c12', body:'#13232b', line:'#69ebdb', light:'#bdfcf4', accent:'#f8c56f' },
  { name:'EMBER', bg:'#10090b', body:'#291518', line:'#f07472', light:'#ffe2c9', accent:'#ffca69' },
  { name:'PHANTOM', bg:'#0a0813', body:'#231a35', line:'#b38cff', light:'#f4deff', accent:'#e5a5fd' },
  { name:'SIGNAL', bg:'#061016', body:'#102b34', line:'#54b9ff', light:'#d3f5ff', accent:'#55ffac' },
  { name:'OBSIDIAN', bg:'#0c0d0f', body:'#24282c', line:'#d2d8dd', light:'#fff3d7', accent:'#f6d47f' },
  { name:'VIRIDIAN', bg:'#07120d', body:'#173223', line:'#74edac', light:'#d6fce4', accent:'#efe3a1' }
];
const maskPaths = [
  'M24 28 42 17 82 17 100 28 101 87 84 107 40 107 23 87Z',
  'M27 18H97L110 48 94 100 64 110 34 100 18 48Z',
  'M20 34 35 17H93L108 34V83L91 108H37L20 83Z',
  'M28 18 64 10 100 18 111 52 89 109H39L17 52Z',
  'M22 24H106V88L89 108H39L22 88Z',
  'M33 16H95L110 40 99 96 64 113 29 96 18 40Z'
];
const eyes = [
  '<rect x="35" y="54" width="21" height="8"/><rect x="72" y="54" width="21" height="8"/>',
  '<path d="M35 61 47 49 59 61M69 61 81 49 93 61" fill="none" stroke="@" stroke-width="5"/>',
  '<rect x="35" y="51" width="23" height="11"/><rect x="70" y="51" width="23" height="11"/><path d="M45 51v11m37-11v11" stroke="#080a0d" stroke-width="3"/>',
  '<path d="M35 56h24m10 0h24" stroke="@" stroke-width="9"/><path d="M45 50v12m38-12v12" stroke="#080a0d" stroke-width="3"/>',
  '<path d="m36 62 21-12m14 0 21 12" fill="none" stroke="@" stroke-width="7"/>',
  '<rect x="36" y="51" width="21" height="12" rx="5"/><rect x="71" y="51" width="21" height="12" rx="5"/>',
];
const mouths = [
  '<path d="M48 84h32"/>',
  '<path d="m46 82 18 9 18-9"/>',
  '<path d="M49 82h30m-25 7h20"/>',
  '<rect x="50" y="80" width="28" height="8"/>',
  '<path d="M53 85h22m-11-7v14"/>',
  '<path d="M45 81h38l-8 11H53Z"/>',
];
export function derive(block, edition, genesis='quantus-mainnet') {
  if (!Number.isInteger(edition) || edition < 1 || edition > SUPPLY) throw Error('edition must be 1..256');
  if (!block || !Number.isSafeInteger(block.height) || block.height<0 || !/^(0x)?[a-f0-9]{64}$/i.test(block.hash)) throw Error('invalid finalized block');
  const hash = block.hash.toLowerCase().replace(/^0x/, '');
  const dna = digest(`QUANT//GENESIS|${VERSION}|${genesis}|${block.height}|${hash}|${edition}`);
  const b = Buffer.from(dna, 'hex');
  const ones = [...Buffer.from(hash, 'hex')].reduce((n,v)=>n+v.toString(2).replace(/0/g,'').length,0);
  const leadingZeros = (hash.match(/^0*/)?.[0]?.length ?? 0);
  const palette = b[0]%colors.length;
  const shape = b[1]%maskPaths.length;
  const eye = b[2]%eyes.length;
  const mouth = b[3]%mouths.length;
  const halo = b[4]%4;
  const crown = b[5]%6;
  const glitch = (b[6] ^ parseInt(hash.slice(0,2),16))%5;
  const lattice = b[7]%4;
  const rarity = Math.min(99, 5 + leadingZeros*20 + (ones < 115 || ones > 142 ? 14 : 0) + (crown===5 ? 12 : 0) + (glitch===4 ? 7 : 0));
  return { edition, blockHeight:block.height, blockHash:hash, dna, metrics:{ones,leadingZeros,hashEdge:hash.slice(0,8),xor:b[6]^b[7]}, traits:{palette:colors[palette].name,shape,eye,mouth,halo,crown,glitch,lattice}, values:{palette,shape,eye,mouth,halo,crown,glitch,lattice}, rarity };
}
export function render(d) {
  const v=d.values, c=colors[v.palette];
  const halo=[ '', `<circle cx="64" cy="63" r="54" fill="none" stroke="${c.line}" opacity=".3"/>`, `<path d="M9 35H119M9 93H119" opacity=".4"/>`, `<circle cx="64" cy="63" r="57" fill="none" stroke="${c.line}" stroke-dasharray="3 9" opacity=".5"/>`][v.halo];
  const crown=[ '', '<path d="M38 21v-9h52v9"/>','<path d="M32 22 42 9 64 20 86 9 96 22"/>','<path d="M45 14h38m-19-9v9"/>','<path d="M28 20 44 7 64 17 84 7 100 20"/>','<path d="M42 13 64 3 86 13"/>'][v.crown];
  const glitch=v.glitch===4?`<path d="M12 38h26m53 48h25" stroke="${c.accent}" stroke-width="4"/>`:v.glitch>1?`<path d="M12 43h17m71 35h16" stroke="${c.accent}" stroke-width="3"/>`:'';
  const lattice=v.lattice===3?'<path d="M16 112h96m-80-5-12 12m76-12 12 12" opacity=".4"/>':v.lattice===2?'<path d="M13 11h22m58 0h22M13 117h22m58 0h22" opacity=".45"/>':'';
  const eye=eyes[v.eye].replaceAll('@',c.light);
  const mouth=mouths[v.mouth];
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" fill="${c.bg}"/><g fill="none" stroke="${c.line}" stroke-width="2">${halo}${lattice}${crown}<path d="${maskPaths[v.shape]}" fill="${c.body}" stroke-width="3"/>${glitch}</g><g fill="${c.light}">${eye}</g><g fill="none" stroke="${c.accent}" stroke-width="3">${mouth}</g><path d="M15 10h12M10 10v12M101 10h12m5 0v12M10 106v12h12m96-12v12h-12" fill="none" stroke="${c.line}" opacity=".6"/><desc>${VERSION}:${d.edition}:${d.blockHeight}</desc></svg>`;
  if (svgBytes(svg)>CONTENT_BUDGET) throw Error(`SVG exceeded ${CONTENT_BUDGET} bytes: ${svgBytes(svg)}`);
  return svg;
}
export function artwork(block, edition, genesis) {
  const data=derive(block,edition,genesis), svg=render(data);
  return { ...data, svg, bytes:svgBytes(svg), sha256:digest(svg), contentType:'image/svg+xml', contentHex:'0x'+Buffer.from(svg,'utf8').toString('hex') };
}
