import type { ScenarioData } from "../components/lessons/RealWorldScenario";
import type { TakeawayItem } from "../components/lessons/KeyTakeawaysRecap";

export type LessonIllustrationData = {
  src: string;
  alt: string;
  caption: string;
  badge: string;
};

export const LESSON_ILLUSTRATIONS: Record<string, LessonIllustrationData> = {
  "cybersecurity-fundamentals": {
    src: "/images/lessons/01-cybersecurity-fundamentals.webp",
    alt: "Cybersecurity fundamentals illustration showing confidential data protection, integrity verification, and network availability defenses",
    caption: "The core triad of digital security: confidentiality, data integrity, and service availability working together.",
    badge: "Core Foundations",
  },
  "quantum-computing-fundamentals": {
    src: "/images/lessons/02-quantum-computing-fundamentals.webp",
    alt: "Quantum computing visual comparing discrete classical binary 0 and 1 bits against continuous quantum superposition states",
    caption: "A classical bit is strictly 0 or 1. A qubit possesses probability amplitudes until physical measurement collapses it.",
    badge: "Quantum Mechanics",
  },
  "quantum-computing-and-cryptography": {
    src: "/images/lessons/03-quantum-cryptography.webp",
    alt: "Cryptographic impact visual depicting Shor's algorithm targeting public-key math and Grover's algorithm affecting symmetric ciphers",
    caption: "Quantum algorithms selectively threaten public-key schemes (Shor's algorithm) while symmetric ciphers retain security via larger keys.",
    badge: "Cryptanalysis",
  },
  "post-quantum-cryptography": {
    src: "/images/lessons/04-post-quantum-cryptography.webp",
    alt: "Post-quantum cryptography visual showing lattice-based and hash-based quantum-resistant algorithms standardized by NIST",
    caption: "NIST FIPS post-quantum standards replace vulnerable factoring problems with lattice and hash structures resistant to quantum attack.",
    badge: "NIST Standards",
  },
  "artificial-intelligence": {
    src: "/images/lessons/05-ai-and-machine-learning.webp",
    alt: "Artificial intelligence visual illustrating neural network training data flows, inference processing, and security verification boundaries",
    caption: "Machine learning models generate outputs from training patterns; outputs must always be validated before execution.",
    badge: "Machine Learning",
  },
  "cloud-and-iot-security": {
    src: "/images/lessons/06-cloud-and-iot-security.webp",
    alt: "Cloud and IoT security visual illustrating the boundary between cloud provider infrastructure and customer identity and device configuration",
    caption: "The shared responsibility model: the cloud provider protects the platform, while the customer secures identities, data, and edge devices.",
    badge: "Systems Architecture",
  },
};

export const LESSON_OBJECTIVES: Record<string, string[]> = {
  "cybersecurity-fundamentals": [
    "Differentiate the three core goals of the CIA triad (Confidentiality, Integrity, Availability).",
    "Identify the critical distinction between a dormant vulnerability and an active security incident.",
    "Apply foundational cyber hygiene practices to mitigate common real-world threats.",
  ],
  "quantum-computing-fundamentals": [
    "Explain how a quantum qubit differs fundamentally from a classical binary bit.",
    "Understand superposition and the irreversible nature of quantum measurement collapse.",
    "Recognize the open engineering challenges separating today's noisy processors from fault tolerance.",
  ],
  "quantum-computing-and-cryptography": [
    "Differentiate the distinct impacts of Shor's algorithm versus Grover's algorithm.",
    "Analyze why public-key cryptography (RSA, ECC) is vulnerable while AES-256 remains resilient.",
    "Evaluate the 'Harvest Now, Decrypt Later' (HNDL) risk for long-lived confidential data.",
  ],
  "post-quantum-cryptography": [
    "Identify the three official NIST post-quantum standards: ML-KEM, ML-DSA, and SLH-DSA.",
    "Understand the mathematical foundations and key size differences in lattice-based cryptography.",
    "Plan a structured 4-phase cryptographic migration sequence, including hybrid deployment.",
  ],
  "artificial-intelligence": [
    "Understand how training data and parameter weights govern model outputs through statistical correlation.",
    "Identify security risks associated with untrusted model outputs, prompt injection, and hallucinations.",
    "Implement defensive validation boundaries before feeding model outputs into automated systems.",
  ],
  "cloud-and-iot-security": [
    "Map the cloud Shared Responsibility Model across IaaS, PaaS, and SaaS environments.",
    "Identify common IoT security vulnerabilities, including factory default credentials and unpatchable firmware.",
    "Enforce the principle of least privilege and zero-trust segmentation for cloud resources.",
  ],
};

