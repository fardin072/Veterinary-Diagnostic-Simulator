import { useState, useEffect } from 'react';
import { TestResult, getDiagnosticTests, DiagnosticTest } from '@/lib/veterinary-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

interface TestResultsViewerProps {
  results: TestResult[];
  onProceedToDiagnosis: () => void;
}

export function TestResultsViewer({ results, onProceedToDiagnosis }: TestResultsViewerProps) {
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

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔄</div>
        <p className="text-medical-gray-600">Loading test results...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔬</div>
        <h3 className="text-xl font-semibold text-medical-gray-700 mb-2">
          No Test Results Yet
        </h3>
        <p className="text-medical-gray-600">
          Run diagnostic tests to see results here
        </p>
      </div>
    );
  }

  const groupedResults = results.reduce((acc, result) => {
    const test = diagnosticTests.find(t => t.id === result.testId);
    if (test) {
      if (!acc[test.category]) {
        acc[test.category] = [];
      }
      acc[test.category].push({ result, test });
    }
    return acc;
  }, {} as Record<string, Array<{ result: TestResult; test: DiagnosticTest }>>);

  const categoryLabels = {
    physical: 'Physical Examination',
    blood: 'Blood Work',
    imaging: 'Imaging',
    urinalysis: 'Urinalysis',
    microbiology: 'Microbiology',
    pathology: 'Pathology',
    molecular: 'Molecular Testing',
    serology: 'Serology',
    advanced: 'Advanced Procedures'
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-medical-gray-900 mb-2">
          Test Results
        </h2>
        <p className="text-medical-gray-600">
          Review all diagnostic findings before making your diagnosis
        </p>
      </div>

      <Tabs defaultValue={Object.keys(groupedResults)[0]} className="w-full">
        <TabsList className="grid w-full bg-medical-gray-100" style={{gridTemplateColumns: `repeat(${Object.keys(groupedResults).length}, 1fr)`}}>
          {Object.entries(groupedResults).map(([category, _]) => (
            <TabsTrigger 
              key={category} 
              value={category}
              className="data-[state=active]:bg-medical-teal-600 data-[state=active]:text-white"
            >
              {categoryLabels[category as keyof typeof categoryLabels]}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(groupedResults).map(([category, categoryResults]) => (
          <TabsContent key={category} value={category}>
            <div className="space-y-4">
              {categoryResults.map(({ result, test }) => (
                <Card key={result.testId} className="border-medical-gray-200">
                  <CardHeader className="bg-medical-gray-50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-medical-gray-900 flex items-center gap-2">
                        <span className="text-xl">{test.icon}</span>
                        {test.name}
                      </CardTitle>
                      <Badge 
                        variant={result.abnormal ? "destructive" : "secondary"}
                        className={result.abnormal ? 
                          "bg-red-100 text-red-700" : 
                          "bg-medical-green-100 text-medical-green-700"
                        }
                      >
                        {result.abnormal ? 'Abnormal' : 'Normal'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Test Values */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(result.values).map(([key, value]) => (
                          <div 
                            key={key}
                            className="bg-white border border-medical-gray-200 rounded-lg p-3"
                          >
                            <p className="text-xs font-medium text-medical-gray-600 uppercase tracking-wide mb-1">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </p>
                            <p className="text-lg font-semibold text-medical-gray-900">
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Interpretation */}
                      {result.interpretation && (
                        <div className="bg-medical-teal-50 border border-medical-teal-200 rounded-lg p-4">
                          <h4 className="font-semibold text-medical-teal-800 mb-2">
                            Clinical Interpretation
                          </h4>
                          <p className="text-medical-teal-700">{result.interpretation}</p>
                        </div>
                      )}

                      {/* Reference Ranges (Mock data for educational purposes) */}
                      {category === 'blood' && (
                        <div className="bg-medical-gray-50 border border-medical-gray-200 rounded-lg p-4">
                          <h4 className="font-semibold text-medical-gray-800 mb-2">
                            Reference Ranges
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-medical-gray-700">
                            <p>• RBC: 5.5-8.5 M/μL</p>
                            <p>• WBC: 6.0-17.0 K/μL</p>
                            <p>• Platelets: 200-500 K/μL</p>
                            <p>• Hematocrit: 37-55%</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Proceed to Diagnosis */}
      <div className="flex justify-center pt-6">
        <Button 
          onClick={onProceedToDiagnosis}
          className="bg-medical-teal-600 hover:bg-medical-teal-700 text-white px-8 py-3 text-lg"
        >
          Proceed to Diagnosis
        </Button>
      </div>
    </div>
  );
}
