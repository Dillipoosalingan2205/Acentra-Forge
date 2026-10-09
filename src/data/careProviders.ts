import { CareProvider } from '../types/aegis';

export const HEALTHCARE_PROVIDERS: CareProvider[] = [
  {
    id: 'prov-1',
    name: 'Apollo Diagnostic & Imaging Center',
    facility_type: 'Diagnostic Center',
    specialty: 'Ultrasound, Blood Tests, LFT, Radiology',
    rating: 4.8,
    reviews_count: 342,
    distance_km: 1.4,
    phone: '+91 80 2630 1100',
    address: '42 MG Road, Sector 4, Bangalore',
    open_hours: '07:00 AM - 09:00 PM (Mon-Sun)',
    booking_available: true,
  },
  {
    id: 'prov-2',
    name: 'Max Healthcare Surgical Outpatient Clinic',
    facility_type: 'Surgical Clinic',
    specialty: 'General Surgery, Laparoscopy, Wound Care',
    rating: 4.9,
    reviews_count: 512,
    distance_km: 2.8,
    phone: '+91 11 4055 4000',
    address: 'Suite 204, MedCity Pavilion, Outer Ring Road',
    open_hours: '09:00 AM - 06:00 PM (Mon-Sat)',
    booking_available: true,
  },
  {
    id: 'prov-3',
    name: 'Fortis Heart & Vascular Institute',
    facility_type: 'Specialty Hospital',
    specialty: 'Cardiology, Interventional Follow-up, Cardiac Rehab',
    rating: 4.9,
    reviews_count: 620,
    distance_km: 3.2,
    phone: '+91 22 6799 4444',
    address: 'B-Block, Heart Care Towers, Sector 12',
    open_hours: '24/7 OPD & Emergency',
    booking_available: true,
  },
  {
    id: 'prov-4',
    name: 'Medall Care Diagnostics & Pathology Lab',
    facility_type: 'Clinical Laboratory',
    specialty: 'Blood Chemistry, Lipid Panel, Renal Function, Home Sample Collection',
    rating: 4.7,
    reviews_count: 215,
    distance_km: 0.9,
    phone: '+91 44 4344 7777',
    address: '15 Anna Salai, Next to Metro Gate 2',
    open_hours: '06:30 AM - 08:30 PM (Mon-Sun)',
    booking_available: true,
  },
  {
    id: 'prov-5',
    name: 'VitalHealth Clinical Nutrition & Dietetics',
    facility_type: 'Nutrition Clinic',
    specialty: 'Post-Cholecystectomy Diet, Diabetic Meal Planning, Cardiac Nutrition',
    rating: 4.9,
    reviews_count: 128,
    distance_km: 2.1,
    phone: '+91 80 4122 8899',
    address: '108 Green Park Avenue, 2nd Floor',
    open_hours: '10:00 AM - 07:00 PM (Mon-Fri)',
    booking_available: true,
  },
  {
    id: 'prov-6',
    name: 'Portea In-Home Nursing & Physiotherapy',
    facility_type: 'Home Healthcare',
    specialty: 'Post-Op Knee Rehab, Sterile Dressing Changes, Gait Training',
    rating: 4.7,
    reviews_count: 489,
    distance_km: 1.8,
    phone: '+91 80 3355 4555',
    address: 'Dispatched to Patient Home / Citywide',
    open_hours: '08:00 AM - 08:00 PM (Daily)',
    booking_available: true,
  },
  {
    id: 'prov-7',
    name: 'Orthocare Joint Replacement & Physical Therapy Hub',
    facility_type: 'Ortho Specialty Center',
    specialty: 'Orthopedic Rehabilitation, X-Ray Imaging, Stitch/Staple Removal',
    rating: 4.8,
    reviews_count: 310,
    distance_km: 3.5,
    phone: '+91 44 2828 9000',
    address: '88 Sterling Road, Nungambakkam',
    open_hours: '08:30 AM - 07:30 PM (Mon-Sat)',
    booking_available: true,
  },
];

export function matchProvidersForQuery(query: string, specialtyHint: string): CareProvider[] {
  const q = (query + ' ' + specialtyHint).toLowerCase();
  const scored = HEALTHCARE_PROVIDERS.map((provider) => {
    let score = 0;
    const combined = (provider.name + ' ' + provider.facility_type + ' ' + provider.specialty).toLowerCase();
    
    if (q.includes('ultrasound') || q.includes('scan') || q.includes('lft') || q.includes('lab') || q.includes('blood') || q.includes('lipid') || q.includes('creatinine')) {
      if (combined.includes('diagnostic') || combined.includes('lab') || combined.includes('ultrasound') || combined.includes('imaging')) score += 5;
    }
    if (q.includes('surgical') || q.includes('surgeon') || q.includes('opd') || q.includes('wound') || q.includes('gupta') || q.includes('append')) {
      if (combined.includes('surgical') || combined.includes('laparoscopy')) score += 5;
    }
    if (q.includes('cardio') || q.includes('heart') || q.includes('stent') || q.includes('deshmukh') || q.includes('pci')) {
      if (combined.includes('heart') || combined.includes('cardiology')) score += 5;
    }
    if (q.includes('nutrition') || q.includes('diet') || q.includes('gallbladder diet') || q.includes('food')) {
      if (combined.includes('nutrition') || combined.includes('diet')) score += 6;
    }
    if (q.includes('physio') || q.includes('knee') || q.includes('rehab') || q.includes('ortho') || q.includes('staple')) {
      if (combined.includes('physiotherapy') || combined.includes('ortho') || combined.includes('nursing')) score += 6;
    }
    
    // partial token matching
    const tokens = q.split(/[\s,]+/);
    tokens.forEach((t) => {
      if (t.length > 3 && combined.includes(t)) score += 1;
    });

    return { provider, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored.filter((s) => s.score > 0).map((s) => s.provider);
  return best.length > 0 ? best.slice(0, 3) : HEALTHCARE_PROVIDERS.slice(0, 2);
}
