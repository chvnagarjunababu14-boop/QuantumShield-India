import type { CommunityTopic } from "../types/community";

export const COMMUNITY_TOPICS: CommunityTopic[] = [
  {
    id: "cybersecurity",
    name: "Cybersecurity",
    description:
      "Defensive engineering, threats, vulnerabilities, incident response, and resilient security architectures.",
    badgeColor: "bg-blue-100 text-blue-900 border-blue-200",
  },
  {
    id: "quantum-computing",
    name: "Quantum Computing",
    description:
      "Qubits, quantum superposition, entanglement, circuit models, and experimental hardware platforms.",
    badgeColor: "bg-purple-100 text-purple-900 border-purple-200",
  },
  {
    id: "post-quantum-cryptography",
    name: "Post-Quantum Cryptography",
    description:
      "Lattice-based mathematics, NIST PQC standards (ML-KEM, ML-DSA, SLH-DSA), and migration roadmaps.",
    badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-200",
  },
  {
    id: "artificial-intelligence",
    name: "Artificial Intelligence",
    description:
      "Machine learning safety, model extraction, prompt injection, and cryptographic data governance.",
    badgeColor: "bg-amber-100 text-amber-900 border-amber-200",
  },
  {
    id: "cloud-computing",
    name: "Cloud Computing",
    description:
      "Zero Trust architecture, cloud workloads, IAM least-privilege, and microservice isolation.",
    badgeColor: "bg-cyan-100 text-cyan-900 border-cyan-200",
  },
  {
    id: "iot-emerging-tech",
    name: "IoT and Emerging Technology",
    description:
      "Embedded hardware security, OTA firmware updates, sensor networks, and supply-chain assurance.",
    badgeColor: "bg-rose-100 text-rose-900 border-rose-200",
  },
];

export function getTopicById(id: string): CommunityTopic | undefined {
  return COMMUNITY_TOPICS.find((t) => t.id === id);
}

export function isValidTopicId(id: string): boolean {
  return COMMUNITY_TOPICS.some((t) => t.id === id);
}
