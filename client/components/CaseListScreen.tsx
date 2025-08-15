import { useState, useEffect } from 'react';
import { VeterinaryCase, getAllCases } from '@/lib/veterinary-data';
import { dbService } from '@/lib/indexeddb-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CaseListScreenProps {
  onSelectCase: (case_: VeterinaryCase) => void;
  onViewStats: () => void;
}

export function CaseListScreen({ onSelectCase, onViewStats }: CaseListScreenProps) {
  const [cases, setCases] = useState<VeterinaryCase[]>([]);
  const [completedCases, setCompletedCases] = useState<string[]>([]);
  const [filteredCases, setFilteredCases] = useState<VeterinaryCase[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterCases();
  }, [cases, completedCases, searchTerm, difficultyFilter, statusFilter]);

  const loadData = async () => {
    try {
      const [allCases, completed] = await Promise.all([
        getAllCases(),
        dbService.getCompletedCases()
      ]);
      setCases(allCases);
      setCompletedCases(completed);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCases = () => {
    let filtered = cases;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(case_ => 
        case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.animal.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.correctDiagnosis.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Difficulty filter
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(case_ => case_.difficulty === difficultyFilter);
    }

    // Status filter
    if (statusFilter === 'completed') {
      filtered = filtered.filter(case_ => completedCases.includes(case_.id));
    } else if (statusFilter === 'incomplete') {
      filtered = filtered.filter(case_ => !completedCases.includes(case_.id));
    }

    setFilteredCases(filtered);
  };

  const getSpeciesIcon = (species: string) => {
    const icons: Record<string, string> = {
      dog: '🐕',
      cat: '🐈',
      horse: '🐎',
      bird: '🦜',
      reptile: '🦎',
      livestock: '🐄',
      exotic: '🐰'
    };
    return icons[species] || '🐾';
  };

  const getDifficultyColor = (difficulty: string) => {
    return difficulty === 'hard' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700';
  };

  const completionPercentage = Math.round((completedCases.length / cases.length) * 100) || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-medical-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔄</div>
          <p className="text-medical-gray-600">Loading cases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-medical-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-medical-gray-900">
              Veterinary Case Library
            </h1>
            <Button onClick={onViewStats} variant="outline">
              View Statistics
            </Button>
          </div>
          
          {/* Progress Overview */}
          <Card className="border-medical-gray-200">
            <CardHeader className="bg-medical-teal-50">
              <CardTitle className="text-medical-teal-700">Your Progress</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-medical-teal-600">{completedCases.length}</p>
                  <p className="text-sm text-medical-gray-600">Cases Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-medical-gray-600">{cases.length}</p>
                  <p className="text-sm text-medical-gray-600">Total Cases</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-medical-green-600">{completionPercentage}%</p>
                  <p className="text-sm text-medical-gray-600">Completion Rate</p>
                </div>
                <div className="text-center">
                  <div className="w-full bg-medical-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-medical-teal-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${completionPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-medical-gray-600">Overall Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <Input
              placeholder="Search cases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-medical-gray-300"
            />
          </div>
          <div>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cases</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="incomplete">Not Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-right">
            <p className="text-sm text-medical-gray-600 mt-2">
              Showing {filteredCases.length} of {cases.length} cases
            </p>
          </div>
        </div>

        {/* Case Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCases.map((case_) => {
            const isCompleted = completedCases.includes(case_.id);
            
            return (
              <Card 
                key={case_.id} 
                className={`border-medical-gray-200 cursor-pointer transition-all hover:shadow-lg ${
                  isCompleted ? 'bg-medical-green-50 border-medical-green-200' : 'bg-white'
                }`}
                onClick={() => onSelectCase(case_)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getSpeciesIcon(case_.animal.species)}</span>
                      <div>
                        <CardTitle className="text-lg text-medical-gray-900">{case_.title}</CardTitle>
                        <p className="text-sm text-medical-gray-600">
                          {case_.animal.name} • {case_.animal.species}
                        </p>
                      </div>
                    </div>
                    {isCompleted && (
                      <div className="text-medical-green-600 text-xl">✅</div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className={getDifficultyColor(case_.difficulty)}>
                        {case_.difficulty}
                      </Badge>
                      <span className="text-sm text-medical-gray-600">
                        {case_.animal.age}
                      </span>
                    </div>
                    
                    <p className="text-sm text-medical-gray-700 line-clamp-2">
                      {case_.ownerReport.chiefComplaint}
                    </p>
                    
                    <div className="text-xs text-medical-gray-500">
                      Diagnosis: {case_.correctDiagnosis}
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-medical-gray-500">
                        {case_.symptoms.filter(s => s.visible).length} visible symptoms
                      </span>
                      <Button 
                        size="sm" 
                        className="bg-medical-teal-600 hover:bg-medical-teal-700 text-white"
                      >
                        {isCompleted ? 'Retry' : 'Start'} Case
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredCases.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-medical-gray-700 mb-2">
              No cases found
            </h3>
            <p className="text-medical-gray-600">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
