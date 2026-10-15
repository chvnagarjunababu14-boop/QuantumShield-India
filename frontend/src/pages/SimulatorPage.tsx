import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Notice, PageHeader } from '../components/ui'

const STEPS = [
  { id: 'today', title: 'Public-key crypto today' },
  { id: 'shor', title: "Shor's algorithm" },
  { id: 'hndl', title: 'Harvest now, decrypt later' },
  { id: 'grover', title: 'Symmetric crypto & Grover' },
  { id: 'pqc', title: 'Post-quantum cryptography' },
] as const
type StepId = (typeof STEPS)[number]['id']

const tooltipStyle = {
  contentStyle: { background: '#0a1428', border: '1px solid #284069', borderRadius: 8, color: '#e2e8f0' },
  labelStyle: { color: '#94a3b8' },
}

/* ---------- Shared animated channel diagram ---------- */

function Party({ name, role, tone }: { name: string; role: string; tone: string }) {
  return (
    <div className="flex w-24 flex-col items-center text-center sm:w-28">
      <div className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-semibold ring-2 ${tone}`}>{name[0]}</div>
      <p className="mt-2 text-sm font-medium text-white">{name}</p>
      <p className="text-xs text-slate-400">{role}</p>
    </div>
  )
}

function Channel({ packet, packetTone, eve, eveText, paused }: { packet: string; packetTone: string; eve: boolean; eveText?: string; paused: boolean }) {
  return (
    <div className="relative flex-1">
      <div className="relative mx-2 h-12">
        <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-sky-500/60 via-slate-500/40 to-teal-500/60" />
        <div
          className={`absolute top-1/2 -translate-y-1/2 rounded-md px-2 py-1 font-mono text-[10px] whitespace-nowrap shadow ${packetTone} ${paused ? 'left-[44%]' : 'animate-travel'}`}
        >
          {packet}
        </div>
      </div>
      {eve && (
        <div className="mt-2 flex flex-col items-center">
          <div className="h-6 w-px border-l border-dashed border-red-400/60" />
          <div className="rounded-lg border border-red-500/40 bg-red-950/40 px-3 py-1.5 text-center text-xs text-red-200">
            <span className="font-semibold">Eve (eavesdropper)</span>
            {eveText && <span className="block text-red-200/80">{eveText}</span>}
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------- Step 1 ---------- */

function TodayStep({ paused }: { paused: boolean }) {
  const [eve, setEve] = useState(false)
  return (
    <div className="space-y-5">
      <p className="text-slate-300">
        When you open a banking website, your browser and the bank perform a <strong>key exchange</strong> (often elliptic-curve
        Diffie-Hellman) and check a <strong>digital signature</strong> (RSA or ECDSA) on the bank&apos;s certificate. The result is a
        shared secret key, which is then used with fast <strong>symmetric</strong> encryption such as AES to protect the session.
      </p>
      <div className="rounded-xl border border-navy-700 bg-navy-850/60 p-5">
        <div className="flex items-start">
          <Party name="Asha" role="Customer browser" tone="bg-sky-500/15 text-sky-300 ring-sky-500/40" />
          <Channel packet="public key + signature" packetTone="bg-sky-500/20 text-sky-200" eve={eve} eveText="Sees public values, cannot derive the secret" paused={paused} />
          <Party name="Bank" role="Web server" tone="bg-teal-500/15 text-teal-300 ring-teal-500/40" />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-300">
        <input type="checkbox" checked={eve} onChange={(e) => setEve(e.target.checked)} className="h-4 w-4 accent-teal-500" />
        Show an eavesdropper on the network
      </label>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ['Public key', 'Shared openly. Anyone can use it to verify signatures or start a key exchange.'],
          ['Private key', 'Kept secret. Deriving it from the public key is believed to be infeasible for classical computers.'],
          ['Hard problem', 'RSA relies on factoring large numbers; elliptic-curve crypto relies on the discrete-logarithm problem.'],
        ].map(([t, d]) => (
          <div key={t} className="rounded-lg border border-navy-700 bg-navy-850/40 p-3">
            <p className="text-sm font-medium text-white">{t}</p>
            <p className="mt-1 text-xs text-slate-400">{d}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- Step 2: toy period finding ---------- */

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
function modPow(base: number, exp: number, mod: number) {
  let result = 1
  let b = base % mod
  let e = exp
  while (e > 0) {
    if (e & 1) result = (result * b) % mod
    b = (b * b) % mod
    e >>= 1
  }
  return result
}

const TOY_N = [15, 21, 33, 35, 39, 51, 55, 77, 91]

function ShorStep() {
  const [n, setN] = useState(15)
  const [a, setA] = useState(7)
  const bases = useMemo(() => Array.from({ length: n - 2 }, (_, i) => i + 2), [n])

  const analysis = useMemo(() => {
    const common = gcd(a, n)
    if (common !== 1) return { kind: 'lucky' as const, common }
    const seq: { x: number; value: number }[] = []
    let r = 0
    for (let x = 0; x < 60; x++) {
      const v = modPow(a, x, n)
      seq.push({ x, value: v })
      if (x > 0 && v === 1 && r === 0) r = x
    }
    const shown = seq.slice(0, Math.min(seq.length, Math.max(3 * r + 1, 12)))
    if (r % 2 === 1) return { kind: 'odd' as const, r, seq: shown }
    const half = modPow(a, r / 2, n)
    if (half === n - 1) return { kind: 'trivial' as const, r, seq: shown }
    return { kind: 'ok' as const, r, seq: shown, half, p: gcd(half - 1, n), q: gcd(half + 1, n) }
  }, [a, n])

  const growth = useMemo(
    () =>
      [256, 512, 1024, 2048, 3072, 4096].map((bits) => {
        const lnN = bits * Math.LN2
        const gnfs = 1.923 * Math.cbrt(lnN) * Math.cbrt(Math.log(lnN)) ** 2
        return {
          bits,
          classical: +(gnfs / Math.LN10).toFixed(1),
          quantum: +Math.log10(bits ** 3).toFixed(1),
        }
      }),
    [],
  )

  return (
    <div className="space-y-5">
      <p className="text-slate-300">
        In 1994 Peter Shor showed that a quantum computer could factor integers and compute discrete logarithms efficiently. The
        quantum part finds the <strong>period</strong> of the function <code className="text-sky-300">a<sup>x</sup> mod N</code>; ordinary
        arithmetic then turns that period into the factors of N. This breaks RSA, elliptic-curve and Diffie-Hellman cryptography
        <em> on a sufficiently capable, fault-tolerant quantum computer</em>. Such machines do not exist today.
      </p>

      <Notice tone="info">
        <strong>Educational walkthrough:</strong> the period below is found by ordinary step-by-step computation in your browser, using
        tiny numbers. No quantum computer is simulated and no real encryption is attacked. Real RSA moduli have over 600 decimal digits.
      </Notice>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block text-slate-400">Toy modulus N (= p x q)</span>
          <select
            value={n}
            onChange={(e) => {
              const next = Number(e.target.value)
              setN(next)
              setA(2)
            }}
            className="w-full rounded-lg border border-navy-600 bg-navy-850 px-3 py-2"
          >
            {TOY_N.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-slate-400">Random base a</span>
          <select value={a} onChange={(e) => setA(Number(e.target.value))} className="w-full rounded-lg border border-navy-600 bg-navy-850 px-3 py-2">
            {bases.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </label>
      </div>

      {analysis.kind === 'lucky' ? (
        <Notice tone="success">
          gcd({a}, {n}) = {analysis.common}, which already reveals a factor - a lucky guess that needs no quantum step. Try another base.
        </Notice>
      ) : (
        <>
          <div className="rounded-xl border border-navy-700 bg-navy-850/60 p-4">
            <p className="mb-2 text-sm text-slate-300">
              Values of {a}<sup>x</sup> mod {n}: the pattern repeats every <strong className="text-teal-300">r = {analysis.r}</strong> steps.
            </p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analysis.seq} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1b2e52" />
                  <XAxis dataKey="x" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip {...tooltipStyle} formatter={(v) => [v, `${a}^x mod ${n}`]} labelFormatter={(x) => `x = ${x}`} />
                  <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                    {analysis.seq.map((d) => (
                      <Cell key={d.x} fill={d.x % analysis.r === 0 ? '#2dd4bf' : '#38bdf8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          {analysis.kind === 'ok' && (
            <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-300">
              <li>Period r = {analysis.r} (this is the step a quantum computer would accelerate).</li>
              <li>
                Compute {a}<sup>r/2</sup> mod {n} = {analysis.half}.
              </li>
              <li>
                gcd({analysis.half} - 1, {n}) = <strong className="text-teal-300">{analysis.p}</strong> and gcd({analysis.half} + 1, {n}) ={' '}
                <strong className="text-teal-300">{analysis.q}</strong>.
              </li>
              <li>
                Factors found: {n} = {analysis.p} x {analysis.q}. With the factors, an RSA private key can be reconstructed.
              </li>
            </ol>
          )}
          {analysis.kind === 'odd' && <Notice tone="warn">The period r = {analysis.r} is odd, so this base does not help. Shor&apos;s algorithm simply retries with another random a.</Notice>}
          {analysis.kind === 'trivial' && (
            <Notice tone="warn">
              Here a<sup>r/2</sup> = -1 mod N, which only yields trivial factors. The algorithm retries with another random a.
            </Notice>
          )}
        </>
      )}

      <div className="rounded-xl border border-navy-700 bg-navy-850/60 p-4">
        <p className="text-sm font-medium text-white">Why bigger RSA keys do not solve the problem</p>
        <p className="mb-2 text-xs text-slate-400">
          Illustrative growth of work (log<sub>10</sub> scale, constants and error-correction overhead ignored, not a time estimate):
          the best known classical factoring method grows sub-exponentially, while Shor&apos;s algorithm grows polynomially.
        </p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={growth} margin={{ top: 5, right: 15, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1b2e52" />
              <XAxis dataKey="bits" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'RSA modulus size (bits)', fill: '#64748b', fontSize: 11, position: 'insideBottom', offset: -2 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="classical" name="Classical (GNFS, illustrative)" stroke="#2dd4bf" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="quantum" name="Shor (polynomial, illustrative)" stroke="#f87171" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

/* ---------- Step 3: HNDL ---------- */

function HndlStep() {
  const [stage, setStage] = useState(0)
  const stages = [
    { label: 'Today', title: 'Encrypted traffic is captured', text: 'An adversary records encrypted traffic or steals encrypted archives. Without a quantum computer it cannot read them.' },
    { label: 'Storage', title: 'Data is kept for later', text: 'Storage is cheap. Recorded key exchanges and ciphertext can be retained for many years.' },
    { label: 'Future', title: 'If a capable quantum computer becomes available', text: "Shor's algorithm could recover keys from the recorded RSA/ECC key exchanges and decrypt the stored data." },
    { label: 'Impact', title: 'Long-lived secrets are exposed', text: 'Health records, identity data, state secrets or financial records that must stay confidential for 10+ years are most at risk.' },
  ]
  return (
    <div className="space-y-5">
      <p className="text-slate-300">
        The quantum threat to confidentiality starts <em>before</em> a quantum computer exists. This is why the risk engine weighs the
        <strong> required confidentiality period</strong> of the data. Nobody can reliably predict when, or whether, a cryptographically
        relevant quantum computer will be built; this tool does not assume a date.
      </p>
      <ol className="grid gap-3 md:grid-cols-4">
        {stages.map((s, i) => (
          <li key={s.label}>
            <button
              type="button"
              onClick={() => setStage(i)}
              aria-pressed={stage === i}
              className={`h-full w-full rounded-xl border p-4 text-left transition-all ${
                i <= stage ? 'border-teal-500/50 bg-teal-500/5' : 'border-navy-700 bg-navy-850/40 opacity-60'
              }`}
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
                {i + 1}. {s.label}
              </span>
              <span className="mt-1 block text-sm font-medium text-white">{s.title}</span>
              {i <= stage && <span className="mt-2 block text-xs text-slate-400">{s.text}</span>}
            </button>
          </li>
        ))}
      </ol>
      <div className="flex gap-2">
        <button type="button" className="btn btn-secondary" onClick={() => setStage((s) => Math.max(0, s - 1))} disabled={stage === 0}>
          Previous
        </button>
        <button type="button" className="btn btn-primary" onClick={() => setStage((s) => Math.min(stages.length - 1, s + 1))} disabled={stage === stages.length - 1}>
          Next stage
        </button>
      </div>
      <Notice tone="info">
        Rule of thumb (Mosca&apos;s inequality): if <em>how long data must stay secret</em> plus <em>how long migration takes</em> exceeds the time
        until a capable quantum computer exists, that data is at risk. Because the last term is uncertain, start with the first two.
      </Notice>
    </div>
  )
}

/* ---------- Step 4: Grover ---------- */

function GroverStep() {
  const [bits, setBits] = useState(128)
  const data = [
    { name: 'Classical brute force', value: bits, fill: '#2dd4bf' },
    { name: "Grover (idealised)", value: bits / 2, fill: '#facc15' },
  ]
  const verdict =
    bits >= 256 ? 'Comfortable margin even against idealised Grover search.' : bits >= 128 ? 'Still considered strong today; 256-bit keys are recommended for very long-lived data.' : 'Too short - weak against classical attacks already.'
  return (
    <div className="space-y-5">
      <p className="text-slate-300">
        Symmetric ciphers like AES and hash functions like SHA-256 are <strong>not</strong> broken by Shor&apos;s algorithm. The best known
        generic quantum attack is <strong>Grover&apos;s algorithm</strong>, which at most gives a quadratic speed-up for key search - roughly halving
        the effective key length. In practice it is even less effective because it parallelises poorly and needs very long error-corrected
        computations. That is why the risk engine treats AES differently from RSA and elliptic-curve cryptography.
      </p>
      <label className="block text-sm">
        <span className="mb-1 flex justify-between text-slate-400">
          <span>Symmetric key length</span>
          <span className="font-mono text-teal-300">{bits} bits</span>
        </span>
        <input type="range" min={64} max={256} step={64} value={bits} onChange={(e) => setBits(Number(e.target.value))} className="w-full accent-teal-500" aria-valuetext={`${bits} bits`} />
        <span className="flex justify-between text-xs text-slate-500">
          <span>64</span><span>128</span><span>192</span><span>256</span>
        </span>
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-48 rounded-xl border border-navy-700 bg-navy-850/60 p-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1b2e52" />
              <XAxis type="number" domain={[0, 256]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={140} tick={{ fill: '#cbd5e1', fontSize: 11 }} />
              <Tooltip {...tooltipStyle} formatter={(v) => [`~${v} bits`, 'Effective security']} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {data.map((d) => (
                  <Cell key={d.name} fill={d.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl border border-navy-700 bg-navy-850/60 p-4 text-sm">
          <p className="text-slate-400">Approximate effective security</p>
          <p className="mt-1 text-2xl font-semibold text-white">~{bits / 2}-bit <span className="text-sm font-normal text-slate-400">against idealised Grover</span></p>
          <p className="mt-3 text-slate-300">{verdict}</p>
          <p className="mt-3 text-xs text-slate-500">Simplified model for education; real-world estimates also depend on hardware, parallelism and error correction.</p>
        </div>
      </div>
    </div>
  )
}

/* ---------- Step 5: PQC ---------- */

function PqcStep({ paused }: { paused: boolean }) {
  const [mode, setMode] = useState<'classical' | 'pqc'>('pqc')
  const pqc = mode === 'pqc'
  return (
    <div className="space-y-5">
      <p className="text-slate-300">
        Post-quantum cryptography (PQC) uses mathematical problems for which no efficient quantum algorithm is known, such as problems on
        structured <strong>lattices</strong> or the security of <strong>hash functions</strong>. It runs on ordinary computers - no quantum hardware
        needed. NIST published the first standards in 2024: <strong>ML-KEM</strong> (FIPS 203) for key establishment, <strong>ML-DSA</strong> (FIPS
        204) and <strong>SLH-DSA</strong> (FIPS 205) for digital signatures.
      </p>

      <div role="radiogroup" aria-label="Key exchange type" className="inline-flex rounded-lg border border-navy-600 p-1">
        {(['classical', 'pqc'] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={mode === m}
            onClick={() => setMode(m)}
            className={`rounded-md px-3 py-1.5 text-sm ${mode === m ? 'bg-teal-500 text-navy-950' : 'text-slate-300 hover:text-white'}`}
          >
            {m === 'classical' ? 'Classical (ECDH)' : 'Hybrid (X25519 + ML-KEM)'}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-navy-700 bg-navy-850/60 p-5">
        <div className="flex items-start">
          <Party name="Asha" role="Customer" tone="bg-sky-500/15 text-sky-300 ring-sky-500/40" />
          <Channel
            packet={pqc ? 'X25519 + ML-KEM ciphertext' : 'ECDH public key'}
            packetTone={pqc ? 'bg-emerald-500/20 text-emerald-200' : 'bg-sky-500/20 text-sky-200'}
            eve
            eveText={pqc ? 'Future quantum computer: no known efficient attack on ML-KEM' : "Future quantum computer: Shor's algorithm recovers the key"}
            paused={paused}
          />
          <Party name="Bank" role="Server" tone="bg-teal-500/15 text-teal-300 ring-teal-500/40" />
        </div>
      </div>

      <div className="flex items-end justify-center gap-1" aria-hidden="true">
        {Array.from({ length: 24 }, (_, i) => (
          <span
            key={i}
            className={`w-2 rounded-t ${pqc ? 'bg-emerald-400/70' : 'bg-sky-400/70'} ${paused ? '' : 'animate-wave'}`}
            style={{ height: `${16 + ((i * 37) % 30)}px`, animationDelay: `${(i % 8) * 0.12}s` }}
          />
        ))}
      </div>
      <p className="text-center text-xs text-slate-500">Visual metaphor only - lattice-based schemes hide secrets behind small random &ldquo;noise&rdquo;.</p>

      <Notice tone="info">
        <strong>Hybrid mode</strong> combines a classical and a post-quantum algorithm, so the connection stays secure as long as either one holds.
        Major browsers and TLS libraries already support hybrid key exchange. Always use maintained, standardised implementations - never
        build cryptography yourself.
      </Notice>
    </div>
  )
}

/* ---------- Comparison ---------- */

const COMPARISON = [
  ['Examples', 'RSA, ECDSA, ECDH, X25519, Diffie-Hellman', 'ML-KEM, ML-DSA, SLH-DSA (FN-DSA forthcoming)'],
  ['Hard problem', 'Factoring, discrete logarithms', 'Lattice problems (Module-LWE), hash-function security'],
  ["Shor's algorithm", 'Breaks it on a capable fault-tolerant quantum computer', 'No known efficient quantum attack'],
  ['Key / signature size', 'Small (32 B - 512 B typical)', 'Larger (roughly 1 KB - several KB; SLH-DSA signatures larger)'],
  ['Maturity', 'Decades of deployment', 'Standardised 2024; deployment ramping up'],
  ['Runs on', 'Ordinary computers', 'Ordinary computers (no quantum hardware needed)'],
]

export default function SimulatorPage() {
  const [step, setStep] = useState<StepId>('today')
  const [paused, setPaused] = useState(false)
  const index = STEPS.findIndex((s) => s.id === step)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quantum Threat Simulator"
        subtitle="An interactive, educational explanation of why quantum computing matters for cryptography. This is a teaching aid - it does not run a quantum computer or attack real encryption."
        actions={
          <button type="button" className="btn btn-secondary" onClick={() => setPaused((p) => !p)} aria-pressed={paused}>
            {paused ? 'Resume animations' : 'Pause animations'}
          </button>
        }
      />

      <nav aria-label="Simulator steps" className="flex flex-wrap gap-2">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStep(s.id)}
            aria-current={step === s.id ? 'step' : undefined}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${
              step === s.id ? 'border-teal-400 bg-teal-500/10 text-teal-200' : 'border-navy-600 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${i <= index ? 'bg-teal-500 text-navy-950' : 'bg-navy-700'}`}>{i + 1}</span>
            {s.title}
          </button>
        ))}
      </nav>

      <section className="card" aria-live="polite">
        <h2 className="mb-4 text-lg font-semibold text-white">
          {index + 1}. {STEPS[index].title}
        </h2>
        {step === 'today' && <TodayStep paused={paused} />}
        {step === 'shor' && <ShorStep />}
        {step === 'hndl' && <HndlStep />}
        {step === 'grover' && <GroverStep />}
        {step === 'pqc' && <PqcStep paused={paused} />}
        <div className="mt-6 flex justify-between border-t border-navy-700 pt-4">
          <button type="button" className="btn btn-secondary" disabled={index === 0} onClick={() => setStep(STEPS[index - 1].id)}>
            &larr; Previous
          </button>
          <button type="button" className="btn btn-primary" disabled={index === STEPS.length - 1} onClick={() => setStep(STEPS[index + 1].id)}>
            Next &rarr;
          </button>
        </div>
      </section>

      <section className="card overflow-x-auto">
        <h2 className="mb-3 font-medium text-white">Conventional vs post-quantum public-key cryptography</h2>
        <table className="w-full min-w-[640px]">
          <thead className="bg-navy-850">
            <tr>
              <th className="table-th w-40">Aspect</th>
              <th className="table-th">Conventional (RSA / ECC)</th>
              <th className="table-th">Post-quantum (standardised)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-700">
            {COMPARISON.map(([aspect, conv, pqc]) => (
              <tr key={aspect}>
                <th scope="row" className="table-td text-left font-medium text-slate-200">{aspect}</th>
                <td className="table-td text-slate-300">{conv}</td>
                <td className="table-td text-emerald-200">{pqc}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-xs text-slate-500">
          Symmetric algorithms (AES-256) and modern hashes (SHA-256/384, SHA-3) remain in use alongside PQC; they are not replaced by it.
        </p>
      </section>
    </div>
  )
}
