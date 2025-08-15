import { VeterinaryCase } from '@/lib/veterinary-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CaseIntakeScreenProps {
  case: VeterinaryCase;
  onProceed: () => void;
}

export function CaseIntakeScreen({ case: veterinaryCase, onProceed }: CaseIntakeScreenProps) {
  const { animal, symptoms, ownerReport } = veterinaryCase;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-medical-gray-900 mb-2">
          New Patient Intake
        </h1>
        <p className="text-medical-gray-600">
          Review the case information and proceed with examination
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Information */}
        <Card className="border-medical-gray-200">
          <CardHeader className="bg-medical-teal-50">
            <CardTitle className="text-medical-teal-700 flex items-center gap-2">
              🐕 Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-medical-gray-600 mb-1">Name</p>
                  <p className="font-semibold text-medical-gray-900">{animal.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-medical-gray-600 mb-1">Species</p>
                  <Badge variant="secondary" className="bg-medical-gray-100 text-medical-gray-700">
                    {animal.species.charAt(0).toUpperCase() + animal.species.slice(1)}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-medical-gray-600 mb-1">Age</p>
                  <p className="text-medical-gray-900">{animal.age}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-medical-gray-600 mb-1">Sex</p>
                  <p className="text-medical-gray-900">{animal.sex}</p>
                </div>
              </div>

              {animal.breed && (
                <div>
                  <p className="text-sm font-medium text-medical-gray-600 mb-1">Breed</p>
                  <p className="text-medical-gray-900">{animal.breed}</p>
                </div>
              )}

              {animal.weight && (
                <div>
                  <p className="text-sm font-medium text-medical-gray-600 mb-1">Weight</p>
                  <p className="text-medical-gray-900">{animal.weight}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Owner Report */}
        <Card className="border-medical-gray-200">
          <CardHeader className="bg-medical-green-50">
            <CardTitle className="text-medical-green-600 flex items-center gap-2">
              💬 Owner's Report
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-medical-gray-600 mb-2">Chief Complaint</p>
                <p className="text-medical-gray-900 bg-medical-gray-50 p-3 rounded-lg">
                  "{ownerReport.chiefComplaint}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-medical-gray-600 mb-1">Duration</p>
                  <p className="text-medical-gray-900">{ownerReport.duration}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-medical-gray-600 mb-1">Progression</p>
                  <p className="text-medical-gray-900">{ownerReport.progression}</p>
                </div>
              </div>

              {ownerReport.additionalNotes && (
                <div>
                  <p className="text-sm font-medium text-medical-gray-600 mb-2">Additional Notes</p>
                  <p className="text-medical-gray-900 text-sm bg-medical-gray-50 p-3 rounded-lg">
                    {ownerReport.additionalNotes}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visible Symptoms */}
      <Card className="border-medical-gray-200">
        <CardHeader className="bg-orange-50">
          <CardTitle className="text-orange-700 flex items-center gap-2">
            👁️ Observable Symptoms
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {symptoms
              .filter(symptom => symptom.visible)
              .map(symptom => (
                <div 
                  key={symptom.id}
                  className="border border-medical-gray-200 rounded-lg p-4 bg-white"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge 
                      variant={
                        symptom.severity === 'severe' ? 'destructive' :
                        symptom.severity === 'moderate' ? 'default' : 'secondary'
                      }
                      className="text-xs"
                    >
                      {symptom.severity}
                    </Badge>
                  </div>
                  <p className="text-medical-gray-900 text-sm">{symptom.description}</p>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center pt-4">
        <Button 
          onClick={onProceed}
          className="bg-medical-teal-600 hover:bg-medical-teal-700 text-white px-8 py-3 text-lg"
        >
          Begin Examination & Diagnosis
        </Button>
      </div>
    </div>
  );
}
