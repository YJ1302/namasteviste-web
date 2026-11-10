import React from 'react';

/* Precise line-art mandala with Indian motif medallions (Taj Mahal,
   elephant, namaste). Every stroke has pathLength="1" so variants can
   "draw" it in with a single stroke-dashoffset animation. */

const n2 = (v) => +v.toFixed(2);

function Ring({ n, offset = 0, children }) {
  return Array.from({ length: n }, (_, i) => (
    <g key={i} transform={`rotate(${n2((360 / n) * i + offset)})`}>{children}</g>
  ));
}

// Pointed lotus petal (ogee arch) from radius r0 to tip at r1
function petal(r0, r1, w) {
  const h = r1 - r0;
  return `M ${n2(-w)} ${-r0} C ${n2(-w * 1.08)} ${n2(-(r0 + h * 0.55))}, ${n2(-w * 0.12)} ${n2(-(r1 - h * 0.2))}, 0 ${-r1} `
    + `C ${n2(w * 0.12)} ${n2(-(r1 - h * 0.2))}, ${n2(w * 1.08)} ${n2(-(r0 + h * 0.55))}, ${n2(w)} ${-r0}`;
}

function square(r) {
  return [0, 1, 2, 3].map((i) => {
    const a = (Math.PI / 2) * i - Math.PI / 2;
    return `${n2(Math.cos(a) * r)},${n2(Math.sin(a) * r)}`;
  }).join(' ');
}

const C = (props) => <circle pathLength="1" {...props} />;
const P = (props) => <path pathLength="1" {...props} />;

const W = { frame: 1.6, main: 1.2, fine: 0.7, motif: 1.15 };
const half = (r, n) => r * Math.sin(Math.PI / n);

// Rotates a layer around the mandala's exact centre (0,0 in user space).
function Spin({ dur, reverse = false, children }) {
  const still = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return (
    <g>
      {!still && (
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 0 0"
          to={`${reverse ? -360 : 360} 0 0`}
          dur={dur}
          repeatCount="indefinite"
        />
      )}
      {children}
    </g>
  );
}

/* ---------- motifs (drawn upright in a ~60×60 box around 0,0) ---------- */

function TajMahal() {
  return (
    <g strokeWidth={W.motif}>
      <P d="M -30 26 H 30 M -27 26 V 20 H 27 V 26" />
      <P d="M -16 20 V 1 H 16 V 20" />
      <P d="M -6 20 V 10 Q 0 3 6 10 V 20" />
      <P d="M -13 13 V 7 Q -11 4 -9 7 V 13 M 9 13 V 7 Q 11 4 13 7 V 13" />
      <P d="M -12 1 C -15 -9, -6 -13, 0 -21 C 6 -13, 15 -9, 12 1" />
      <P d="M 0 -21 V -28" />
      <C cy="-29.5" r="1.5" strokeWidth={W.fine} />
      <P d="M -25 20 V -6 M -21.5 20 V -6 M -26.5 -6 Q -23.25 -13 -20 -6 Z" />
      <P d="M 21.5 20 V -6 M 25 20 V -6 M 20 -6 Q 23.25 -13 26.5 -6 Z" />
    </g>
  );
}

function Elephant() {
  return (
    <g strokeWidth={W.motif}>
      <P d="M -20 8 C -27 -6, -16 -16, -2 -16 C 8 -16, 12 -14, 14 -12 C 21 -14, 27 -8, 26 0 C 25 6, 24 10, 25 15 C 26 19, 29 20, 30 17" />
      <P d="M 19 3 C 18 9, 19 15, 21 19 C 23 22, 28 22, 30 17" />
      <P d="M 8 6 V 21 H 14 V 8 M -20 6 V 21 H -14 V 8" />
      <P d="M -14 9 Q -3 12 8 9" />
      <P d="M 11 -11 C 3 -9, 3 3, 12 4" />
      <P d="M -11 -16 V 1 Q -7 5 -3 1 Q 1 5 5 1 V -15 M -11 -10 H 5" />
      <P d="M -21 -2 Q -26 2 -25 9" />
      <P d="M 19 5 Q 23 9 27 8" />
      <circle cx="19" cy="-6" r="1.3" fill="currentColor" stroke="none" />
    </g>
  );
}

function Namaste() {
  return (
    <g strokeWidth={W.motif}>
      <P d="M 0 -26 C -4 -24, -7 -16, -8 -6 C -9 2, -12 8, -16 14 L -10 22 C -6 18, -2 14, 0 10" />
      <P d="M 0 -26 C 4 -24, 7 -16, 8 -6 C 9 2, 12 8, 16 14 L 10 22 C 6 18, 2 14, 0 10" />
      <P d="M 0 -26 V 10" />
      <P d="M -4 -4 C -6 0, -6 4, -3 6 M 4 -4 C 6 0, 6 4, 3 6" />
      <P d="M -18 17 L -12 25 M -20 20 L -14 28 M 18 17 L 12 25 M 20 20 L 14 28" />
      <P d="M 0 -30 V -35 M -8 -28 L -11 -32 M 8 -28 L 11 -32 M -14 -23 L -18 -25 M 14 -23 L 18 -25" />
    </g>
  );
}

