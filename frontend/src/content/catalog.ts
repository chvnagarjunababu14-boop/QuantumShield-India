import type { LearningPath, Lesson, Topic } from "./types";

export const topics: Topic[] = [
  {
    id: "cybersecurity",
    title: "Cybersecurity Fundamentals",
    summary: "Core defensive principles: confidentiality, data integrity, service availability, and reducing account blast radius.",
    description:
      "Cybersecurity is the discipline of protecting digital systems, networks, and confidential information from unauthorized access, modification, or disruption. Foundational concepts—including the CIA Triad, threat versus vulnerability analysis, and least-privilege access control—form the bedrock upon which all advanced cryptographic and network defenses are built.",
    keyConcepts: [
      "The CIA Triad: Confidentiality, Integrity, and Availability trade-offs",
      "Risk Taxonomy: Vulnerability vs. Threat vs. Active Incident",
      "Principle of Least Privilege and blast radius containment",
      "Proactive patch management and credential hygiene habits",
    ],
    illustrationSrc: "/images/lessons/01-cybersecurity-fundamentals.webp",
    illustrationAlt:
      "Cybersecurity fundamentals illustration showing confidential data protection, integrity verification, and network availability defenses",
    lessonSlugs: ["cybersecurity-fundamentals"],
  },
  {
    id: "quantum-computing",
    title: "Quantum Computing",
    summary: "How qubits, superposition, and entanglement transform computing, and where NISQ hardware engineering stands.",
    description:
      "Quantum computers harness quantum mechanics to solve specialized computational problems beyond the reach of classical supercomputers. Unlike classical bits that hold binary 0 or 1 states, qubits maintain probability amplitudes described by superposition until measurement collapses them. Today's hardware remains in the Noisy Intermediate-Scale Quantum (NISQ) era, where fault-tolerant logical qubits remain an active engineering frontier.",
    keyConcepts: [
      "Classical binary bits vs. probabilistic quantum qubits",
      "Superposition amplitudes and irreversible measurement collapse",
      "Entanglement correlations without superluminal signalling",
      "NISQ processor limits and fault-tolerant error correction challenges",
    ],
    illustrationSrc: "/images/lessons/02-quantum-computing-fundamentals.webp",
    illustrationAlt:
      "Quantum computing visual comparing discrete classical binary 0 and 1 bits against continuous quantum superposition states",
    lessonSlugs: ["quantum-computing-fundamentals"],
  },
  {
    id: "cryptography",
    title: "Cryptography and Quantum Threats",
    summary: "Why Shor's algorithm targets public-key math, Grover's algorithm affects symmetric ciphers, and HNDL creates urgent exposure.",
    description:
      "Modern internet security relies on mathematical problems—such as prime factorization and discrete logarithms—underlying RSA, Diffie-Hellman, and Elliptic Curve Cryptography. A sufficiently large fault-tolerant quantum computer running Shor's algorithm would solve these problems in polynomial time. Adversaries are already executing 'Harvest Now, Decrypt Later' (HNDL) operations, intercepting encrypted traffic today to decrypt once quantum hardware matures.",
    keyConcepts: [
      "Shor's algorithm: polynomial factoring breaking RSA and ECC",
      "Grover's algorithm: quadratic speedup against symmetric keys",
      "Harvest Now, Decrypt Later (HNDL) retroactive exposure timeline",
      "Asymmetric vulnerability vs. symmetric resilience (AES-256)",
    ],
    illustrationSrc: "/images/lessons/03-quantum-cryptography.webp",
    illustrationAlt:
      "Cryptographic impact visual depicting Shor's algorithm targeting public-key math and Grover's algorithm affecting symmetric ciphers",
    lessonSlugs: ["quantum-computing-and-cryptography", "post-quantum-cryptography"],
  },
  {
    id: "post-quantum-cryptography",
    title: "Post-Quantum Cryptography",
    summary: "NIST standards (ML-KEM, ML-DSA, SLH-DSA), lattice-based security, and cryptographic migration engineering.",
    description:
      "Post-quantum cryptography (PQC) consists of mathematical algorithms engineered to run efficiently on standard classical servers and devices while resisting cryptanalytic attacks from both classical and quantum computers. Standardized by NIST in 2024 under FIPS 203, 204, and 205, modern security teams must plan cryptographic discovery, hybrid key exchanges, and infrastructure migration roadmaps.",
    keyConcepts: [
      "NIST FIPS 203: Module-Lattice-Based Key-Encapsulation (ML-KEM)",
      "NIST FIPS 204: Module-Lattice Digital Signatures (ML-DSA)",
      "NIST FIPS 205: Stateless Hash-Based Digital Signatures (SLH-DSA)",
      "Cryptographic agility, hybrid deployments, and migration roadmaps",
    ],
    illustrationSrc: "/images/lessons/04-post-quantum-cryptography.webp",
    illustrationAlt:
      "Post-quantum cryptography visual showing lattice-based and hash-based quantum-resistant algorithms standardized by NIST",
    lessonSlugs: ["post-quantum-cryptography"],
  },
  {
    id: "artificial-intelligence",
    title: "AI and Machine Learning Security",
    summary: "How models learn from statistical distributions, model inversion risks, prompt injection, and treating outputs as untrusted.",
    description:
      "Machine learning models adjust high-dimensional weights against training data to perform statistical pattern recognition at massive scale. While defensive teams use AI models to triage alerts and anomaly-check security logs, neural networks can hallucinate, suffer prompt injection, and fall victim to training data poisoning. Security engineering dictates that all AI outputs must be treated as untrusted input.",
    keyConcepts: [
      "Statistical pattern matching vs. authentic logical reasoning",
      "Treating AI model outputs as untrusted execution input",
      "Adversarial evasion, prompt injection, and data poisoning",
      "AI-augmented phishing lures and out-of-band verification",
    ],
    illustrationSrc: "/images/lessons/05-ai-and-machine-learning.webp",
    illustrationAlt:
      "Artificial intelligence visual illustrating neural network training data flows, inference processing, and security verification boundaries",
    lessonSlugs: ["artificial-intelligence"],
  },
  {
    id: "cloud-and-iot",
    title: "Cloud and IoT Security",
    summary: "The Shared Responsibility Model across cloud services, edge device constraints, and network segmentation.",
    description:
      "Enterprise digital operations span multi-tenant public clouds and thousands of physical edge IoT devices. Under the Shared Responsibility Model, cloud providers secure the hypervisor and data center facilities, while organizations remain responsible for data classification, bucket policies, and IAM roles. Meanwhile, embedded IoT endpoints often ship with unchangeable or default credentials, requiring strict network segmentation and VLAN isolation.",
    keyConcepts: [
      "The Shared Responsibility Model: Provider platform vs. Customer data & IAM",
      "Securing cloud object storage and eliminating public bucket misconfigurations",
      "Embedded IoT firmware vulnerabilities and factory-default credential risks",
      "VLAN network segmentation and perimeter defense for operational devices",
    ],
    illustrationSrc: "/images/lessons/06-cloud-and-iot-security.webp",
    illustrationAlt:
      "Cloud and IoT security visual illustrating the boundary between cloud provider infrastructure and customer identity and device configuration",
    lessonSlugs: ["cloud-and-iot-security"],
  },
];

