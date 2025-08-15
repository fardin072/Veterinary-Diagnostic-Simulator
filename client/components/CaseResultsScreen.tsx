import { VeterinaryCase } from '@/lib/veterinary-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CaseResultsScreenProps {
  case: VeterinaryCase;
  selectedDiagnosis: string;
  selectedTreatments: string[];
  score: number;
  timeElapsed: number;
  onNewCase: () => void;
}

export function CaseResultsScreen({
  case: veterinaryCase,
  selectedDiagnosis,
  selectedTreatments,
  score,
  timeElapsed,
  onNewCase
}: CaseResultsScreenProps) {
  const isCorrectDiagnosis = selectedDiagnosis === veterinaryCase.correctDiagnosis;
  const correctTreatments = selectedTreatments.filter(t => 
    veterinaryCase.correctTreatments.includes(t)
  );
  const incorrectTreatments = selectedTreatments.filter(t => 
    !veterinaryCase.correctTreatments.includes(t)
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-medical-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Satisfactory';
    if (score >= 60) return 'Needs Improvement';
    return 'Poor';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-6xl mb-4">
          {score >= 80 ? '🎉' : score >= 60 ? '👍' : '📚'}
        </div>
        <h1 className="text-3xl font-bold text-medical-gray-900 mb-2">
          Case Complete
        </h1>
        <p className="text-xl text-medical-gray-600">
          {veterinaryCase.animal.name} the {veterinaryCase.animal.species}
        </p>
      </div>

      {/* Score Summary */}
      <Card className="border-medical-gray-200">
        <CardHeader className="bg-medical-gray-50">
          <CardTitle className="text-medical-gray-900 text-center">
            Final Score
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 text-center">
          <div className={`text-6xl font-bold mb-2 ${getScoreColor(score)}`}>
            {score}%
          </div>
          <Badge 
            className={`text-lg px-4 py-2 ${
              score >= 80 ? 'bg-medical-green-100 text-medical-green-700' :
              score >= 60 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}
          >
            {getScoreGrade(score)}
          </Badge>
          <p className="text-medical-gray-600 mt-2">
            Completed in {timeElapsed} minutes
          </p>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Diagnosis Results */}
        <Card className="border-medical-gray-200">
          <CardHeader className={isCorrectDiagnosis ? 'bg-medical-green-50' : 'bg-red-50'}>
            <CardTitle className={isCorrectDiagnosis ? 'text-medical-green-700' : 'text-red-700'}>
              {isCorrectDiagnosis ? '✅ Diagnosis' : '❌ Diagnosis'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-medical-gray-600 mb-1">Your Diagnosis</p>
                <p className={`font-semibold ${isCorrectDiagnosis ? 'text-medical-green-700' : 'text-red-700'}`}>
                  {selectedDiagnosis}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-medical-gray-600 mb-1">Correct Diagnosis</p>
                <p className="font-semibold text-medical-green-700">
                  {veterinaryCase.correctDiagnosis}
                </p>
              </div>
              {!isCorrectDiagnosis && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">
                    <strong>Learning Point:</strong> Consider reviewing the test results and symptom patterns. 
                    {veterinaryCase.correctDiagnosis} was the most likely diagnosis based on the clinical presentation.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Treatment Results */}
        <Card className="border-medical-gray-200">
          <CardHeader className="bg-medical-teal-50">
            <CardTitle className="text-medical-teal-700">
              💊 Treatment Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {correctTreatments.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-medical-green-600 mb-2">
                    ✅ Appropriate Treatments ({correctTreatments.length})
                  </p>
                  <div className="space-y-1">
                    {correctTreatments.map(treatment => (
                      <Badge 
                        key={treatment} 
                        className="bg-medical-green-100 text-medical-green-700 mr-2"
                      >
                        {treatment.replace(/-/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {incorrectTreatments.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-red-600 mb-2">
                    ⚠️ Potentially Inappropriate ({incorrectTreatments.length})
                  </p>
                  <div className="space-y-1">
                    {incorrectTreatments.map(treatment => (
                      <Badge 
                        key={treatment} 
                        className="bg-red-100 text-red-700 mr-2"
                      >
                        {treatment.replace(/-/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-medical-gray-600 mb-2">
                  Recommended Treatments
                </p>
                <div className="space-y-1">
                  {veterinaryCase.correctTreatments.map(treatment => (
                    <Badge 
                      key={treatment} 
                      className="bg-medical-gray-100 text-medical-gray-700 mr-2"
                    >
                      {treatment.replace(/-/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Educational Content */}
      <Card className="border-medical-gray-200">
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-blue-700">
            📚 Educational Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-medical-gray-800 mb-2">Case Learning Points</h4>
              <ul className="text-medical-gray-700 space-y-1 text-sm">
                <li>• This case demonstrated a typical presentation of {veterinaryCase.correctDiagnosis}</li>
                <li>• Key diagnostic tests included: {veterinaryCase.recommendedTests.join(', ')}</li>
                <li>• Early recognition and appropriate treatment improve patient outcomes</li>
                <li>• Differential diagnosis is crucial when symptoms are non-specific</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-medical-gray-800 mb-2">Next Steps</h4>
              <p className="text-medical-gray-700 text-sm">
                Continue practicing with more cases to improve your diagnostic accuracy and clinical reasoning skills. 
                Each case helps build pattern recognition essential for veterinary practice.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <Button 
          onClick={onNewCase}
          className="bg-medical-teal-600 hover:bg-medical-teal-700 text-white px-8 py-3 text-lg"
        >
          Try Another Case
        </Button>
      </div>
    </div>
  );
}
