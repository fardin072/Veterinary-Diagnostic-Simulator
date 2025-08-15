import { useState } from 'react';
import { VeterinaryCase } from '@/lib/veterinary-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface DiagnosisTreatmentInterfaceProps {
  case: VeterinaryCase;
  onSubmit: (diagnosis: string, treatments: string[]) => void;
}

const possibleDiagnoses = [
  'Gastroenteritis',
  'Dietary indiscretion',
  'Parasitic infection',
  'Pancreatitis',
  'Inflammatory bowel disease',
  'Foreign body obstruction',
  'Liver disease',
  'Kidney disease',
  'Diabetes mellitus',
  'Hypoadrenocorticism'
];

const treatmentOptions = [
  {
    id: 'supportive-care',
    name: 'Supportive Care',
    description: 'IV fluids, monitoring, rest',
    category: 'supportive'
  },
  {
    id: 'anti-nausea',
    name: 'Anti-nausea Medication',
    description: 'Maropitant or ondansetron',
    category: 'medication'
  },
  {
    id: 'bland-diet',
    name: 'Bland Diet',
    description: 'Low-fat, easily digestible food',
    category: 'supportive'
  },
  {
    id: 'antibiotics',
    name: 'Antibiotic Therapy',
    description: 'Broad-spectrum antibiotics',
    category: 'medication'
  },
  {
    id: 'anti-inflammatory',
    name: 'Anti-inflammatory Drugs',
    description: 'NSAIDs or corticosteroids',
    category: 'medication'
  },
  {
    id: 'probiotics',
    name: 'Probiotics',
    description: 'Beneficial bacteria supplementation',
    category: 'supportive'
  },
  {
    id: 'deworming',
    name: 'Deworming Treatment',
    description: 'Broad-spectrum anthelmintic',
    category: 'medication'
  },
  {
    id: 'surgical-exploration',
    name: 'Exploratory Surgery',
    description: 'Abdominal exploration and intervention',
    category: 'surgery'
  },
  {
    id: 'endoscopy',
    name: 'Endoscopic Examination',
    description: 'Visual examination of GI tract',
    category: 'diagnostic'
  }
];

export function DiagnosisTreatmentInterface({ case: veterinaryCase, onSubmit }: DiagnosisTreatmentInterfaceProps) {
  const [selectedDiagnosis, setSelectedDiagnosis] = useState('');
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>([]);

  const handleTreatmentChange = (treatmentId: string, checked: boolean) => {
    if (checked) {
      setSelectedTreatments(prev => [...prev, treatmentId]);
    } else {
      setSelectedTreatments(prev => prev.filter(id => id !== treatmentId));
    }
  };

  const canSubmit = selectedDiagnosis && selectedTreatments.length > 0;

  const treatmentCategories = {
    supportive: 'Supportive Care',
    medication: 'Medications',
    surgery: 'Surgical Interventions',
    diagnostic: 'Further Diagnostics'
  };

  const categorizedTreatments = Object.entries(treatmentCategories).map(([category, label]) => ({
    category: category as keyof typeof treatmentCategories,
    label,
    treatments: treatmentOptions.filter(treatment => treatment.category === category)
  }));

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-medical-gray-900 mb-2">
          Diagnosis & Treatment Plan
        </h2>
        <p className="text-medical-gray-600">
          Based on your findings, select the most likely diagnosis and appropriate treatments
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Diagnosis Selection */}
        <Card className="border-medical-gray-200">
          <CardHeader className="bg-medical-teal-50">
            <CardTitle className="text-medical-teal-700">
              🔍 Primary Diagnosis
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <RadioGroup 
              value={selectedDiagnosis} 
              onValueChange={setSelectedDiagnosis}
              className="space-y-3"
            >
              {possibleDiagnoses.map(diagnosis => (
                <div key={diagnosis} className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value={diagnosis} 
                    id={diagnosis}
                    className="border-medical-gray-300"
                  />
                  <Label 
                    htmlFor={diagnosis}
                    className="text-medical-gray-900 cursor-pointer flex-1"
                  >
                    {diagnosis}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Treatment Selection */}
        <Card className="border-medical-gray-200">
          <CardHeader className="bg-medical-green-50">
            <CardTitle className="text-medical-green-600">
              💊 Treatment Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {categorizedTreatments.map(({ category, label, treatments }) => (
                <div key={category}>
                  <h4 className="font-semibold text-medical-gray-800 mb-3">{label}</h4>
                  <div className="space-y-3">
                    {treatments.map(treatment => (
                      <div key={treatment.id} className="flex items-start space-x-3">
                        <Checkbox
                          id={treatment.id}
                          checked={selectedTreatments.includes(treatment.id)}
                          onCheckedChange={(checked) => 
                            handleTreatmentChange(treatment.id, checked as boolean)
                          }
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <Label 
                            htmlFor={treatment.id}
                            className="text-medical-gray-900 cursor-pointer font-medium"
                          >
                            {treatment.name}
                          </Label>
                          <p className="text-sm text-medical-gray-600">
                            {treatment.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient Summary */}
      <Card className="border-medical-gray-200">
        <CardHeader className="bg-medical-gray-50">
          <CardTitle className="text-medical-gray-900">
            📋 Case Summary Review
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-medical-gray-800 mb-2">Patient</h4>
              <p className="text-medical-gray-700">
                {veterinaryCase.animal.name}, {veterinaryCase.animal.age} {veterinaryCase.animal.species}
              </p>
              <p className="text-sm text-medical-gray-600">
                {veterinaryCase.animal.breed} • {veterinaryCase.animal.weight}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-medical-gray-800 mb-2">Chief Complaint</h4>
              <p className="text-medical-gray-700 text-sm">
                {veterinaryCase.ownerReport.chiefComplaint}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-medical-gray-800 mb-2">Observable Signs</h4>
              <ul className="text-sm text-medical-gray-700 space-y-1">
                {veterinaryCase.symptoms
                  .filter(s => s.visible)
                  .slice(0, 3)
                  .map(symptom => (
                    <li key={symptom.id}>• {symptom.description}</li>
                  ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-center">
        <Button 
          onClick={() => onSubmit(selectedDiagnosis, selectedTreatments)}
          disabled={!canSubmit}
          className="bg-medical-green-600 hover:bg-medical-green-700 disabled:bg-medical-gray-300 text-white px-8 py-3 text-lg"
        >
          Submit Diagnosis & Treatment Plan
        </Button>
      </div>

      {!canSubmit && (
        <p className="text-center text-sm text-medical-gray-500">
          Please select both a diagnosis and at least one treatment to continue
        </p>
      )}
    </div>
  );
}