const MOTIFS = [TajMahal, Elephant, Namaste, Elephant];

function Medallion({ Motif, mirror }) {
  return (
    <g transform="translate(0 -286)">
      <C r="50" strokeWidth={W.main} />
      <C r="44" strokeWidth={W.fine} />
      <Ring n={16} offset={11.25}><circle cy="-47" r="1.2" fill="currentColor" stroke="none" /></Ring>
      <g transform={mirror ? 'scale(-1 1)' : undefined}><Motif /></g>
    </g>
  );
}

function MandalaArt() {
  return (
    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      {/* frame + dial ticks */}
      <C r="492" strokeWidth={W.frame} />
      <C r="484" strokeWidth={W.fine} />
      <Ring n={96}>
        <line pathLength="1" x1="0" y1="-462" x2="0" y2="-476" strokeWidth={W.fine} />
      </Ring>
      <Ring n={24}>
        <line pathLength="1" x1="0" y1="-452" x2="0" y2="-478" strokeWidth={W.main} />
        <circle cy="-488" r="2" fill="currentColor" stroke="none" />
      </Ring>
      <C r="448" strokeWidth={W.main} />

      {/* outer lotus crown, 32 petals with a dot between each */}
      <Ring n={32}>
        <P d={petal(372, 444, half(372, 32))} strokeWidth={W.main} />
        <P d={petal(372, 424, half(372, 32) * 0.5)} strokeWidth={W.fine} />
        <P d={petal(372, 400, half(372, 32) * 0.18)} strokeWidth={W.fine} />
      </Ring>
      <Ring n={32} offset={5.625}><circle cy="-440" r="2.2" fill="currentColor" stroke="none" /></Ring>
      <C r="372" strokeWidth={W.frame} />
      <C r="364" strokeWidth={W.fine} />
      <Ring n={64}><C cy="-352" r="3" strokeWidth={W.fine} /></Ring>
      <C r="340" strokeWidth={W.fine} />

      {/* motif band: 8 layered petals alternating with medallions — turns gently backwards */}
      <Spin dur="180s" reverse>
        <Ring n={8}>
          <P d={petal(232, 336, 40)} strokeWidth={W.main} />
          <P d={petal(232, 314, 27)} strokeWidth={W.fine} />
          <P d={petal(232, 290, 14)} strokeWidth={W.fine} />
          <circle cy="-322" r="2.4" fill="currentColor" stroke="none" />
        </Ring>
        {MOTIFS.concat(MOTIFS).map((Motif, i) => (
          <g key={i} transform={`rotate(${22.5 + i * 45})`}>
            <Medallion Motif={Motif} mirror={i % 4 === 3} />
          </g>
        ))}
      </Spin>
      <C r="232" strokeWidth={W.frame} />
      <C r="224" strokeWidth={W.fine} />

      {/* interlaced eight-point star — turns slowly forwards */}
      <Spin dur="120s">
        <polygon pathLength="1" points={square(214)} strokeWidth={W.main} />
        <polygon pathLength="1" points={square(214)} transform="rotate(45)" strokeWidth={W.main} />
        <C r="166" strokeWidth={W.fine} />
        <Ring n={8}><circle cy="-214" r="3" fill="currentColor" stroke="none" /></Ring>
      </Spin>

      {/* lace scallops */}
      <C r="152" strokeWidth={W.fine} />
      <Ring n={24}>
        <P d="M -19.85 -152 A 20 20 0 0 0 19.85 -152" strokeWidth={W.fine} />
      </Ring>

      {/* inner flower, 12 petals */}
      <Ring n={12}>
        <P d={petal(86, 128, half(86, 12) * 1.1)} strokeWidth={W.main} />
        <P d={petal(86, 112, half(86, 12) * 0.5)} strokeWidth={W.fine} />
      </Ring>
      <C r="86" strokeWidth={W.frame} />

      {/* centre */}
      <Ring n={24}>
        <line pathLength="1" x1="0" y1="-48" x2="0" y2="-76" strokeWidth={W.fine} />
      </Ring>
      <C r="44" strokeWidth={W.main} />
      <Ring n={8}><P d={petal(8, 38, 7)} strokeWidth={W.fine} /></Ring>
      <C r="8" strokeWidth={W.main} />
      <circle r="3.5" fill="currentColor" stroke="none" />
    </g>
  );
}

/**
 * Rotating mandala. Variants are styled in CSS by `.mandala-<variant>`.
 */
export default function Mandala({ variant = 'page' }) {
  return (
    <div className={`mandala mandala-${variant}`} aria-hidden="true">
      <svg className="mandala-svg mandala-spin" viewBox="-500 -500 1000 1000" xmlns="http://www.w3.org/2000/svg">
        <MandalaArt />
      </svg>
    </div>
  );
}