export const LESSON_SCENARIOS: Record<string, ScenarioData> = {
  "cybersecurity-fundamentals": {
    id: "payroll-modification",
    title: "Scenario: The Urgent Payroll Account Change",
    situation:
      "A human resources administrator receives an email claiming to be from the Chief Operating Officer. The message states they recently switched banks and urgently requests an update to their direct-deposit account before tomorrow's payroll cutoff.",
    question: "Which core security property is directly under attack, and what is the best defensive response?",
    options: [
      {
        id: "a",
        label: "Availability is attacked. Immediately update the account to ensure payroll is not delayed.",
        isBestDecision: false,
        explanation:
          "This is not an availability issue. Rushing to change payment details without verification is how business email compromise (BEC) attacks succeed.",
      },
      {
        id: "b",
        label: "Integrity is attacked. Perform out-of-band verification via a known corporate phone number before making any change.",
        isBestDecision: true,
        explanation:
          "Integrity protects data accuracy and unauthorized modification. The attacker is trying to alter legitimate bank records. Calling the sender via a pre-established internal channel confirms authenticity.",
      },
      {
        id: "c",
        label: "Confidentiality is attacked. Reply to the email asking the sender to attach a copy of their passport.",
        isBestDecision: false,
        explanation:
          "Replying to the attacker's email thread simply continues the deception and exposes sensitive verification data to an unauthorized party.",
      },
    ],
    takeaway: "Integrity attacks deceive staff into modifying trusted records. Always verify financial changes through an independent, out-of-band channel.",
  },
  "quantum-computing-fundamentals": {
    id: "quantum-laptop-pitch",
    title: "Scenario: The 'Quantum Laptop' Commercial Claim",
    situation:
      "A startup company announces a consumer device claiming to use 'quantum acceleration' to make standard desktop spreadsheet calculations, web browsing, and 4K video playback 1,000 times faster than current silicon laptops.",
    question: "Based on the physical and mathematical reality of quantum computing, how should an engineer evaluate this claim?",
    options: [
      {
        id: "a",
        label: "The claim is scientifically inaccurate. Quantum computers offer speedups only for specific mathematical problem classes, not general sequential tasks.",
        isBestDecision: true,
        explanation:
          "Quantum processors use interference and entanglement to solve specific structural problems (like period finding or quantum simulation). They do not provide a universal speedup for everyday computing tasks.",
      },
      {
        id: "b",
        label: "The claim is credible because superposition stores two values in every qubit, doubling clock speeds.",
        isBestDecision: false,
        explanation:
          "Superposition does not store two readable classical values. A measurement returns only one outcome, and quantum hardware is currently slower than classical CPUs for general operations.",
      },
      {
        id: "c",
        label: "The claim is accurate, but only if the laptop operates at room temperature without cryogenics.",
        isBestDecision: false,
        explanation:
          "Even if room-temperature quantum hardware were possible, quantum algorithms still do not speed up everyday sequential applications.",
      },
    ],
    takeaway: "Quantum speedups are problem-specific (e.g. Shor's period finding), not general-purpose accelerations for standard applications.",
  },
  "quantum-computing-and-cryptography": {
    id: "satellite-archive",
    title: "Scenario: Long-Term Sovereign Satellite Archive",
    situation:
      "A national space agency is creating an archive of satellite telemetry, reconnaissance data, and cryptographic master keys that must remain secret until at least 2060. The engineering team proposes using standard RSA-2048 key exchange for TLS transmission.",
    question: "Why does the 'Harvest Now, Decrypt Later' (HNDL) threat make standard RSA-2048 unacceptable for this archive today?",
    options: [
      {
        id: "a",
        label: "Current quantum computers can factor RSA-2048 today within a few seconds.",
        isBestDecision: false,
        explanation:
          "Large fault-tolerant quantum computers capable of breaking RSA-2048 do not exist today. The risk is not immediate decryption.",
      },
      {
        id: "b",
        label: "Adversaries can record encrypted transmissions now and decrypt them retroactively once fault-tolerant quantum computers emerge decades later.",
        isBestDecision: true,
        explanation:
          "Because the secrecy horizon (2060) is long, encrypted data intercepted today will still have commercial or sovereign value when fault-tolerant machines running Shor's algorithm become available.",
      },
      {
        id: "c",
        label: "RSA-2048 keys are too large to transmit across satellite wireless channels.",
        isBestDecision: false,
        explanation:
          "RSA-2048 keys are small (256 bytes) and transmit easily. The concern is purely mathematical vulnerability to Shor's algorithm in the future.",
      },
    ],
    takeaway: "If data secrecy must outlast the current lifespan of classical public-key cryptography, migrate to post-quantum key establishment immediately.",
  },
  "post-quantum-cryptography": {
    id: "fintech-hybrid-migration",
    title: "Scenario: Digital Banking Key Migration",
    situation:
      "A financial institution wants to protect high-volume interbank payment channels against future quantum attacks, but the compliance team worries that newly written post-quantum software libraries might contain undiscovered implementation bugs.",
    question: "What is the recommended cryptographic architectural approach to balance quantum defense with battle-tested security?",
    options: [
      {
        id: "a",
        label: "Deploy a hybrid key exchange combining a classical algorithm (like X25519) with a post-quantum standard (like ML-KEM-768).",
        isBestDecision: true,
        explanation:
          "In a hybrid scheme, an attacker must break BOTH the classical and the post-quantum algorithms to compromise the session. This protects against early implementation flaws while defeating HNDL.",
      },
      {
        id: "b",
        label: "Wait until all classical algorithms are completely broken by quantum computers before making any changes.",
        isBestDecision: false,
        explanation:
          "Waiting leaves current encrypted sessions completely exposed to 'Harvest Now, Decrypt Later' interception.",
      },
      {
        id: "c",
        label: "Replace every cryptographic algorithm overnight with an unreviewed custom lattice library.",
        isBestDecision: false,
        explanation:
          "Custom, unvetted cryptographic implementations frequently introduce side-channel vulnerabilities or implementation errors. Use standardized, reviewed libraries.",
      },
    ],
    takeaway: "Hybrid deployment (combining classical X25519 with standardized ML-KEM) delivers defense-in-depth during the transition period.",
  },
  "artificial-intelligence": {
    id: "automated-firewall",
    title: "Scenario: Automated Security Log Remediation",
    situation:
      "A security team deploys a machine learning model to parse server syslog entries. The model is given administrative API keys to automatically execute IP block commands on the cloud perimeter firewall whenever it detects 'malicious intent' in text logs.",
    question: "What critical security design vulnerability exists in this architecture?",
    options: [
      {
        id: "a",
        label: "Model outputs are treated as trusted commands, allowing an attacker to craft log entries (prompt injection) that trick the system into blocking legitimate infrastructure.",
        isBestDecision: true,
        explanation:
          "AI outputs are untrusted input. An attacker who can write to logs can embed adversarial instructions that the model interprets as commands, causing denial-of-service against critical gateways.",
      },
      {
        id: "b",
        label: "Machine learning models cannot read syslog files because text logs are too large.",
        isBestDecision: false,
        explanation:
          "Models process text easily. The issue is trust and execution authority, not file ingestion.",
      },
      {
        id: "c",
        label: "Firewalls can only accept manual configuration changes made by a human using a keyboard.",
        isBestDecision: false,
        explanation:
          "Firewalls support automated APIs; however, automation must be gated by strict validation, sanity checks, and rate limits.",
      },
    ],
    takeaway: "Never allow unvalidated model outputs to execute system commands or modify infrastructure without strict schema bounds and human oversight.",
  },
  "cloud-and-iot-security": {
    id: "smart-camera-leak",
    title: "Scenario: Smart Office Camera Storage Exposure",
    situation:
      "A company installed 50 smart security cameras in their headquarters, streaming video to a cloud storage bucket. Six months later, private office video feeds were found downloadable on the internet. The cloud provider confirmed their data centers were never breached.",
    question: "Under the Shared Responsibility Model, which party was responsible for this failure and why?",
    options: [
      {
        id: "a",
        label: "The customer was responsible, because they misconfigured the cloud storage bucket access policy as publicly accessible.",
        isBestDecision: true,
        explanation:
          "Under the Shared Responsibility Model, the cloud provider secures the underlying platform, but the customer is 100% responsible for configuring access policies, IAM roles, and bucket permissions.",
      },
      {
        id: "b",
        label: "The cloud provider was responsible, because they should automatically delete any data that contains video recordings.",
        isBestDecision: false,
        explanation:
          "Cloud providers do not inspect or censor customer data. They store what the customer instructs them to store.",
      },
      {
        id: "c",
        label: "The internet service provider was responsible for routing the camera traffic.",
        isBestDecision: false,
        explanation:
          "Network transit providers route packets; they do not control access control lists on cloud storage buckets.",
      },
    ],
    takeaway: "The cloud provider secures the platform infrastructure; the customer secures access policies, credentials, and data.",
  },
};

