import neo4j, { Driver, Session } from 'neo4j-driver';
import dotenv from 'dotenv';
import { inMemoryGraphEngine } from './inMemoryEngine.js';

dotenv.config();

export interface QueryResult<T = any> {
  records: T[];
  summary?: any;
  executionTimeMs: number;
  engine: 'CognoDB-Cloud' | 'In-Memory-Graph';
}

class CognoDBService {
  private driver: Driver | null = null;
  private isConnected = false;
  private connectionChecked = false;
  private uri: string;
  private user: string;
  private pass: string;
  private database: string;

  constructor() {
    this.uri = process.env.COGNODB_URI || 'bolt+s://demo.cognodb.io:7687';
    this.user = process.env.COGNODB_USERNAME || 'cognodb';
    this.pass = process.env.COGNODB_PASSWORD || '';
    this.database = process.env.COGNODB_DATABASE || 'neo4j';
  }

  public async init(): Promise<boolean> {
    if (process.env.USE_IN_MEMORY_DEMO === 'true' || !this.pass) {
      console.log('⚡ [CognoDB] Running in High-Fidelity In-Memory Graph Engine mode.');
      this.isConnected = false;
      this.connectionChecked = true;
      return false;
    }

    try {
      console.log(`🔌 [CognoDB] Attempting connection to ${this.uri} (User: ${this.user})...`);
      this.driver = neo4j.driver(
        this.uri,
        neo4j.auth.basic(this.user, this.pass),
        {
          maxConnectionLifetime: 3 * 60 * 60 * 1000,
          maxConnectionPoolSize: 50,
          connectionAcquisitionTimeout: 5000
        }
      );

      const serverInfo = await this.driver.getServerInfo();
      console.log(`✅ [CognoDB] Connected successfully to ${serverInfo.address} (${serverInfo.agent})`);
      this.isConnected = true;
      this.connectionChecked = true;
      return true;
    } catch (error: any) {
      console.warn(`⚠️ [CognoDB] Connection to remote instance failed (${error.message}).`);
      console.log('🔄 [CognoDB] Seamlessly falling back to In-Memory Graph Engine.');
      this.isConnected = false;
      this.connectionChecked = true;
      return false;
    }
  }

  public getStatus() {
    return {
      connected: this.isConnected,
      engine: this.isConnected ? 'CognoDB-Cloud' : 'In-Memory-Graph',
      uri: this.uri.replace(/\/\/.*@/, '//***@'),
      database: this.database,
      checked: this.connectionChecked
    };
  }

  public async executeCypher<T = any>(cypher: string, params: Record<string, any> = {}): Promise<QueryResult<T>> {
    const startTime = Date.now();

    if (this.isConnected && this.driver) {
      const session: Session = this.driver.session({ database: this.database });
      try {
        const result = await session.run(cypher, params);
        const records = result.records.map((record) => record.toObject() as T);
        return {
          records,
          summary: result.summary,
          executionTimeMs: Date.now() - startTime,
          engine: 'CognoDB-Cloud'
        };
      } catch (err: any) {
        console.error('❌ [CognoDB] Cypher execution error:', err.message);
        throw err;
      } finally {
        await session.close();
      }
    }

    // Fallback in-memory graph execution
    const records = await inMemoryGraphEngine.execute(cypher, params);
    return {
      records: records as T[],
      executionTimeMs: Date.now() - startTime,
      engine: 'In-Memory-Graph'
    };
  }

  public async close(): Promise<void> {
    if (this.driver) {
      await this.driver.close();
      this.isConnected = false;
    }
  }
}

export const cognodb = new CognoDBService();
