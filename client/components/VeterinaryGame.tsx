import { useState, useEffect } from 'react';
import { useVeterinaryGame } from '@/hooks/use-veterinary-game';
import { VeterinaryCase, getRandomCase } from '@/lib/veterinary-data';
import { dbService } from '@/lib/indexeddb-service';
import { CaseListScreen } from './CaseListScreen';
import { StatisticsScreen } from './StatisticsScreen';
import { CaseIntakeScreen } from './CaseIntakeScreen';
import { DiagnosticToolsPanel } from './DiagnosticToolsPanel';
import { TestResultsViewer } from './TestResultsViewer';
import { DiagnosisTreatmentInterface } from './DiagnosisTreatmentInterface';
import { CaseResultsScreen } from './CaseResultsScreen';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type AppScreen = 'menu' | 'caseList' | 'statistics' | 'game';

export function VeterinaryGame() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('menu');
  const [selectedCase, setSelectedCase] = useState<VeterinaryCase | null>(null);
  const [initialized, setInitialized] = useState(false);

  const {
    gameState,
    startNewCase,
    runDiagnosticTest,
    submitDiagnosis,
    submitTreatments,
    nextPhase
  } = useVeterinaryGame();

  const [selectedDiagnosis, setSelectedDiagnosis] = useState('');
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'tools' | 'results'>('tools');

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await dbService.init();
      setInitialized(true);
    } catch (error) {
      console.error('Failed to initialize database:', error);
      setInitialized(true); // Continue anyway
    }
  };

  const handleStartRandomCase = async () => {
    try {
      const randomCase = await getRandomCase();
      if (randomCase) {
        setSelectedCase(randomCase);
        startNewCase(randomCase);
        setCurrentScreen('game');
      }
    } catch (error) {
      console.error('Error starting random case:', error);
    }
  };

  const handleStartSelectedCase = (case_: VeterinaryCase) => {
    setSelectedCase(case_);
    startNewCase(case_);
    setCurrentScreen('game');
  };

  const handleGameComplete = async (score: number, timeElapsed: number) => {
    if (!selectedCase) return;

    try {
      // Save game session
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await dbService.saveGameSession({
        id: sessionId,
        caseId: selectedCase.id,
        startTime: new Date(Date.now() - timeElapsed * 60000), // Approximate start time
        endTime: new Date(),
        score,
        timeElapsed,
        selectedDiagnosis: gameState.selectedDiagnosis || selectedDiagnosis,
        correctDiagnosis: selectedCase.correctDiagnosis,
        selectedTreatments: gameState.selectedTreatments,
        correctTreatments: selectedCase.correctTreatments,
        testsPerformed: gameState.completedTests.map(t => t.testId),
        difficulty: selectedCase.difficulty
      });

      // Mark case as completed
      await dbService.markCaseCompleted(selectedCase.id, score, selectedCase.difficulty);

      // Update user data
      const userData = await dbService.getUserData();
      const updatedUserData = {
        ...userData,
        gamesPlayed: userData.gamesPlayed + 1,
        totalScore: userData.totalScore + score,
        bestScore: Math.max(userData.bestScore, score),
        averageScore: (userData.totalScore + score) / (userData.gamesPlayed + 1),
        difficulty: {
          ...userData.difficulty,
          [selectedCase.difficulty]: (userData.difficulty[selectedCase.difficulty] || 0) + 1
        }
      };

      if (!userData.completedCases.includes(selectedCase.id)) {
        updatedUserData.completedCases.push(selectedCase.id);
      }

      await dbService.updateUserData(updatedUserData);
    } catch (error) {
      console.error('Error saving game data:', error);
    }
  };

  const handleBackToMenu = () => {
    setCurrentScreen('menu');
    setSelectedCase(null);
    // Reset game state if needed
  };

  if (!initialized) {
    return (
      <div className="min-h-screen bg-medical-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔄</div>
          <p className="text-medical-gray-600">Initializing application...</p>
        </div>
      </div>
    );
  }

  // Show screens based on current state
  if (currentScreen === 'caseList') {
    return (
      <CaseListScreen
        onSelectCase={handleStartSelectedCase}
        onViewStats={() => setCurrentScreen('statistics')}
      />
    );
  }

  if (currentScreen === 'statistics') {
    return (
      <StatisticsScreen
        onBackToMenu={handleBackToMenu}
      />
    );
  }

  if (currentScreen === 'game' && gameState.currentCase) {
    if (gameState.gamePhase === 'intake') {
      return (
        <div className="min-h-screen bg-medical-gray-50 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-4">
              <Button 
                onClick={handleBackToMenu}
                variant="outline"
                className="mb-4"
              >
                ← Back to Menu
              </Button>
            </div>
            <CaseIntakeScreen 
              case={gameState.currentCase} 
              onProceed={nextPhase}
            />
          </div>
        </div>
      );
    }

    if (gameState.gamePhase === 'diagnosis') {
      return (
        <div className="min-h-screen bg-medical-gray-50">
          {/* Header */}
          <div className="bg-white border-b border-medical-gray-200 p-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <Button 
                    onClick={handleBackToMenu}
                    variant="outline"
                    className="mb-2"
                  >
                    ← Back to Menu
                  </Button>
                  <h1 className="text-2xl font-bold text-medical-gray-900">
                    Diagnostic Workup: {gameState.currentCase.animal.name}
                  </h1>
                  <p className="text-medical-gray-600">
                    {gameState.currentCase.animal.species} • {gameState.currentCase.animal.age}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className="bg-medical-teal-100 text-medical-teal-700">
                    {gameState.currentCase.difficulty}
                  </Badge>
                  <Button
                    onClick={() => setActiveTab(activeTab === 'tools' ? 'results' : 'tools')}
                    variant="outline"
                  >
                    {activeTab === 'tools' ? 'View Results' : 'View Tools'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto p-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Left Panel - Tools or Results */}
              <div className="xl:col-span-2">
                {activeTab === 'tools' ? (
                  <DiagnosticToolsPanel
                    onRunTest={runDiagnosticTest}
                    completedTests={gameState.completedTests}
                    timeElapsed={gameState.timeElapsed}
                    budget={1000}
                  />
                ) : (
                  <TestResultsViewer
                    results={gameState.completedTests}
                    onProceedToDiagnosis={nextPhase}
                  />
                )}
              </div>

              {/* Right Panel - Summary */}
              <div className="space-y-6">
                <Card className="border-medical-gray-200">
                  <CardHeader className="bg-medical-gray-50">
                    <CardTitle className="text-medical-gray-900">Case Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-medical-gray-600 mb-1">Chief Complaint</p>
                        <p className="text-sm text-medical-gray-900">
                          {gameState.currentCase.ownerReport.chiefComplaint}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-medical-gray-600 mb-1">Duration</p>
                        <p className="text-sm text-medical-gray-900">
                          {gameState.currentCase.ownerReport.duration}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-medical-gray-600 mb-1">Observable Symptoms</p>
                        <div className="space-y-1">
                          {gameState.currentCase.symptoms
                            .filter(s => s.visible)
                            .map(symptom => (
                              <p key={symptom.id} className="text-sm text-medical-gray-900">
                                • {symptom.description}
                              </p>
                            ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {gameState.completedTests.length > 0 && (
                  <div className="text-center">
                    <Button 
                      onClick={nextPhase}
                      className="w-full bg-medical-green-600 hover:bg-medical-green-700 text-white py-3"
                    >
                      Make Diagnosis
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (gameState.gamePhase === 'treatment') {
      return (
        <div className="min-h-screen bg-medical-gray-50 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-4">
              <Button 
                onClick={handleBackToMenu}
                variant="outline"
                className="mb-4"
              >
                ← Back to Menu
              </Button>
            </div>
            <DiagnosisTreatmentInterface
              case={gameState.currentCase}
              onSubmit={(diagnosis, treatments) => {
                setSelectedDiagnosis(diagnosis);
                setSelectedTreatments(treatments);
                submitTreatments(treatments);
                handleGameComplete(gameState.score, gameState.timeElapsed);
              }}
            />
          </div>
        </div>
      );
    }

    if (gameState.gamePhase === 'results') {
      return (
        <div className="min-h-screen bg-medical-gray-50 p-6">
          <div className="max-w-6xl mx-auto">
            <CaseResultsScreen
              case={gameState.currentCase}
              selectedDiagnosis={gameState.selectedDiagnosis || selectedDiagnosis}
              selectedTreatments={gameState.selectedTreatments}
              score={gameState.score}
              timeElapsed={gameState.timeElapsed}
              onNewCase={handleBackToMenu}
            />
          </div>
        </div>
      );
    }
  }

  // Main menu
  return (
    <div className="min-h-screen bg-medical-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center bg-medical-teal-50">
          <CardTitle className="text-3xl text-medical-teal-700 mb-2">
            🏥 Veterinary Diagnostic Simulator
          </CardTitle>
          <p className="text-medical-gray-600">
            Master veterinary diagnostics with realistic clinical cases
          </p>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🩺</div>
              <p className="text-medical-gray-700 mb-4">
                Practice diagnostic skills with 50 challenging veterinary cases covering multiple species and conditions.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={handleStartRandomCase}
                className="w-full bg-medical-teal-600 hover:bg-medical-teal-700 text-white py-4 text-lg"
              >
                🎲 Random Case
              </Button>
              <Button 
                onClick={() => setCurrentScreen('caseList')}
                variant="outline"
                className="w-full py-4 text-lg border-medical-gray-300"
              >
                📚 Browse Cases
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={() => setCurrentScreen('statistics')}
                variant="outline"
                className="w-full py-4 text-lg border-medical-gray-300"
              >
                📊 Statistics
              </Button>
              <Button 
                variant="outline"
                className="w-full py-4 text-lg border-medical-gray-300"
                disabled
              >
                ⚙️ Settings
              </Button>
            </div>

            <div className="bg-medical-gray-100 rounded-lg p-4 text-center">
              <p className="text-sm text-medical-gray-600">
                Challenge yourself with realistic diagnostic scenarios. Build pattern recognition and clinical reasoning skills through evidence-based veterinary medicine.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
