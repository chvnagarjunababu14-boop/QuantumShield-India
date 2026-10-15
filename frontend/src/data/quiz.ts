export type Topic = 'phishing' | 'passwords' | 'mfa' | 'privacy' | 'encryption' | 'quantum'

export interface Question {
  id: string
  topic: Topic
  prompt: string
  options: string[]
  answer: number
  explanation: string
}

export const TOPIC_LABEL: Record<Topic, string> = {
  phishing: 'Phishing',
  passwords: 'Password security',
  mfa: 'Multi-factor authentication',
  privacy: 'Data privacy',
  encryption: 'Encryption',
  quantum: 'Quantum-related crypto risk',
}

export const TOPIC_TIPS: Record<Topic, string> = {
  phishing:
    'Pause before clicking. Check the sender address and link destination, and never share OTPs, PINs or passwords - banks and government agencies will never ask for them by SMS, call or email. Report suspected fraud at cybercrime.gov.in or helpline 1930.',
  passwords:
    'Use a password manager to create long, unique passwords (or passphrases) for every account. Never reuse your email or banking password elsewhere.',
  mfa:
    'Turn on multi-factor authentication for email, banking and social media. Prefer authenticator apps or passkeys over SMS where available, and never approve a login prompt you did not start.',
  privacy:
    'Share personal data (Aadhaar, PAN, bank details) only when necessary and with trusted parties. Review app permissions and use masked Aadhaar where accepted.',
  encryption:
    'Look for HTTPS before entering data, keep devices and apps updated, and enable device encryption and screen locks on phones and laptops.',
  quantum:
    "Quantum computers threaten today's public-key cryptography (RSA, ECC), not AES-256 in the same way. Organisations should inventory their cryptography and plan migration to post-quantum standards like ML-KEM and ML-DSA.",
}

