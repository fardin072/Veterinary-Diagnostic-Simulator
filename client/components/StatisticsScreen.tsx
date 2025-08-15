import { useState, useEffect } from 'react';
import { dbService } from '@/lib/indexeddb-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface StatisticsScreenProps {
  onBackToMenu: () => void;
}

interface GameStatistics {
  gamesPlayed: number;
  casesCompleted: number;
  averageScore: number;
  bestScore: number;
  difficultyBreakdown: Record<string, number>;
  recentSessions: any[];
}

export function StatisticsScreen({ onBackToMenu }: StatisticsScreenProps) {
  const [stats, setStats] = useState<GameStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const statistics = await dbService.getStatistics();
      setStats(statistics);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearData = async () => {
    if (confirm('Are you sure you want to clear all your progress? This action cannot be undone.')) {
      try {
        await dbService.clearAllData();
        await loadStatistics(); // Reload stats
      } catch (error) {
        console.error('Error clearing data:', error);
        alert('Failed to clear data. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-medical-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-4xl sm:text-6xl mb-4">📊</div>
          <p className="text-medical-gray-600 text-sm sm:text-base">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-medical-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-4xl sm:text-6xl mb-4">❌</div>
          <p className="text-medical-gray-600 text-sm sm:text-base mb-4">Failed to load statistics</p>
          <Button onClick={onBackToMenu} className="w-full sm:w-auto">
            Back to Menu
          </Button>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-medical-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Satisfactory';
    if (score >= 60) return 'Needs Improvement';
    return 'Poor';
  };

  return (
    <div className="min-h-screen bg-medical-gray-50 p-3 sm:p-4 lg:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-medical-gray-900">
            Performance Statistics
          </h1>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <Button 
              onClick={clearData} 
              variant="outline" 
              className="text-red-600 border-red-300 hover:bg-red-50 w-full sm:w-auto order-2 sm:order-1"
              size="sm"
            >
              <span className="hidden sm:inline">Clear All Data</span>
              <span className="sm:hidden">Clear Data</span>
            </Button>
            <Button 
              onClick={onBackToMenu}
              className="w-full sm:w-auto order-1 sm:order-2"
              size="sm"
            >
              Back to Menu
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <Card className="border-medical-gray-200">
            <CardHeader className="bg-medical-teal-50 pb-2 sm:pb-3">
              <CardTitle className="text-medical-teal-700 text-base sm:text-lg">Games Played</CardTitle>
            </CardHeader>
            <CardContent className="pt-3 sm:pt-4">
              <p className="text-2xl sm:text-3xl font-bold text-medical-gray-900">{stats.gamesPlayed}</p>
              <p className="text-xs sm:text-sm text-medical-gray-600">Total sessions</p>
            </CardContent>
          </Card>

          <Card className="border-medical-gray-200">
            <CardHeader className="bg-medical-green-50 pb-2 sm:pb-3">
              <CardTitle className="text-medical-green-700 text-base sm:text-lg">Cases Completed</CardTitle>
            </CardHeader>
            <CardContent className="pt-3 sm:pt-4">
              <p className="text-2xl sm:text-3xl font-bold text-medical-gray-900">{stats.casesCompleted}</p>
              <p className="text-xs sm:text-sm text-medical-gray-600">Unique cases</p>
            </CardContent>
          </Card>

          <Card className="border-medical-gray-200">
            <CardHeader className="bg-blue-50 pb-2 sm:pb-3">
              <CardTitle className="text-blue-700 text-base sm:text-lg">Average Score</CardTitle>
            </CardHeader>
            <CardContent className="pt-3 sm:pt-4">
              <p className={`text-2xl sm:text-3xl font-bold ${getScoreColor(stats.averageScore)}`}>
                {Math.round(stats.averageScore)}%
              </p>
              <p className="text-xs sm:text-sm text-medical-gray-600">
                {getPerformanceLevel(stats.averageScore)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-medical-gray-200">
            <CardHeader className="bg-yellow-50 pb-2 sm:pb-3">
              <CardTitle className="text-yellow-700 text-base sm:text-lg">Best Score</CardTitle>
            </CardHeader>
            <CardContent className="pt-3 sm:pt-4">
              <p className={`text-2xl sm:text-3xl font-bold ${getScoreColor(stats.bestScore)}`}>
                {stats.bestScore}%
              </p>
              <p className="text-xs sm:text-sm text-medical-gray-600">Personal best</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Difficulty Breakdown */}
          <Card className="border-medical-gray-200">
            <CardHeader className="bg-medical-gray-50">
              <CardTitle className="text-medical-gray-900 text-lg sm:text-xl">Difficulty Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 sm:pt-6">
              <div className="space-y-3 sm:space-y-4">
                {Object.entries(stats.difficultyBreakdown).map(([difficulty, count]) => (
                  <div key={difficulty} className="flex items-center justify-between p-2 sm:p-0">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Badge className={
                        difficulty === 'hard' 
                          ? 'bg-red-100 text-red-700 text-xs sm:text-sm' 
                          : 'bg-yellow-100 text-yellow-700 text-xs sm:text-sm'
                      }>
                        {difficulty}
                      </Badge>
                      <span className="text-medical-gray-700 text-sm sm:text-base">Cases</span>
                    </div>
                    <span className="text-xl sm:text-2xl font-bold text-medical-gray-900">{count}</span>
                  </div>
                ))}
                {Object.keys(stats.difficultyBreakdown).length === 0 && (
                  <p className="text-medical-gray-500 text-center py-6 sm:py-4 text-sm sm:text-base">
                    No games played yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Sessions */}
          <Card className="border-medical-gray-200">
            <CardHeader className="bg-medical-gray-50">
              <CardTitle className="text-medical-gray-900 text-lg sm:text-xl">Recent Sessions</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 sm:pt-6">
              <div className="space-y-3 sm:space-y-4">
                {stats.recentSessions.length > 0 ? (
                  stats.recentSessions.map((session, index) => (
                    <div key={session.id || index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 p-3 bg-white border border-medical-gray-200 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-medical-gray-900 text-sm sm:text-base">
                          Case {session.caseId?.slice(-3) || 'Unknown'}
                        </p>
                        <p className="text-xs sm:text-sm text-medical-gray-600">
                          {session.difficulty} • {Math.round(session.timeElapsed || 0)} min
                        </p>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:gap-0">
                        <p className={`text-lg sm:text-xl font-bold ${getScoreColor(session.score || 0)}`}>
                          {session.score || 0}%
                        </p>
                        <p className="text-xs text-medical-gray-500">
                          {session.startTime ? new Date(session.startTime).toLocaleDateString() : 'Unknown date'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-medical-gray-500 text-center py-6 sm:py-4 text-sm sm:text-base">
                    No recent sessions
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Analysis */}
        {stats.gamesPlayed > 0 && (
          <Card className="border-medical-gray-200 mt-6 sm:mt-8">
            <CardHeader className="bg-medical-teal-50">
              <CardTitle className="text-medical-teal-700 text-lg sm:text-xl">Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 sm:pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="text-center sm:text-left md:text-center p-3 sm:p-0">
                  <h4 className="font-semibold text-medical-gray-800 mb-2 text-sm sm:text-base">Consistency</h4>
                  <p className="text-medical-gray-600 text-xs sm:text-sm leading-relaxed">
                    {stats.averageScore > 70 
                      ? "You maintain consistent high performance across cases"
                      : stats.averageScore > 50
                        ? "Your performance varies, keep practicing for consistency"
                        : "Focus on fundamental diagnostic principles"
                    }
                  </p>
                </div>
                <div className="text-center sm:text-left md:text-center p-3 sm:p-0">
                  <h4 className="font-semibold text-medical-gray-800 mb-2 text-sm sm:text-base">Progress</h4>
                  <p className="text-medical-gray-600 text-xs sm:text-sm leading-relaxed">
                    {stats.gamesPlayed >= 10
                      ? "You're building solid experience with regular practice"
                      : "Continue playing more cases to improve your skills"
                    }
                  </p>
                </div>
                <div className="text-center sm:text-left md:text-center p-3 sm:p-0">
                  <h4 className="font-semibold text-medical-gray-800 mb-2 text-sm sm:text-base">Recommendation</h4>
                  <p className="text-medical-gray-600 text-xs sm:text-sm leading-relaxed">
                    {stats.averageScore < 60
                      ? "Focus on medium difficulty cases to build foundations"
                      : stats.averageScore < 80
                        ? "Challenge yourself with more hard difficulty cases"
                        : "Excellent work! Try to maintain this level of performance"
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
