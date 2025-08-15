export interface Animal {
  id: string;
  species: 'dog' | 'cat' | 'horse' | 'bird' | 'reptile' | 'livestock' | 'exotic';
  name: string;
  age: string;
  breed?: string;
  weight?: string;
  sex: 'male' | 'female' | 'unknown';
}

export interface Symptom {
  id: string;
  description: string;
  severity: 'mild' | 'moderate' | 'severe';
  visible: boolean;
}

export interface OwnerReport {
  chiefComplaint: string;
  duration: string;
  progression: string;
  additionalNotes: string;
}

export interface DiagnosticTest {
  id: string;
  name: string;
  category: 'physical' | 'blood' | 'imaging' | 'urinalysis' | 'microbiology' | 'pathology' | 'molecular' | 'serology' | 'advanced';
  cost: number;
  timeRequired: number; // in minutes
  description: string;
  icon: string;
}

export interface TestResult {
  testId: string;
  values: Record<string, string | number>;
  interpretation?: string;
  abnormal: boolean;
}

export interface Treatment {
  id: string;
  name: string;
  category: 'medication' | 'surgery' | 'supportive' | 'diagnostic';
  description: string;
  contraindications?: string[];
}

export interface VeterinaryCase {
  id: string;
  title: string;
  difficulty: 'medium' | 'hard';
  animal: Animal;
  symptoms: Symptom[];
  ownerReport: OwnerReport;
  correctDiagnosis: string;
  possibleDiagnoses: string[];
  recommendedTests: string[];
  correctTreatments: string[];
  completed: boolean;
}

// Load data from JSON file
let veterinaryData: { diagnosticTests: DiagnosticTest[], cases: VeterinaryCase[] } | null = null;

export async function loadVeterinaryData() {
  if (!veterinaryData) {
    try {
      const response = await fetch('/veterinary-cases.json');
      if (!response.ok) {
        throw new Error('Failed to load veterinary data');
      }
      veterinaryData = await response.json();
    } catch (error) {
      console.error('Error loading veterinary data:', error);
      // Fallback to empty data
      veterinaryData = { diagnosticTests: [], cases: [] };
    }
  }
  return veterinaryData;
}

export async function getDiagnosticTests(): Promise<DiagnosticTest[]> {
  const data = await loadVeterinaryData();
  return data.diagnosticTests;
}

export async function getAllCases(): Promise<VeterinaryCase[]> {
  const data = await loadVeterinaryData();
  return data.cases;
}

export async function getCaseById(id: string): Promise<VeterinaryCase | undefined> {
  const data = await loadVeterinaryData();
  return data.cases.find(case_ => case_.id === id);
}

export async function getCasesByDifficulty(difficulty: 'medium' | 'hard'): Promise<VeterinaryCase[]> {
  const data = await loadVeterinaryData();
  return data.cases.filter(case_ => case_.difficulty === difficulty);
}

export async function getRandomCase(difficulty?: 'medium' | 'hard'): Promise<VeterinaryCase | undefined> {
  const data = await loadVeterinaryData();
  let cases = data.cases;
  
  if (difficulty) {
    cases = cases.filter(case_ => case_.difficulty === difficulty);
  }
  
  if (cases.length === 0) return undefined;
  
  const randomIndex = Math.floor(Math.random() * cases.length);
  return cases[randomIndex];
}

// Export for backward compatibility
export const diagnosticTests = getDiagnosticTests;
export const sampleCases = getAllCases;
