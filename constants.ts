
export interface ContraceptiveMethod {
  id: string;
  name: string;
  durationMonths?: number;
  durationYears?: number;
  description: string;
}

export const CONTRACEPTIVE_METHODS: ContraceptiveMethod[] = [
  {
    id: 'oral_pills',
    name: 'Oral Pills',
    durationMonths: 1,
    description: 'Daily pill, requires monthly follow-up for refills.'
  },
  {
    id: 'injectable',
    name: 'Injectables (Depo-Provera)',
    durationMonths: 3,
    description: 'Injection every 3 months.'
  },
  {
    id: 'implant_jadelle',
    name: 'Implants (Jadelle)',
    durationYears: 5,
    description: 'Long-acting reversible contraceptive (5 years).'
  },
  {
    id: 'implant_implanon',
    name: 'Implants (Implanon)',
    durationYears: 3,
    description: 'Long-acting reversible contraceptive (3 years).'
  },
  {
    id: 'iucd',
    name: 'IUCD',
    durationYears: 10,
    description: 'Intrauterine Contraceptive Device (up to 10 years).'
  },
  {
    id: 'condoms',
    name: 'Condoms',
    durationMonths: 1, // Default follow up for supply check
    description: 'Barrier method, no fixed medical return but supply check recommended.'
  }
];