export const LESSON_TAKEAWAYS: Record<string, TakeawayItem[]> = {
  "cybersecurity-fundamentals": [
    {
      title: "The CIA Triad is a Balancing Act",
      summary: "Confidentiality, integrity, and availability often compete; effective system architecture thoughtfully balances them rather than maximizing only one.",
      tag: "Core Framework",
    },
    {
      title: "A Weakness is Not Yet an Incident",
      summary: "Finding an unpatched server or configuration flaw represents risk. It becomes an incident only when an active threat reaches and exploits it.",
      tag: "Risk Distinction",
    },
    {
      title: "Everyday Habits Form the Baseline",
      summary: "Timely software patching, unique passwords via password managers, and multi-factor authentication stop the vast majority of opportunistic attacks.",
      tag: "Defensive Hygiene",
    },
    {
      title: "Principle of Least Privilege",
      summary: "Limit permissions to only what an account strictly requires. Restricting administrator rights stops a single compromised credential from taking down an entire domain.",
      tag: "Access Control",
    },
  ],
  "quantum-computing-fundamentals": [
    {
      title: "Bits vs Qubits",
      summary: "A classical bit is definitively 0 or 1. A qubit possesses probability amplitudes in superposition until a physical measurement occurs.",
      tag: "State Representation",
    },
    {
      title: "One Measurement, One Outcome",
      summary: "Measuring a qubit collapses its wavefunction into a single classical 0 or 1. You cannot read multiple answers simultaneously from one qubit.",
      tag: "Quantum Physics",
    },
    {
      title: "Entanglement is Correlation, Not Communication",
      summary: "Entangled particles have correlated measurement outcomes, but they cannot transmit messages faster than light because measurement outcomes are fundamentally random.",
      tag: "Information Theory",
    },
    {
      title: "Noisy Hardware vs Fault Tolerance",
      summary: "Today's processors are noisy intermediate-scale devices. Building a fault-tolerant machine large enough to run Shor's algorithm remains an open engineering problem.",
      tag: "Engineering Reality",
    },
  ],
  "quantum-computing-and-cryptography": [
    {
      title: "Shor's Algorithm Breaks Factoring & Discrete Log",
      summary: "Shor's algorithm provides an exponential speedup, threatening RSA and ECC public keys if run on a sufficiently large fault-tolerant quantum computer.",
      tag: "Public-Key Risk",
    },
    {
      title: "Grover's Algorithm Halves Symmetric Security",
      summary: "Grover's algorithm provides a quadratic speedup for unstructured search. AES-256 is reduced to an effective 128 bits of security, which remains practically unbreakable.",
      tag: "Symmetric Defense",
    },
    {
      title: "Harvest Now, Decrypt Later (HNDL)",
      summary: "Adversaries can intercept and archive encrypted traffic today. Long-lived confidential data is vulnerable if its secrecy outlasts the algorithms protecting it.",
      tag: "Risk Horizon",
    },
    {
      title: "Hashing Remains Resilient",
      summary: "Standard cryptographic digest lengths (SHA-256 and SHA-384) provide ample pre-image and collision resistance against quantum algorithms.",
      tag: "Hash Integrity",
    },
  ],
  "post-quantum-cryptography": [
    {
      title: "NIST Standardized PQC in 2024",
      summary: "ML-KEM (FIPS 203) for key encapsulation, ML-DSA (FIPS 204) for digital signatures, and SLH-DSA (FIPS 205) for stateless hash-based signatures.",
      tag: "Official Standards",
    },
    {
      title: "Lattice Mathematics Replaces Factoring",
      summary: "Module Learning with Errors (M-LWE) problems resist both classical computers and known quantum algorithms, protecting against Shor's algorithm.",
      tag: "Hard Problems",
    },
    {
      title: "Key and Signature Sizes are Significantly Larger",
      summary: "Post-quantum keys and signatures require hundreds to thousands of bytes compared to classical ECC's 32 bytes, requiring network packet considerations.",
      tag: "Implementation",
    },
    {
      title: "Deploy Hybrids During Migration",
      summary: "Combining classical algorithms (like X25519) with PQC standards (like ML-KEM-768) ensures security against both quantum threats and early implementation bugs.",
      tag: "Migration Strategy",
    },
  ],
  "artificial-intelligence": [
    {
      title: "Pattern Matching at Scale",
      summary: "Machine learning models produce outputs by adjusting weights against training data. They perform statistical correlation, not verified logical reasoning.",
      tag: "Model Limits",
    },
    {
      title: "Fluency is Not Verification",
      summary: "A model can produce articulate, confident explanations that are completely factually incorrect. Confidence in language is never evidence of correctness.",
      tag: "Hallucinations",
    },
    {
      title: "Model Outputs are Untrusted Input",
      summary: "Never pipe model outputs directly into shell commands, database queries, or external APIs without strict parsing, schema validation, and sanitization.",
      tag: "Defensive Gateway",
    },
    {
      title: "AI Enhances Attacker Phishing Fluency",
      summary: "Because generative writing tools remove grammatical flaws from phishing lures, always verify high-risk actions through independent out-of-band channels.",
      tag: "Phishing Defense",
    },
  ],
  "cloud-and-iot-security": [
    {
      title: "The Shared Responsibility Boundary",
      summary: "The cloud provider secures the underlying platform, data centers, and hypervisor. The customer is always responsible for IAM, configuration, and data access.",
      tag: "Cloud Governance",
    },
    {
      title: "A Public Bucket is a Customer Error",
      summary: "Data breaches caused by open cloud storage buckets are customer configuration mistakes, not breaches of the cloud provider's physical hardware.",
      tag: "Access Control",
    },
    {
      title: "IoT Devices Require Initial Credential Changes",
      summary: "Factory default passwords published in manuals are indexed by automated botnets. Credentials must be made unique upon initial installation.",
      tag: "Edge Device Hygiene",
    },
    {
      title: "Network Segmentation and Zero Trust",
      summary: "Isolate IoT devices on dedicated VLANs with strict outbound egress filtering to prevent a compromised device from becoming a pivot point into core networks.",
      tag: "Network Defense",
    },
  ],
};
