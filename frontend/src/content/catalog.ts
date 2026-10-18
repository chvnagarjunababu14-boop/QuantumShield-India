import type { LearningPath, Lesson, Topic } from "./types";

export const topics: Topic[] = [
  {
    id: "cybersecurity",
    title: "Cybersecurity",
    summary: "How people protect systems and data, and why no single control is enough.",
  },
  {
    id: "quantum-computing",
    title: "Quantum computing",
    summary: "What qubits add to computing, and which claims are still open engineering problems.",
  },
  {
    id: "cryptography",
    title: "Cryptography",
    summary: "How public-key encryption relates to quantum algorithms and newer standards.",
  },
  {
    id: "artificial-intelligence",
    title: "Artificial intelligence",
    summary: "What machine-learning models do with data, and where their limits matter.",
  },
  {
    id: "cloud-and-iot",
    title: "Cloud and IoT",
    summary: "How responsibility is split in the cloud, and why small devices are hard to keep updated.",
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