export const lessons: Lesson[] = [
  {
    slug: "cybersecurity-fundamentals",
    title: "Cybersecurity fundamentals",
    summary:
      "A plain-language map of confidentiality, integrity, availability, and the difference between a weakness and an incident.",
    topicId: "cybersecurity",
    difficulty: "Foundational",
    featured: true,
    blocks: [
      {
        type: "paragraph",
        text: "Cybersecurity is the work of keeping information and the systems that hold it fit for use. That work is never finished, because software, people, and attackers all change.",
      },
      { type: "heading", id: "three-goals", text: "Three goals" },
      {
        type: "paragraph",
        text: "A useful starting frame is three properties. They can compete with each other, so a design usually trades among them rather than maximizing all three.",
      },
      {
        type: "list",
        items: [
          "Confidentiality: only the intended people or systems can read the information.",
          "Integrity: the information and the system behavior have not been changed without authorization.",
          "Availability: the people who should reach the system can do so when they need it.",
        ],
      },
      { type: "heading", id: "risk-words", text: "Threats, vulnerabilities, and risk" },
      {
        type: "paragraph",
        text: "A threat is someone or something that could cause harm. A vulnerability is a weakness that could be used. Risk is the combination of how likely that is and how serious the harm would be. A vulnerability that nobody can reach is a different situation from the same weakness on a public server.",
      },
      {
        type: "callout",
        title: "A weakness is not yet an incident",
        text: "Finding a missing update or a weak setting is useful. It does not, by itself, mean that data has already been taken.",
      },
      { type: "heading", id: "everyday-practice", text: "Everyday practice" },
      {
        type: "list",
        items: [
          "Install updates from the software maker, because many attacks reuse flaws that already have fixes.",
          "Use a different password for each important account, and a password manager if remembering them is unrealistic.",
          "Treat unexpected links and attachments as untrusted until you can confirm who sent them.",
          "Give accounts only the access they need. Broad administrator rights make a single mistake larger.",
        ],
      },
      {
        type: "paragraph",
        text: "These habits reduce common failures. They are not a complete security program, and this sample lesson is not a certification.",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "cia-integrity-alter",
            prompt: "Which pillar of the CIA triad is violated if an attacker secretly alters recipient account numbers on payroll transfers?",
            choices: [
              { id: "integrity", label: "Integrity" },
              { id: "confidentiality", label: "Confidentiality" },
              { id: "availability", label: "Availability" },
            ],
            correctChoiceId: "integrity",
            explanation:
              "Integrity ensures information has not been modified or corrupted without authorization. Tampering with account numbers alters data accuracy.",
          },
          {
            id: "threat-vs-vuln",
            prompt: "What is the key difference between a vulnerability and an incident?",
            choices: [
              { id: "dormant", label: "A vulnerability is a dormant weakness; an incident occurs when a threat exploits it to cause harm" },
              { id: "downtime", label: "A vulnerability always causes immediate service downtime" },
              { id: "theft", label: "An incident only refers to physical server theft" },
            ],
            correctChoiceId: "dormant",
            explanation:
              "A vulnerability is a flaw (like missing software patches). It becomes an active incident only when an actor or event takes advantage of it.",
          },
          {
            id: "least-privilege",
            prompt: "Why is granting full administrator access to every employee considered a critical security mistake?",
            choices: [
              { id: "privilege", label: "It violates least privilege, expanding the blast radius of any single compromised account" },
              { id: "passwords", label: "It makes user passwords expire every day" },
              { id: "speed", label: "It slows down internet connection bandwidth" },
            ],
            correctChoiceId: "privilege",
            explanation:
              "Broad administrative permissions mean a single mistake or compromised credential gives attackers wide access across the entire organization.",
          },
        ],
      },
    ],
  },
  {
    slug: "quantum-computing-fundamentals",
    title: "Quantum computing fundamentals",
    summary:
      "Bits, qubits, and measurement, without treating a quantum computer as a faster version of every laptop.",
    topicId: "quantum-computing",
    difficulty: "Foundational",
    featured: false,
    blocks: [
      {
        type: "paragraph",
        text: "A quantum computer uses the physics of very small systems to represent certain problems differently from a laptop or a phone. It is not a machine that speeds up every task.",
      },
      { type: "heading", id: "bits-and-qubits", text: "Bits and qubits" },
      {
        type: "paragraph",
        text: "A classical bit is 0 or 1. A qubit is described by amplitudes for those outcomes before it is measured. A measurement returns one result, not both. Superposition is the name for that pre-measurement description. It is not a way to store two readable values in one qubit.",
      },
      {
        type: "illustration",
        diagram: "bit-and-qubit",
        caption:
          "A classical bit is read as 0 or 1. A qubit has amplitudes for those outcomes until it is measured, and one measurement returns only one of them.",
      },
      {
        type: "callout",
        title: "You do not get both answers at once",
        text: "After one measurement, the device reports a single outcome. Algorithms that benefit from quantum hardware are built around that limit, not around reading every possibility.",
      },
      { type: "heading", id: "entanglement", text: "Entanglement, briefly" },
      {
        type: "paragraph",
        text: "Entangled qubits have correlated measurement results. That correlation is real and useful in some algorithms. It is not a channel for sending a message faster than light, because the person measuring one qubit cannot choose which outcome appears.",
      },
      { type: "heading", id: "open-engineering", text: "Where the uncertainty is" },
      {
        type: "paragraph",
        text: "Today's quantum processors are noisy and limited in size. A fault-tolerant machine large enough to run the cryptographic algorithms discussed in later lessons is an open engineering problem. This lesson does not predict the year that machine will exist.",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "qubit-measurement-collapse",
            prompt: "What happens when a quantum device measures a qubit that was in a superposition state?",
            choices: [
              { id: "collapse", label: "The superposition collapses into a single definite classical outcome (0 or 1)" },
              { id: "both", label: "The device reads and stores both 0 and 1 simultaneously" },
              { id: "faster-light", label: "The qubit transmits its state faster than the speed of light" },
            ],
            correctChoiceId: "collapse",
            explanation:
              "Physical measurement irreversibly collapses probability amplitudes into a single classical outcome. You never extract two readable states simultaneously from one qubit.",
          },
          {
            id: "superposition-meaning",
            prompt: "Which statement accurately describes quantum superposition?",
            choices: [
              { id: "amplitudes", label: "It is a mathematical description of probability amplitudes for outcomes before measurement occurs" },
              { id: "storage", label: "It is a method for storing twice as much text on a standard hard drive" },
              { id: "speedup", label: "It makes everyday word processors run twice as fast" },
            ],
            correctChoiceId: "amplitudes",
            explanation:
              "Superposition describes pre-measurement probability amplitudes. It is not a mechanism for doubling file storage or speeding up ordinary sequential tasks.",
          },
          {
            id: "nisq-limits",
            prompt: "Why are today's noisy intermediate-scale quantum (NISQ) processors not yet breaking public-key encryption?",
            choices: [
              { id: "noisy", label: "They are limited in qubit count and prone to environmental noise, lacking full fault tolerance" },
              { id: "software", label: "Software engineers have not yet invented the binary number 0" },
              { id: "power", label: "They can only be turned on during solar eclipses" },
            ],
            correctChoiceId: "noisy",
            explanation:
              "Running Shor's algorithm against current RSA or ECC key sizes requires thousands of fault-tolerant logical qubits, which is an active engineering frontier.",
          },
        ],
      },
    ],
  },
  {
    slug: "quantum-computing-and-cryptography",
    title: "Why quantum computing matters to cryptography",
    summary:
      "How Shor's and Grover's algorithms affect different kinds of encryption, and why long-lived secrets are a special case.",
    topicId: "cryptography",
    difficulty: "Intermediate",
    featured: true,
    blocks: [
      {
        type: "paragraph",
        text: "Most everyday encryption is not one thing. Websites, messaging apps, and software updates use several algorithms together. A quantum computer would not treat all of them the same way.",
      },
      { type: "heading", id: "two-algorithms", text: "Two different effects" },
      {
        type: "paragraph",
        text: "Peter Shor's algorithm, published in 1994, solves the factoring and discrete-logarithm problems that support widely used public-key schemes such as RSA and elliptic-curve cryptography. It does that only if it runs on a sufficiently large fault-tolerant quantum computer. That machine is not a general tool available today.",
      },
      {
        type: "paragraph",
        text: "Grover's algorithm offers a quadratic speedup for unstructured search. For symmetric ciphers, that is a reason standards discussions consider longer keys, such as AES-256. It is not the same kind of break that Shor's algorithm would be for factoring-based public keys.",
      },
      {
        type: "illustration",
        diagram: "public-key-risk",
        caption:
          "Illustrative diagram: ciphertext can be stored now, and a future large fault-tolerant quantum computer running Shor's algorithm would threaten the public-key problem used to protect it. This is not a depiction of a real attack.",
      },
      { type: "heading", id: "harvest-now", text: "Harvest now, decrypt later" },
      {
        type: "paragraph",
        text: "If a message must stay secret for many years, an adversary can record the encrypted form today and wait. The concern is not that every current connection is already readable. The concern is data whose secrecy outlasts the public-key algorithms used to protect it.",
      },
      {
        type: "concept",
        title: "Quantum-threat simulator",
        text: "A later lesson can add an educational simulator that walks through this timeline with made-up example keys. That demonstration is not built yet. It will be labeled as a simulation, and it will not attempt to break real encryption or connect to live systems.",
      },
      {
        type: "callout",
        title: "This page does not run an attack",
        text: "Nothing here factors a key, contacts a server, or tests a password. The point is to separate what the mathematics allows from what current machines can do.",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "shor-vs-grover",
            prompt: "What is the primary difference in impact between Shor's algorithm and Grover's algorithm?",
            choices: [
              { id: "impact-diff", label: "Shor's algorithm breaks public-key factoring/ECC, while Grover's algorithm provides a quadratic search speedup against symmetric keys" },
              { id: "both-break", label: "Both algorithms break AES-256 completely in less than a second" },
              { id: "no-effect", label: "Neither algorithm has any mathematical relevance to modern cryptography" },
            ],
            correctChoiceId: "impact-diff",
            explanation:
              "Shor's algorithm solves period-finding, breaking factoring and discrete logs. Grover's algorithm speeds up unstructured search, effectively halving symmetric key lengths without breaking them structurally.",
          },
          {
            id: "aes-key-length",
            prompt: "Under Grover's quantum search algorithm, why is AES-256 considered practically secure?",
            choices: [
              { id: "128-bits", label: "Grover's algorithm reduces effective key security to ~128 bits, which remains infeasible to brute force" },
              { id: "immutable", label: "Grover's algorithm is mathematically forbidden from running on AES" },
              { id: "instant", label: "AES-256 keys change automatically every millisecond" },
            ],
            correctChoiceId: "128-bits",
            explanation:
              "Grover's algorithm provides a quadratic speedup ($O(\\sqrt{N})$), effectively cutting 256 bits down to 128 bits of security. 128 bits of symmetric security is still mathematically secure.",
          },
          {
            id: "hndl-definition",
            prompt: "What is the primary risk addressed by 'Harvest Now, Decrypt Later' (HNDL)?",
            choices: [
              { id: "retroactive", label: "Adversaries intercepting and storing encrypted traffic today to decrypt once quantum computers mature" },
              { id: "hardware-theft", label: "Thieves physically taking servers from server rooms" },
              { id: "antivirus", label: "Antivirus software slowing down laptop boot times" },
            ],
            correctChoiceId: "retroactive",
            explanation:
              "HNDL poses a direct threat to data with long-term confidentiality requirements (medical records, sovereign data) that may still be confidential when fault-tolerant quantum computers arrive.",
          },
        ],
      },
    ],
  },
  {
    slug: "post-quantum-cryptography",
    title: "Post-quantum cryptography",
    summary:
      "What the NIST standards ML-KEM, ML-DSA, and SLH-DSA are for, and what a migration actually involves.",
    topicId: "cryptography",
    difficulty: "Intermediate",
    featured: true,
    blocks: [
      {
        type: "paragraph",
        text: "Post-quantum cryptography means algorithms designed to stay secure against both ordinary computers and the quantum algorithms that are known today. It is mostly a replacement path for public-key tools, not a product that stops malware by itself.",
      },
      { type: "heading", id: "nist-standards", text: "Standards published by NIST" },
      {
        type: "paragraph",
        text: "In 2024 the U.S. National Institute of Standards and Technology published three Federal Information Processing Standards from its post-quantum project. Names in parentheses are the earlier research names.",
      },
      {
        type: "list",
        items: [
          "ML-KEM, FIPS 203, for key establishment (CRYSTALS-Kyber).",
          "ML-DSA, FIPS 204, for digital signatures (CRYSTALS-Dilithium).",
          "SLH-DSA, FIPS 205, for hash-based digital signatures (SPHINCS+).",
        ],
      },
      {
        type: "link",
        href: "https://csrc.nist.gov/projects/post-quantum-cryptography",
        label: "NIST Post-Quantum Cryptography project",
      },
      { type: "heading", id: "migration", text: "What migration involves" },
      {
        type: "paragraph",
        text: "Switching algorithms is an engineering program. An organization has to find where public-key cryptography is used, including certificates, software signatures, and key agreement inside protocols. Some deployments use a hybrid of a current algorithm and a post-quantum one while implementations mature. Publishing a standard does not mean every product already supports it.",
      },
      {
        type: "code",
        label: "Planning note",
        code: "Public-key uses: certificates, software signatures, key agreement\nQuantum-relevant concern: Shor's algorithm on a future large fault-tolerant computer\nCandidate replacements: NIST standards such as ML-KEM and ML-DSA",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "pqc-goal",
            prompt: "What is post-quantum cryptography designed to resist?",
            choices: [
              { id: "both", label: "Classical computers and known attacks from a large fault-tolerant quantum computer" },
              { id: "malware", label: "Only malware and phishing" },
              { id: "side", label: "Only physical side-channel attacks" },
            ],
            correctChoiceId: "both",
            explanation:
              "These algorithms are chosen so that both ordinary computers and known quantum algorithms fail to break them. They do not, by themselves, stop phishing or every physical attack.",
          },
          {
            id: "shor-claim",
            prompt: "Which statement about Shor's algorithm is accurate?",
            choices: [
              {
                id: "future",
                label: "On a large fault-tolerant quantum computer, it would threaten RSA and elliptic-curve public-key schemes",
              },
              { id: "already", label: "It already decrypts ordinary website traffic on today's laptops" },
              { id: "passwords", label: "It only chooses longer passwords" },
            ],
            correctChoiceId: "future",
            explanation:
              "Shor's algorithm is a 1994 result about factoring and discrete logarithms. Running it against current public-key sizes needs a fault-tolerant quantum computer that is not generally available. It is not a password generator.",
          },
          {
            id: "ml-kem-fips",
            prompt: "ML-KEM is specified in which NIST standard?",
            choices: [
              { id: "203", label: "FIPS 203" },
              { id: "204", label: "FIPS 204" },
              { id: "140", label: "FIPS 140" },
            ],
            correctChoiceId: "203",
            explanation:
              "FIPS 203 specifies ML-KEM. FIPS 204 specifies ML-DSA, and FIPS 205 specifies SLH-DSA. FIPS 140 is a separate standard about cryptographic modules.",
          },
        ],
      },
    ],
  },
  {
    slug: "artificial-intelligence",
    title: "Artificial intelligence and machine learning",
    summary:
      "How a model learns patterns from examples, and why its output should be checked before a system trusts it.",
    topicId: "artificial-intelligence",
    difficulty: "Foundational",
    featured: false,
    blocks: [
      {
        type: "paragraph",
        text: "Artificial intelligence is a broad label. Machine learning, the part most products mean, builds a model by adjusting it against examples. The model then produces outputs for new inputs. That is pattern matching at scale, not a guarantee that the system understands a question the way a person does.",
      },
      { type: "heading", id: "training-data", text: "Training data shapes the result" },
      {
        type: "paragraph",
        text: "If the examples are narrow, outdated, or uneven, the outputs will reflect that. A fluent answer can still be wrong. Confidence in the wording is not the same thing as evidence.",
      },
      { type: "heading", id: "security-uses", text: "Security-relevant uses and abuses" },
      {
        type: "list",
        items: [
          "Defenders use models to sort large logs. Those tools still need a person or another check, because they miss events and raise false alarms.",
          "The same writing tools can draft more convincing phishing. The defense is still to verify the request through a channel you already trust.",
          "If a system feeds model output into a command, a database query, or another tool, that output is untrusted input.",
        ],
      },
      {
        type: "callout",
        title: "Treat model output as untrusted",
        text: "Use it as a draft or a hint. Confirm important facts, permissions, and actions before relying on them.",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "ai-untrusted-input",
            prompt: "When integrating a machine learning model into automated systems, how should its output be handled?",
            choices: [
              { id: "untrusted", label: "As untrusted input that requires strict schema validation before execution" },
              { id: "admin", label: "As an administrative command that should bypass normal system firewalls" },
              { id: "verified", label: "As mathematically verified truth that needs no human oversight" },
            ],
            correctChoiceId: "untrusted",
            explanation:
              "Model outputs can be manipulated via prompt injection or hallucinations. Feeding raw outputs into databases or shell commands creates severe vulnerabilities.",
          },
          {
            id: "pattern-matching-limit",
            prompt: "What does a machine learning language model fundamentally do when generating text?",
            choices: [
              { id: "pattern", label: "Performs statistical pattern matching based on training examples" },
              { id: "reasoning", label: "Engages in conscious logical reasoning with innate understanding of truth" },
              { id: "database", label: "Searches an indexed physical filing cabinet of paper documents" },
            ],
            correctChoiceId: "pattern",
            explanation:
              "Machine learning models adjust weights to mirror statistical relationships in training data. Fluent phrasing is not evidence of factual accuracy.",
          },
          {
            id: "ai-phishing-defense",
            prompt: "How does generative AI change the nature of phishing, and what is the best defense?",
            choices: [
              { id: "verify-channel", label: "Attackers can write more articulate messages; defenders must verify high-risk requests out-of-band" },
              { id: "ignore", label: "AI makes phishing impossible because email filters detect all text automatically" },
              { id: "no-passwords", label: "AI prevents employees from opening suspicious links" },
            ],
            correctChoiceId: "verify-channel",
            explanation:
              "AI writing tools eliminate spelling and grammar errors common in past phishing lures. Independent verification of unusual or sensitive requests is essential.",
          },
        ],
      },
    ],
  },
  {
    slug: "cloud-and-iot-security",
    title: "Cloud computing and IoT security",
    summary:
      "Who is responsible for which layer in the cloud, and why connected devices are difficult to patch.",
    topicId: "cloud-and-iot",
    difficulty: "Foundational",
    featured: false,
    blocks: [
      {
        type: "paragraph",
        text: "Cloud computing rents computing, storage, and managed services instead of running every machine locally. The Internet of Things adds small connected devices: cameras, sensors, badges, and appliances. Both shift where security decisions sit.",
      },
      { type: "heading", id: "shared-responsibility", text: "Shared responsibility" },
      {
        type: "paragraph",
        text: "A cloud provider secures the underlying platform: the physical sites, the virtualization layer, and many managed services. The customer still decides identities, access, encryption choices, and how data is configured. A storage bucket left open to the internet is a customer configuration, even when the provider's hardware is sound.",
      },
      {
        type: "illustration",
        diagram: "shared-responsibility",
        caption:
          "The provider secures the platform. The customer secures identities, configuration, and data. The split moves with the service, so a managed database is not the same contract as a raw virtual machine.",
      },
      { type: "heading", id: "iot-limits", text: "Why small devices lag" },
      {
        type: "paragraph",
        text: "Many devices ship with short default passwords that are printed in a manual. They may run for years, with little memory for security updates, and nobody assigned to patch them. A camera on a home or office network can become a doorway if it is exposed and still using those defaults.",
      },
      {
        type: "callout",
        title: "Change the password that came in the box",
        text: "If a manual publishes the default login, anyone who can reach the device can try it. Replacement credentials should be unique to that device.",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "shared-responsibility-data",
            prompt: "Under the cloud Shared Responsibility Model, who is responsible for configuring access policies and protecting data stored in a cloud bucket?",
            choices: [
              { id: "customer", label: "The customer" },
              { id: "provider", label: "The cloud platform provider" },
              { id: "isp", label: "The regional internet service provider" },
            ],
            correctChoiceId: "customer",
            explanation:
              "The cloud provider secures the physical hardware and hypervisors; the customer is responsible for configuring access rules, IAM permissions, and encrypting their data.",
          },
          {
            id: "iot-default-passwords",
            prompt: "Why are factory default credentials on IoT devices a major vulnerability?",
            choices: [
              { id: "indexed", label: "Default credentials are widely published and targeted by automated network scanners" },
              { id: "short", label: "Default passwords make the device hardware overheat" },
              { id: "wifi", label: "Default passwords disconnect the device from local Wi-Fi automatically" },
            ],
            correctChoiceId: "indexed",
            explanation:
              "Attackers use automated bots to scan IP addresses and attempt published default passwords across thousands of cameras and sensors simultaneously.",
          },
          {
            id: "iot-segmentation",
            prompt: "What is an effective defensive practice for deploying IoT devices on an enterprise network?",
            choices: [
              { id: "isolate-vlan", label: "Isolate IoT devices on a dedicated, firewalled VLAN with restricted egress" },
              { id: "bridge", label: "Connect all IoT devices directly to the domain controller network without a firewall" },
              { id: "disable-passwords", label: "Disable passwords entirely so cameras reboot faster" },
            ],
            correctChoiceId: "isolate-vlan",
            explanation:
              "Network segmentation prevents an infected or compromised edge device from becoming an easy pivot point into sensitive corporate subnets.",
          },
        ],
      },
    ],
  },
];

export const learningPaths: LearningPath[] = [
  {
    id: "security-foundations",
    title: "Security foundations",
    summary: "Start with the words security people actually use, then see how cloud services and small devices change the work.",
    lessonSlugs: ["cybersecurity-fundamentals", "cloud-and-iot-security"],
  },
  {
    id: "quantum-and-cryptography",
    title: "Quantum computing and cryptography",
    summary: "Move from qubits to the specific algorithms that matter for public-key encryption, then to the NIST standards.",
    lessonSlugs: [
      "quantum-computing-fundamentals",
      "quantum-computing-and-cryptography",
      "post-quantum-cryptography",
    ],
  },
  {
    id: "emerging-systems",
    title: "Emerging systems",
    summary: "Read how machine-learning models behave before you trust one inside a security decision.",
    lessonSlugs: ["artificial-intelligence"],
  },
];
