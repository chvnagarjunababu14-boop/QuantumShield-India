import { Notice, PageHeader } from '../components/ui'

const STATUS_RULES = [
  ['RSA, elliptic-curve (ECDSA, ECDH, X25519, Ed25519), finite-field DH / DSA', 'Quantum-vulnerable', "Broken by Shor's algorithm on a sufficiently capable fault-tolerant quantum computer. RSA below 2048 bits is additionally flagged as classically weak."],
  ['AES-256, ChaCha20', 'Low concern', "Grover's algorithm gives at most a quadratic speed-up; 256-bit keys keep a comfortable margin."],
  ['AES-128 or AES with unknown key size', 'Reduced margin', 'Not broken; 256-bit keys recommended for data that must stay confidential for many years.'],
  ['SHA-256/384/512, SHA-3, BLAKE2/3, HMAC-SHA-2, bcrypt/Argon2/scrypt/PBKDF2', 'Low concern', 'Hashes are assessed separately from public-key crypto; no known structural quantum break.'],
  ['SHA-224 and other short outputs', 'Reduced margin', 'Smaller output gives less margin against generic quantum search.'],
  ['MD5, SHA-1, DES, 3DES, RC4, Blowfish', 'Classically weak', 'A present-day weakness that should be fixed regardless of quantum computing.'],
  ['ML-KEM, ML-DSA, SLH-DSA, FN-DSA/Falcon, XMSS/LMS, hybrids (e.g. X25519MLKEM768)', 'Quantum-resistant design', 'Designed to resist known quantum attacks; verify implementations and parameters.'],
  ['Blank, "unknown", proprietary or unrecognised names', 'Needs review', 'Not assumed vulnerable. Confirm the real algorithm with the system owner.'],
]

const WEIGHTS = [
  ['Algorithm status (base)', 'Classically weak 50 · Vulnerable 45 · Unknown 30 · Reduced margin 15 · Low concern 5 · Quantum-resistant 0'],
  ['Data sensitivity', 'Low 0 · Medium +5 · High +10 · Critical +15'],
  ['Business criticality', 'Low 0 · Medium +4 · High +8 · Critical +12'],
  ['Migration status', 'Not started +10 · Planned / Unknown +6 · In progress +3 · Completed 0'],
  ['Confidentiality period', 'For encryption / key exchange: ≥10 yrs +18 · ≥5 yrs +12 · ≥2 yrs +6 (halved for reduced-margin). Signatures/auth with ≥10 yrs +6'],
  ['Classical weakness (e.g. RSA-1024)', '+10'],
  ['Caps', 'Low concern ≤ 15 · Quantum-resistant ≤ 10 · Reduced margin ≤ 55'],
  ['Priority bands', 'Critical ≥ 80 · High ≥ 60 · Medium ≥ 40 · Low ≥ 20 · Informational < 20'],
]

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="About & Methodology"
        subtitle="QuantumShield India helps individuals learn about cyber safety and helps organisations start planning their move to post-quantum cryptography."
      />

      <section className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <h2 className="font-medium text-white">What this tool is</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
            <li>An educational platform and a starting point for cryptographic inventory and migration planning.</li>
            <li>A transparent, rule-based classifier - every finding explains why it was flagged.</li>
            <li>Free to use without registration, API keys or external services.</li>
          </ul>
        </div>
        <div className="card">
          <h2 className="font-medium text-white">What this tool is not</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
            <li>Not a network or code scanner - it only assesses the CSV you provide.</li>
            <li>Not a certified security assessment, and it cannot guarantee that anything is quantum-safe.</li>
            <li>Not a prediction of when quantum computers will break encryption. No such date is assumed.</li>
            <li>Not a quantum computer simulator - the simulator page is an educational illustration.</li>
          </ul>
        </div>
      </section>

      <section className="card">
        <h2 className="font-medium text-white">Two separate questions</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-navy-700 bg-navy-850/50 p-4">
            <p className="text-sm font-semibold text-sky-300">1. Algorithm-level quantum status</p>
            <p className="mt-1 text-sm text-slate-300">How does this algorithm fare against known quantum attacks? This depends only on the algorithm and key size.</p>
          </div>
          <div className="rounded-lg border border-navy-700 bg-navy-850/50 p-4">
            <p className="text-sm font-semibold text-teal-300">2. System-level review priority</p>
            <p className="mt-1 text-sm text-slate-300">How urgently should this dependency be reviewed? This combines algorithm status with data sensitivity, confidentiality period, business criticality and migration status.</p>
          </div>
        </div>
      </section>

      <section className="card overflow-x-auto">
        <h2 className="mb-3 font-medium text-white">Algorithm classification rules</h2>
        <table className="w-full min-w-[720px]">
          <thead className="bg-navy-850">
            <tr>
              <th className="table-th">Algorithms</th>
              <th className="table-th">Classification</th>
              <th className="table-th">Rationale</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-700">
            {STATUS_RULES.map(([alg, cls, why]) => (
              <tr key={alg}>
                <td className="table-td text-slate-200">{alg}</td>
                <td className="table-td whitespace-nowrap font-medium text-teal-300">{cls}</td>
                <td className="table-td text-slate-400">{why}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card overflow-x-auto">
        <h2 className="mb-3 font-medium text-white">Priority scoring (0-100)</h2>
        <table className="w-full min-w-[640px]">
          <tbody className="divide-y divide-navy-700">
            {WEIGHTS.map(([factor, rule]) => (
              <tr key={factor}>
                <th scope="row" className="table-td w-64 text-left font-medium text-slate-200">{factor}</th>
                <td className="table-td text-slate-300">{rule}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-xs text-slate-500">
          Weights are deliberately simple and visible so they can be challenged and tuned. The readiness percentage is the share of
          dependencies that are either not a significant quantum concern at algorithm level or whose migration is recorded as complete.
        </p>
      </section>

      <section className="card">
        <h2 className="font-medium text-white">Privacy & security</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
          <li>Never upload passwords, private keys, credentials or real confidential data. Only metadata about algorithms is needed.</li>
          <li>Uploaded CSVs are validated (type, size, columns, values), parsed as plain text and never executed.</li>
          <li>Data is held only in server memory and is lost when the backend restarts. Quiz answers never leave your browser.</li>
          <li>All sample data is fictional.</li>
        </ul>
      </section>

      <Notice tone="info">
        References for further reading: NIST FIPS 203 (ML-KEM), FIPS 204 (ML-DSA), FIPS 205 (SLH-DSA), NIST IR 8547 (transition to PQC),
        and CERT-In / national cybersecurity guidance. Report cybercrime in India at cybercrime.gov.in or helpline 1930.
      </Notice>
    </div>
  )
}
