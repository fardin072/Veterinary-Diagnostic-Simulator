import { useState, useCallback } from 'react';
import { VeterinaryCase, TestResult, DiagnosticTest, getDiagnosticTests } from '@/lib/veterinary-data';

export interface GameState {
  currentCase: VeterinaryCase | null;
  completedTests: TestResult[];
  selectedDiagnosis: string | null;
  selectedTreatments: string[];
  score: number;
  timeElapsed: number;
  gamePhase: 'intake' | 'diagnosis' | 'treatment' | 'results';
}

export function useVeterinaryGame() {
  const [gameState, setGameState] = useState<GameState>({
    currentCase: null,
    completedTests: [],
    selectedDiagnosis: null,
    selectedTreatments: [],
    score: 0,
    timeElapsed: 0,
    gamePhase: 'intake'
  });

  const startNewCase = useCallback((selectedCase: VeterinaryCase) => {
    setGameState({
      currentCase: selectedCase,
      completedTests: [],
      selectedDiagnosis: null,
      selectedTreatments: [],
      score: 0,
      timeElapsed: 0,
      gamePhase: 'intake'
    });
  }, []);

  const runDiagnosticTest = useCallback(async (test: DiagnosticTest) => {
    if (!gameState.currentCase) return;

    // Simulate test results based on the case
    const mockResult: TestResult = {
      testId: test.id,
      values: await generateMockTestResults(test, gameState.currentCase),
      abnormal: Math.random() > 0.7 // 30% chance of abnormal results
    };

    setGameState(prev => ({
      ...prev,
      completedTests: [...prev.completedTests, mockResult],
      timeElapsed: prev.timeElapsed + test.timeRequired
    }));
  }, [gameState.currentCase]);

  const submitDiagnosis = useCallback((diagnosis: string) => {
    setGameState(prev => ({
      ...prev,
      selectedDiagnosis: diagnosis,
      gamePhase: 'treatment'
    }));
  }, []);

  const submitTreatments = useCallback((treatments: string[]) => {
    if (!gameState.currentCase) return;

    // Calculate score based on accuracy
    const diagnosisScore = gameState.selectedDiagnosis === gameState.currentCase.correctDiagnosis ? 100 : 0;
    const treatmentScore = treatments.filter(t => 
      gameState.currentCase!.correctTreatments.includes(t)
    ).length * 25;
    const timeBonus = Math.max(0, 100 - Math.floor(gameState.timeElapsed / 10));

    const totalScore = Math.min(100, diagnosisScore + treatmentScore + timeBonus);

    setGameState(prev => ({
      ...prev,
      selectedTreatments: treatments,
      score: totalScore,
      gamePhase: 'results'
    }));
  }, [gameState.currentCase, gameState.selectedDiagnosis, gameState.timeElapsed]);

  const nextPhase = useCallback(() => {
    setGameState(prev => {
      const phases: GameState['gamePhase'][] = ['intake', 'diagnosis', 'treatment', 'results'];
      const currentIndex = phases.indexOf(prev.gamePhase);
      const nextIndex = Math.min(currentIndex + 1, phases.length - 1);
      return {
        ...prev,
        gamePhase: phases[nextIndex]
      };
    });
  }, []);

  return {
    gameState,
    startNewCase,
    runDiagnosticTest,
    submitDiagnosis,
    submitTreatments,
    nextPhase
  };
}

async function generateMockTestResults(test: DiagnosticTest, veterinaryCase: VeterinaryCase): Promise<Record<string, string | number>> {
  // Generate realistic test results based on the test type and case
  switch (test.id) {
    case 'physical-exam':
      return {
        temperature: '38.5°C',
        heartRate: '120 bpm',
        respiratoryRate: '24 rpm',
        bodyCondition: 'Normal',
        hydration: 'Adequate',
        mucousMembranes: 'Pink and moist'
      };
    case 'complete-blood-count':
      return {
        redBloodCells: '6.5 M/μL',
        whiteBloodCells: '12.0 K/μL',
        platelets: '450 K/μL',
        hematocrit: '45%',
        hemoglobin: '15.2 g/dL',
        neutrophils: '70%'
      };
    case 'biochemistry-panel':
      return {
        glucose: '95 mg/dL',
        BUN: '18 mg/dL',
        creatinine: '1.2 mg/dL',
        ALT: '45 U/L',
        albumin: '3.8 g/dL',
        totalProtein: '6.5 g/dL'
      };
    case 'electrolytes':
      return {
        sodium: '145 mEq/L',
        potassium: '4.2 mEq/L',
        chloride: '105 mEq/L',
        bicarbonate: '22 mEq/L'
      };
    case 'thyroid-panel':
      return {
        T4: '2.5 μg/dL',
        T3: '120 ng/dL',
        TSH: '0.5 mU/L'
      };
    case 'urinalysis':
      return {
        specificGravity: '1.025',
        protein: 'Trace',
        glucose: 'Negative',
        ketones: 'Negative',
        microscopy: 'Few epithelial cells',
        bacteria: 'None seen'
      };
    case 'radiography-chest':
      return {
        heart: 'Normal size and shape',
        lungs: 'Clear, no infiltrates',
        diaphragm: 'Intact',
        thoracicCavity: 'No free air or fluid'
      };
    case 'radiography-abdomen':
      return {
        stomach: 'Normal gas pattern',
        intestines: 'Normal appearance',
        liver: 'Normal size',
        kidneys: 'Bilateral, normal size'
      };
    case 'ultrasound-abdomen':
      return {
        liver: 'Normal echogenicity',
        gallbladder: 'No stones or sludge',
        kidneys: 'Normal architecture',
        bladder: 'Normal wall thickness'
      };
    case 'fecal-exam':
      return {
        parasites: 'None detected',
        consistency: 'Formed',
        color: 'Brown',
        blood: 'Not present'
      };
    case 'cytology':
      return {
        cellType: 'Mixed inflammatory cells',
        bacteria: 'Moderate numbers',
        neoplasticCells: 'Not identified',
        inflammation: 'Mild to moderate'
      };
    default:
      return {
        result: 'Normal findings',
        notes: 'No significant abnormalities detected',
        interpretation: 'Within normal limits'
      };
  }
}
