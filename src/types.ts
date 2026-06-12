export interface PatientRecord {
  id: string;
  age: number;
  gender: 'Male' | 'Female';
  admissionType: 'Elective' | 'Emergency' | 'Urgent';
  department: 'Cardiology' | 'Orthopedics' | 'Neurology' | 'Gastroenterology' | 'Pulmonology';
  severity: 'Minor' | 'Moderate' | 'Major' | 'Extreme';
  lengthOfStay: number;
  surgeryRequired: 'Yes' | 'No';
  comorbiditiesCount: number;
  charges: number;
}

export type StageId = 'Business' | 'DataUnderstanding' | 'Preparation' | 'Modeling' | 'Validation' | 'Deployment';

export interface StageInfo {
  id: StageId;
  index: number;
  title: string;
  shortDesc: string;
  icon: string;
}

export interface ModelMetrics {
  r2Train: number;
  r2Val: number;
  maeTrain: number;
  maeVal: number;
  mapeTrain: number;
  mapeVal: number;
}

export interface FeatureImportanceItem {
  feature: string;
  importance: number;
}

export interface ResidualItem {
  actual: number;
  predicted: number;
  residual: number;
  stay: number;
}
