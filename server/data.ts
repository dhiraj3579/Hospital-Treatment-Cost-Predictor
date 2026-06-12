export interface PatientRecord {
  id: string;
  age: number;
  gender: 'Male' | 'Female';
  admissionType: 'Elective' | 'Emergency' | 'Urgent';
  department: 'Cardiology' | 'Orthopedics' | 'Neurology' | 'Gastroenterology' | 'Pulmonology';
  severity: 'Minor' | 'Moderate' | 'Major' | 'Extreme';
  lengthOfStay: number; // in days
  surgeryRequired: 'Yes' | 'No';
  comorbiditiesCount: number; // 0 to 3
  charges: number; // Package pricing cost in USD
}

// Generate a deterministic but highly realistic dataset of 120 patients
// using a mathematical formula with added continuous pseudo-random noise
const DEPARTMENTS = ['Cardiology', 'Orthopedics', 'Neurology', 'Gastroenterology', 'Pulmonology'] as const;
const SEVERITIES = ['Minor', 'Moderate', 'Major', 'Extreme'] as const;
const ADMISSION_TYPES = ['Elective', 'Emergency', 'Urgent'] as const;

function generatePatientData(): PatientRecord[] {
  const records: PatientRecord[] = [];
  
  // Custom seed generator for deterministic random-like noise
  let seed = 42;
  function random(): number {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  // Create 120 patient stories
  for (let i = 1; i <= 120; i++) {
    const id = `MH-${1000 + i}`;
    
    // Probabilistic selections
    const departmentVal = DEPARTMENTS[Math.floor(random() * DEPARTMENTS.length)];
    const severityVal = SEVERITIES[Math.floor(random() * SEVERITIES.length)];
    const admissionTypeVal = ADMISSION_TYPES[Math.floor(random() * ADMISSION_TYPES.length)];
    const genderVal = random() > 0.48 ? 'Female' : 'Male';
    
    // Normal distributions based on departments
    let age = Math.floor(45 + random() * 35); // 45 to 80
    if (departmentVal === 'Gastroenterology') age = Math.floor(25 + random() * 45); // younger mix, 25 to 70
    
    let lengthOfStay = 1;
    if (severityVal === 'Minor') lengthOfStay = Math.floor(1 + random() * 3); // 1-3 days
    else if (severityVal === 'Moderate') lengthOfStay = Math.floor(2 + random() * 5); // 2-6 days
    else if (severityVal === 'Major') lengthOfStay = Math.floor(4 + random() * 7); // 4-10 days
    else lengthOfStay = Math.floor(6 + random() * 12); // 6-17 days

    // Surgery is highly correlated with specific departments/severities
    let surgeryRequired: 'Yes' | 'No' = 'No';
    if (departmentVal === 'Orthopedics') surgeryRequired = 'Yes'; // almost always surgery
    else if (departmentVal === 'Cardiology' && (severityVal === 'Major' || severityVal === 'Extreme')) surgeryRequired = 'Yes';
    else if (departmentVal === 'Gastroenterology' && random() > 0.4) surgeryRequired = 'Yes';
    else if (random() > 0.8) surgeryRequired = 'Yes';

    const comorbiditiesCount = Math.floor(random() * 4 * (age / 65)); // older patients have more comorbidities

    // Formulate charges with complex relationships
    let baseCharge = 0;
    let dailyRate = 0;
    let surgeryFee = 0;
    
    switch (departmentVal) {
      case 'Cardiology':
        baseCharge = 12000;
        dailyRate = 1800;
        surgeryFee = 16000;
        break;
      case 'Orthopedics':
        baseCharge = 7500;
        dailyRate = 1100;
        surgeryFee = 13500;
        break;
      case 'Neurology':
        baseCharge = 9500;
        dailyRate = 1600;
        surgeryFee = 18000;
        break;
      case 'Gastroenterology':
        baseCharge = 4500;
        dailyRate = 900;
        surgeryFee = 6500;
        break;
      case 'Pulmonology':
        baseCharge = 5500;
        dailyRate = 1000;
        surgeryFee = 5500;
        break;
    }

    // Adjustments
    let severityMultiplier = 1.0;
    if (severityVal === 'Moderate') severityMultiplier = 1.2;
    else if (severityVal === 'Major') severityMultiplier = 1.55;
    else if (severityVal === 'Extreme') severityMultiplier = 1.95;

    let calCharges = (baseCharge + (lengthOfStay * dailyRate)) * severityMultiplier;
    
    if (surgeryRequired === 'Yes') {
      calCharges += surgeryFee;
    }

    // Add comorbidity surcharge
    calCharges += comorbiditiesCount * 1800;

    // Age escalation
    if (age > 60) {
      calCharges += (age - 60) * 150;
    }

    // Urgent / Emergency surcharge
    if (admissionTypeVal === 'Emergency') calCharges += 2500;
    else if (admissionTypeVal === 'Urgent') calCharges += 1200;

    // Add continuous variance noise (e.g., +/- 10% gaussian noise with standard deviations)
    const noisePercentage = 0.08 * (random() - 0.5); // -4% to +4%
    calCharges = calCharges * (1 + noisePercentage);

    // Final round to nearest dollar
    const charges = Math.round(calCharges);

    records.push({
      id,
      age,
      gender: genderVal,
      admissionType: admissionTypeVal,
      department: departmentVal,
      severity: severityVal,
      lengthOfStay,
      surgeryRequired,
      comorbiditiesCount,
      charges,
    });
  }

  return records;
}

export const HOSPITAL_DATASET = generatePatientData();
