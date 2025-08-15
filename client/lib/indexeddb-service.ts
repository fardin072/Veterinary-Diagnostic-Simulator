interface UserData {
  id: string;
  completedCases: string[];
  scores: Record<string, number>;
  totalScore: number;
  gamesPlayed: number;
  bestScore: number;
  averageScore: number;
  difficulty: Record<string, number>; // difficulty level completion counts
  lastPlayed: Date;
}

interface GameSession {
  id: string;
  caseId: string;
  startTime: Date;
  endTime?: Date;
  score: number;
  timeElapsed: number;
  selectedDiagnosis: string;
  correctDiagnosis: string;
  selectedTreatments: string[];
  correctTreatments: string[];
  testsPerformed: string[];
  difficulty: string;
}

class IndexedDBService {
  private dbName = 'VeterinaryGameDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (!window.indexedDB) {
      throw new Error('IndexedDB is not supported in this browser');
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create user data store
        if (!db.objectStoreNames.contains('userData')) {
          const userStore = db.createObjectStore('userData', { keyPath: 'id' });
          userStore.createIndex('lastPlayed', 'lastPlayed', { unique: false });
        }

        // Create game sessions store
        if (!db.objectStoreNames.contains('gameSessions')) {
          const sessionStore = db.createObjectStore('gameSessions', { keyPath: 'id' });
          sessionStore.createIndex('caseId', 'caseId', { unique: false });
          sessionStore.createIndex('startTime', 'startTime', { unique: false });
          sessionStore.createIndex('score', 'score', { unique: false });
        }

        // Create case completion store
        if (!db.objectStoreNames.contains('caseCompletion')) {
          const caseStore = db.createObjectStore('caseCompletion', { keyPath: 'caseId' });
          caseStore.createIndex('completed', 'completed', { unique: false });
          caseStore.createIndex('bestScore', 'bestScore', { unique: false });
        }
      };
    });
  }

  async getUserData(): Promise<UserData> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['userData'], 'readonly');
      const store = transaction.objectStore('userData');
      const request = store.get('player1');

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result);
        } else {
          // Return default user data
          const defaultData: UserData = {
            id: 'player1',
            completedCases: [],
            scores: {},
            totalScore: 0,
            gamesPlayed: 0,
            bestScore: 0,
            averageScore: 0,
            difficulty: { medium: 0, hard: 0 },
            lastPlayed: new Date()
          };
          resolve(defaultData);
        }
      };
    });
  }

  async updateUserData(userData: UserData): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['userData'], 'readwrite');
      const store = transaction.objectStore('userData');
      const request = store.put({ ...userData, lastPlayed: new Date() });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async saveGameSession(session: GameSession): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['gameSessions'], 'readwrite');
      const store = transaction.objectStore('gameSessions');
      const request = store.add(session);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getGameSessions(limit: number = 10): Promise<GameSession[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['gameSessions'], 'readonly');
      const store = transaction.objectStore('gameSessions');
      const index = store.index('startTime');
      const request = index.openCursor(null, 'prev');

      const sessions: GameSession[] = [];
      let count = 0;

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        try {
          const cursor = request.result;
          if (cursor && count < limit) {
            // Validate session data before adding
            const session = cursor.value;
            if (session && session.id && session.caseId && typeof session.score === 'number') {
              sessions.push(session);
              count++;
            }
            cursor.continue();
          } else {
            resolve(sessions);
          }
        } catch (error) {
          console.error('Error processing game sessions:', error);
          resolve(sessions); // Return what we have so far
        }
      };
    });
  }

  async markCaseCompleted(caseId: string, score: number, difficulty: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['caseCompletion'], 'readwrite');
      const store = transaction.objectStore('caseCompletion');
      
      // First get existing record
      const getRequest = store.get(caseId);
      
      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        const caseData = {
          caseId,
          completed: true,
          completionDate: new Date(),
          bestScore: existing ? Math.max(existing.bestScore, score) : score,
          attempts: existing ? existing.attempts + 1 : 1,
          difficulty,
          scores: existing ? [...existing.scores, score] : [score]
        };

        const putRequest = store.put(caseData);
        putRequest.onerror = () => reject(putRequest.error);
        putRequest.onsuccess = () => resolve();
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async getCompletedCases(): Promise<string[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['caseCompletion'], 'readonly');
      const store = transaction.objectStore('caseCompletion');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        try {
          const completedCases = request.result
            .filter(item => item && item.completed === true && item.caseId)
            .map(item => item.caseId);
          resolve(completedCases);
        } catch (error) {
          console.error('Error processing completed cases:', error);
          resolve([]); // Return empty array on error
        }
      };
    });
  }

  async getCaseStats(caseId: string): Promise<any> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['caseCompletion'], 'readonly');
      const store = transaction.objectStore('caseCompletion');
      const request = store.get(caseId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        resolve(request.result || null);
      };
    });
  }

  async getStatistics(): Promise<any> {
    try {
      const userData = await this.getUserData();
      const sessions = await this.getGameSessions(100);
      const completedCases = await this.getCompletedCases();

      // Filter out any invalid sessions
      const validSessions = sessions.filter(s =>
        s && typeof s.score === 'number' && s.difficulty && !isNaN(s.score)
      );

      return {
        gamesPlayed: validSessions.length,
        casesCompleted: completedCases.length,
        averageScore: validSessions.length > 0 ?
          validSessions.reduce((sum, s) => sum + s.score, 0) / validSessions.length : 0,
        bestScore: validSessions.length > 0 ?
          Math.max(...validSessions.map(s => s.score)) : 0,
        difficultyBreakdown: validSessions.reduce((acc, session) => {
          acc[session.difficulty] = (acc[session.difficulty] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        recentSessions: validSessions.slice(0, 5)
      };
    } catch (error) {
      console.error('Error in getStatistics:', error);
      // Return default statistics if there's an error
      return {
        gamesPlayed: 0,
        casesCompleted: 0,
        averageScore: 0,
        bestScore: 0,
        difficultyBreakdown: {},
        recentSessions: []
      };
    }
  }

  async clearAllData(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['userData', 'gameSessions', 'caseCompletion'], 'readwrite');
      
      const clearPromises = [
        new Promise<void>((res, rej) => {
          const req = transaction.objectStore('userData').clear();
          req.onsuccess = () => res();
          req.onerror = () => rej(req.error);
        }),
        new Promise<void>((res, rej) => {
          const req = transaction.objectStore('gameSessions').clear();
          req.onsuccess = () => res();
          req.onerror = () => rej(req.error);
        }),
        new Promise<void>((res, rej) => {
          const req = transaction.objectStore('caseCompletion').clear();
          req.onsuccess = () => res();
          req.onerror = () => rej(req.error);
        })
      ];

      Promise.all(clearPromises)
        .then(() => resolve())
        .catch(reject);
    });
  }
}

export const dbService = new IndexedDBService();
export type { UserData, GameSession };