export const QUESTIONS: Question[] = [
  {
    id: 'ph1',
    topic: 'phishing',
    prompt: 'You receive an SMS: "Your bank KYC expires today. Click this link to update or your account will be blocked." What should you do?',
    options: [
      'Click the link quickly so the account is not blocked',
      'Reply with your account number to verify',
      'Ignore the link and contact the bank using the number on its official website or your card',
      'Forward it to friends to warn them, then click the link',
    ],
    answer: 2,
    explanation: 'Urgency and threats are classic phishing tactics. Always reach your bank through official channels you already trust, never through links in unsolicited messages.',
  },
  {
    id: 'ph2',
    topic: 'phishing',
    prompt: 'Which sign most strongly suggests an email is a phishing attempt?',
    options: [
      'It has a company logo',
      'The link text says "sbi.co.in" but hovering shows "sbi-secure-update.xyz"',
      'It was sent during office hours',
      'It addresses you by name',
    ],
    answer: 1,
    explanation: 'A mismatch between displayed text and the real link destination is a strong warning sign. Logos and your name are easy for attackers to copy.',
  },
  {
    id: 'pw1',
    topic: 'passwords',
    prompt: 'Which of these is the strongest approach to passwords?',
    options: [
      'Long, unique passwords for each account, stored in a reputable password manager',
      'One complex password used for every site',
      'Your date of birth with a special character',
      'Writing all passwords in a notes app on your phone',
    ],
    answer: 0,
    explanation: 'Unique passwords stop one breach from unlocking all your accounts, and a password manager makes long unique passwords practical.',
  },
  {
    id: 'pw2',
    topic: 'passwords',
    prompt: 'A website you use announces a data breach. What is the best first step?',
    options: [
      'Do nothing if you have not seen suspicious activity',
      'Change that password, and change it anywhere else you reused it',
      'Delete your email account',
      'Add "1" to the end of your current password',
    ],
    answer: 1,
    explanation: 'Attackers try leaked passwords on other sites ("credential stuffing"). Change the breached password and any reused copies, and enable MFA.',
  },
  {
    id: 'mfa1',
    topic: 'mfa',
    prompt: 'A caller claiming to be from your bank asks you to read out the OTP you just received. What should you do?',
    options: [
      'Share it - they already know your name, so they must be genuine',
      'Share only the first three digits',
      'Never share it; hang up and call the bank yourself on its official number',
      'Ask them to send it again first',
    ],
    answer: 2,
    explanation: 'An OTP is the second factor that protects your account. Genuine bank staff never ask for it. Sharing it hands over your account.',
  },
  {
    id: 'mfa2',
    topic: 'mfa',
    prompt: 'Your phone shows a login approval request you did not trigger. What does this most likely mean?',
    options: [
      'A system glitch - approve it to make it go away',
      'Your phone needs a restart',
      'The app is checking your location',
      'Someone may already have your password; deny it and change your password',
    ],
    answer: 3,
    explanation: 'Unexpected MFA prompts often mean an attacker has your password and is hoping you will tap "approve" (MFA fatigue). Deny it and change your password.',
  },
  {
    id: 'pr1',
    topic: 'privacy',
    prompt: 'A free quiz app asks for access to your contacts, SMS and location to show your "personality type". What is the safest choice?',
    options: [
      'Allow all - the app is free',
      'Allow contacts only',
      'Allow, then uninstall later',
      'Deny unnecessary permissions or avoid the app',
    ],
    answer: 3,
    explanation: 'Grant only permissions an app genuinely needs. SMS access can expose OTPs, and contact lists expose other people\u2019s data.',
  },
  {
    id: 'pr2',
    topic: 'privacy',
    prompt: 'When a hotel asks for identity proof, which option shares the least personal data?',
    options: [
      'A full photocopy of your Aadhaar card',
      'A masked Aadhaar showing only the last four digits, where accepted',
      'Your bank passbook',
      'Your PAN card and a cancelled cheque',
    ],
    answer: 1,
    explanation: 'Data minimisation means sharing only what is necessary. Masked Aadhaar hides most of the number and is accepted by many service providers.',
  },
  {
    id: 'en1',
    topic: 'encryption',
    prompt: 'What does HTTPS (the padlock in the browser) guarantee?',
    options: [
      'The connection between your browser and the site is encrypted',
      'The website is trustworthy and not a scam',
      'The site cannot be hacked',
      'Your data is never stored by the site',
    ],
    answer: 0,
    explanation: 'HTTPS protects data in transit. Phishing sites can also use HTTPS, so it does not prove a site is legitimate.',
  },
  {
    id: 'en2',
    topic: 'encryption',
    prompt: 'Why is enabling full-device encryption on your laptop or phone useful?',
    options: [
      'It makes the device faster',
      'It protects your data if the device is lost or stolen',
      'It blocks all malware',
      'It replaces the need for a screen lock',
    ],
    answer: 1,
    explanation: 'Device encryption keeps stored data unreadable without your unlock credentials, which matters most when a device is lost or stolen.',
  },
  {
    id: 'q1',
    topic: 'quantum',
    prompt: 'Which type of cryptography is most directly threatened by a sufficiently capable quantum computer running Shor\u2019s algorithm?',
    options: [
      'AES-256 symmetric encryption',
      'Public-key cryptography such as RSA and elliptic-curve cryptography',
      'SHA-256 hashing',
      'Password managers',
    ],
    answer: 1,
    explanation: 'Shor\u2019s algorithm efficiently solves factoring and discrete logarithms, which underpin RSA and ECC. AES and SHA-256 face only a smaller, generic speed-up from Grover\u2019s algorithm.',
  },
  {
    id: 'q2',
    topic: 'quantum',
    prompt: 'What is a "harvest now, decrypt later" attack?',
    options: [
      'A ransomware attack that waits a week before encrypting files',
      'Cracking passwords during off-peak hours',
      'Recording encrypted data today to decrypt it if a capable quantum computer becomes available',
      'Stealing crops using drones',
    ],
    answer: 2,
    explanation: 'Adversaries can store encrypted traffic now. Data that must stay confidential for many years is at risk even before quantum computers exist, which is why migration to post-quantum cryptography should be planned early.',
  },
]
