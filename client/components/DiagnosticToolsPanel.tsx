import { useState, useEffect } from 'react';
import { DiagnosticTest, getDiagnosticTests, TestResult } from '@/lib/veterinary-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface DiagnosticToolsPanelProps {
  onRunTest: (test: DiagnosticTest) => void;
  completedTests: TestResult[];
  timeElapsed: number;
  budget: number;
}

export function DiagnosticToolsPanel({ 
  onRunTest, 
  completedTests, 
  timeElapsed, 
  budget 
}: DiagnosticToolsPanelProps) {
  const [selectedTest, setSelectedTest] = useState<DiagnosticTest | null>(null);
  const [diagnosticTests, setDiagnosticTests] = useState<DiagnosticTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTests = async () => {
      try {
        const tests = await getDiagnosticTests();
        setDiagnosticTests(tests);
      } catch (error) {
        console.error('Error loading diagnostic tests:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTests();
  }, []);

  const testCategories = {
    physical: 'Physical Examination',
    blood: 'Blood Tests',
    imaging: 'Imaging Studies',
    urinalysis: 'Urinalysis',
    microbiology: 'Microbiology',
    pathology: 'Pathology',
    molecular: 'Molecular Testing',
    serology: 'Serology',
    advanced: 'Advanced Procedures'
  };

  const categorizedTests = Object.entries(testCategories).map(([category, label]) => ({
    category: category as DiagnosticTest['category'],
    label,
    tests: diagnosticTests.filter(test => test.category === category)
  })).filter(categoryGroup => categoryGroup.tests.length > 0);

  const totalCost = completedTests.reduce((sum, result) => {
    const test = diagnosticTests.find(t => t.id === result.testId);
    return sum + (test?.cost || 0);
  }, 0);

  const isTestCompleted = (testId: string) => 
    completedTests.some(result => result.testId === testId);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔄</div>
          <p className="text-medical-gray-600">Loading diagnostic tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-medical-gray-50 p-4 rounded-lg border border-medical-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm font-medium text-medical-gray-600">Time Elapsed</p>
            <p className="text-lg font-bold text-medical-gray-900">{timeElapsed} min</p>
          </div>
          <div>
            <p className="text-sm font-medium text-medical-gray-600">Budget Used</p>
            <p className="text-lg font-bold text-medical-gray-900">${totalCost}/{budget}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-medical-gray-600">Tests Run</p>
            <p className="text-lg font-bold text-medical-gray-900">{completedTests.length}</p>
          </div>
        </div>
      </div>

      {/* Diagnostic Tools by Category */}
      {categorizedTests.map(({ category, label, tests }) => (
        <Card key={category} className="border-medical-gray-200">
          <CardHeader className="bg-medical-teal-50">
            <CardTitle className="text-medical-teal-700">{label}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tests.map(test => {
                const isCompleted = isTestCompleted(test.id);
                const canAfford = totalCost + test.cost <= budget;

                return (
                  <div
                    key={test.id}
                    className={`border rounded-lg p-4 transition-all ${
                      isCompleted 
                        ? 'bg-medical-green-50 border-medical-green-200' 
                        : 'bg-white border-medical-gray-200 hover:border-medical-teal-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{test.icon}</span>
                        <div>
                          <h4 className="font-semibold text-medical-gray-900">{test.name}</h4>
                          <p className="text-sm text-medical-gray-600">{test.description}</p>
                        </div>
                      </div>
                      {isCompleted && (
                        <Badge className="bg-medical-green-100 text-medical-green-700">
                          ✓ Done
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-3 text-sm text-medical-gray-600">
                        <span>${test.cost}</span>
                        <span>{test.timeRequired} min</span>
                      </div>

                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedTest(test)}
                            >
                              Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <span className="text-2xl">{test.icon}</span>
                                {test.name}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <p className="text-medical-gray-700">{test.description}</p>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="font-medium text-medical-gray-900">Cost</p>
                                  <p className="text-medical-gray-600">${test.cost}</p>
                                </div>
                                <div>
                                  <p className="font-medium text-medical-gray-900">Time Required</p>
                                  <p className="text-medical-gray-600">{test.timeRequired} minutes</p>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button
                          onClick={() => onRunTest(test)}
                          disabled={isCompleted || !canAfford}
                          className={`${
                            isCompleted 
                              ? 'bg-medical-green-600 hover:bg-medical-green-700' 
                              : 'bg-medical-teal-600 hover:bg-medical-teal-700'
                          } text-white`}
                          size="sm"
                        >
                          {isCompleted ? 'Completed' : 'Run Test'}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
