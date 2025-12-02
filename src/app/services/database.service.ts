import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Storage } from '@ionic/storage-angular';

// --- INTERFAZ DE USUARIO ACTUALIZADA (CON PHOTOURL) ---
export interface UserRecord {
  id?: number;
  fullName: string;
  username: string;
  phoneNumber: string;
  email: string;
  password: string;
  photoUrl?: string; // <--- Nuevo campo para la foto
}

// --- INTERFAZ DE TRABAJO ---
export interface JobRecord {
  id?: number;
  creatorId: number;
  title: string;
  category: string;
  description: string;
  location: string;
  price: number;
  startDateTime: string;
  endDateTime: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class DatabaseService {
  private sqliteDb: SQLiteDBConnection | null = null;
  private storageProxy: Storage | null = null;
  private initialized = false;
  private initializingPromise: Promise<void> | null = null;

  constructor(private storage: Storage) {}

  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    if (this.initializingPromise) {
      return this.initializingPromise;
    }

    this.initializingPromise = (async () => {
      const platform = Capacitor.getPlatform();
      const sqliteAvailable = Capacitor.isPluginAvailable('CapacitorSQLite') && platform !== 'web';

      if (sqliteAvailable) {
        const sqliteConnection = new SQLiteConnection(CapacitorSQLite);
        const connection = await sqliteConnection.createConnection(
          'pololitos',
          false,
          'no-encryption',
          1,
          false
        );

        await connection.open();

        // --- DEFINICIÓN DE TABLA USERS (CON COLUMNA PHOTOURL) ---
        // Nota: Si la app ya estaba instalada, SQLite no agrega columnas a tablas existentes automáticamente.
        // Tendrías que desinstalar la app o incrementar la versión de la DB para migrar.
        await connection.execute(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fullName TEXT NOT NULL,
            username TEXT UNIQUE NOT NULL,
            phoneNumber TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            photoUrl TEXT
          );
        `);

        // --- TABLA SESSION ---
        await connection.execute(`
          CREATE TABLE IF NOT EXISTS session (
            id INTEGER PRIMARY KEY CHECK (id = 0),
            user_id INTEGER,
            FOREIGN KEY(user_id) REFERENCES users(id)
          );
        `);

        // --- TABLA JOBS ---
        await connection.execute(`
          CREATE TABLE IF NOT EXISTS jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            description TEXT NOT NULL,
            location TEXT NOT NULL,
            price INTEGER NOT NULL,
            startDateTime TEXT NOT NULL,
            endDateTime TEXT NOT NULL,
            createdAt TEXT NOT NULL DEFAULT (datetime('now'))
          );
        `);

        await connection.run('INSERT OR IGNORE INTO session (id, user_id) VALUES (0, NULL)');

        this.sqliteDb = connection;
      } else {
        this.storageProxy = await this.storage.create();
      }

      await this.seedDefaultJobs();

      this.initialized = true;
    })();

    await this.initializingPromise;
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.init();
    }
  }

  private buildDefaultJobs(): JobRecord[] {
    const now = new Date();
    const jobOneStart = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const jobOneEnd = new Date(jobOneStart.getTime() + 3 * 60 * 60 * 1000);
    const jobTwoStart = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const jobTwoEnd = new Date(jobTwoStart.getTime() + 2 * 60 * 60 * 1000);

    return [
      {
        title: 'Se necesita jardinero para casa en Reñaca',
        category: 'Jardinería',
        description: 'Mantención de jardín, corte de pasto, poda y limpieza.',
        location: 'Reñaca, Viña del Mar',
        creatorId: 1,
        price: 35000,
        startDateTime: jobOneStart.toISOString(),
        endDateTime: jobOneEnd.toISOString(),
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'Clases particulares de matemáticas (online)',
        category: 'Educación',
        description: 'Busco profesor para reforzar contenidos de cálculo universitario.',
        location: 'Remoto',
        creatorId: 2,
        price: 15000,
        startDateTime: jobTwoStart.toISOString(),
        endDateTime: jobTwoEnd.toISOString(),
        createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  private async seedDefaultJobs(): Promise<void> {
    const defaults = this.buildDefaultJobs();

    if (this.sqliteDb) {
      const countResult = await this.sqliteDb.query('SELECT COUNT(*) as count FROM jobs');
      const count = Number(countResult.values?.[0]?.count ?? 0);
      if (count === 0) {
        for (const job of defaults) {
          await this.sqliteDb.run(
            `INSERT INTO jobs (title, category, description, location, price, startDateTime, endDateTime, createdAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)` ,
            [
              job.title,
              job.category,
              job.description,
              job.location,
              job.price,
              job.startDateTime,
              job.endDateTime,
              job.createdAt ?? new Date().toISOString()
            ]
          );
        }
      }
    } else if (this.storageProxy) {
      const existing = await this.storageProxy.get('db_jobs');
      if (!existing || existing.length === 0) {
        const jobsWithIds = defaults.map((job, index) => ({ ...job, id: index + 1 }));
        await this.storageProxy.set('db_jobs', jobsWithIds);
      }
    }
  }

  async getCurrentUser(): Promise<UserRecord | null> {
    await this.ensureInitialized();

    if (this.sqliteDb) {
      const sessionResult = await this.sqliteDb.query('SELECT user_id FROM session WHERE id = 0');
      const userId = sessionResult.values?.[0]?.user_id;
      if (!userId) {
        return null;
      }
      const userResult = await this.sqliteDb.query('SELECT * FROM users WHERE id = ? LIMIT 1', [userId]);
      return userResult.values?.[0] ?? null;
    }

    const user = await this.storageProxy!.get('db_current_user');
    return user ?? null;
  }

  async setCurrentUser(user: UserRecord | null): Promise<void> {
    await this.ensureInitialized();

    if (this.sqliteDb) {
      if (user?.id) {
        await this.sqliteDb.run('INSERT OR REPLACE INTO session (id, user_id) VALUES (0, ?)', [user.id]);
      } else {
        await this.sqliteDb.run('DELETE FROM session WHERE id = 0');
      }
    } else if (this.storageProxy) {
      if (user) {
        await this.storageProxy.set('db_current_user', user);
      } else {
        await this.storageProxy.remove('db_current_user');
      }
    }
  }

  async clearCurrentUser(): Promise<void> {
    await this.setCurrentUser(null);
  }

  async findUserForLogin(credential: string, password: string): Promise<UserRecord | null> {
    await this.ensureInitialized();
    const normalized = credential.toLowerCase();

    if (this.sqliteDb) {
      const result = await this.sqliteDb.query(
        `SELECT * FROM users
         WHERE (LOWER(email) = ? OR LOWER(username) = ?) AND password = ?
         LIMIT 1`,
        [normalized, normalized, password]
      );
      return result.values?.[0] ?? null;
    }

    const users: UserRecord[] = (await this.storageProxy!.get('db_users')) ?? [];
    return users.find(u =>
      (u.email.toLowerCase() === normalized || u.username.toLowerCase() === normalized) &&
      u.password === password
    ) ?? null;
  }

  async userExists(email: string, username: string): Promise<boolean> {
    await this.ensureInitialized();
    const normalizedEmail = email.toLowerCase();
    const normalizedUsername = username.toLowerCase();

    if (this.sqliteDb) {
      const result = await this.sqliteDb.query(
        `SELECT 1 FROM users WHERE LOWER(email) = ? OR LOWER(username) = ? LIMIT 1`,
        [normalizedEmail, normalizedUsername]
      );
      return !!result.values && result.values.length > 0;
    }

    const users: UserRecord[] = (await this.storageProxy!.get('db_users')) ?? [];
    return users.some(u => u.email.toLowerCase() === normalizedEmail || u.username.toLowerCase() === normalizedUsername);
  }

  async createUser(user: UserRecord): Promise<UserRecord | null> {
    await this.ensureInitialized();

    if (this.sqliteDb) {
      // Se agrega photoUrl si viene en el registro, aunque normalmente es null al crear
      const result = await this.sqliteDb.run(
        `INSERT INTO users (fullName, username, phoneNumber, email, password, photoUrl)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [user.fullName, user.username, user.phoneNumber, user.email, user.password, user.photoUrl || null]
      );

      if (result.changes?.lastId) {
        return { ...user, id: result.changes.lastId };
      }

      return null;
    }

    const users: UserRecord[] = (await this.storageProxy!.get('db_users')) ?? [];
    const nextId = users.length > 0 ? Math.max(...users.map(u => u.id ?? 0)) + 1 : 1;
    const record = { ...user, id: nextId };
    users.push(record);
    await this.storageProxy!.set('db_users', users);
    return record;
  }

  // --- MÉTODO ACTUALIZAR USUARIO (AHORA SOPORTA PHOTOURL) ---
  async updateUser(user: Partial<UserRecord> & { id: number }): Promise<UserRecord | null> {
    await this.ensureInitialized();

    if (this.sqliteDb) {
      const columns: string[] = [];
      const values: any[] = [];

      // Array de campos permitidos actualizado con 'photoUrl'
      (['fullName', 'username', 'phoneNumber', 'email', 'password', 'photoUrl'] as const).forEach(key => {
        if (user[key] !== undefined) {
          columns.push(`${key} = ?`);
          values.push(user[key as keyof UserRecord]);
        }
      });

      if (columns.length === 0) {
        const refreshed = await this.sqliteDb.query('SELECT * FROM users WHERE id = ? LIMIT 1', [user.id]);
        return refreshed.values?.[0] ?? null;
      }

      values.push(user.id);
      await this.sqliteDb.run(
        `UPDATE users SET ${columns.join(', ')} WHERE id = ?`,
        values
      );

      const refreshed = await this.sqliteDb.query('SELECT * FROM users WHERE id = ? LIMIT 1', [user.id]);
      return refreshed.values?.[0] ?? null;
    }

    const users: UserRecord[] = (await this.storageProxy!.get('db_users')) ?? [];
    const index = users.findIndex(u => u.id === user.id);
    if (index === -1) {
      return null;
    }

    const updated = { ...users[index], ...user } as UserRecord;
    users[index] = updated;
    await this.storageProxy!.set('db_users', users);
    return updated;
  }

  async findUserByEmail(email: string): Promise<boolean> {
    await this.ensureInitialized();
    const normalized = email.toLowerCase();

    if (this.sqliteDb) {
      const result = await this.sqliteDb.query('SELECT 1 FROM users WHERE LOWER(email) = ? LIMIT 1', [normalized]);
      return !!result.values && result.values.length > 0;
    }

    const users: UserRecord[] = (await this.storageProxy!.get('db_users')) ?? [];
    return users.some(u => u.email.toLowerCase() === normalized);
  }

  async getUserByEmail(email: string): Promise<UserRecord | null> {
    await this.ensureInitialized();
    const normalized = email.toLowerCase();

    if (this.sqliteDb) {
      const result = await this.sqliteDb.query('SELECT * FROM users WHERE LOWER(email) = ? LIMIT 1', [normalized]);
      return result.values?.[0] ?? null;
    }

    const users: UserRecord[] = (await this.storageProxy!.get('db_users')) ?? [];
    return users.find(u => u.email.toLowerCase() === normalized) ?? null;
  }

  async updatePassword(email: string, newPassword: string): Promise<boolean> {
    await this.ensureInitialized();
    const normalized = email.toLowerCase();

    if (this.sqliteDb) {
      const result = await this.sqliteDb.run(
        'UPDATE users SET password = ? WHERE LOWER(email) = ?',
        [newPassword, normalized]
      );
      return (result.changes?.changes ?? 0) > 0;
    }

    const users: UserRecord[] = (await this.storageProxy!.get('db_users')) ?? [];
    const index = users.findIndex(u => u.email.toLowerCase() === normalized);
    if (index === -1) {
      return false;
    }

    users[index] = { ...users[index], password: newPassword };
    await this.storageProxy!.set('db_users', users);
    const currentUser = await this.storageProxy!.get('db_current_user');
    if (currentUser && currentUser.email?.toLowerCase() === normalized) {
      await this.storageProxy!.set('db_current_user', users[index]);
    }
    return true;
  }

  async getJobs(): Promise<JobRecord[]> {
    await this.ensureInitialized();

    if (this.sqliteDb) {
      const result = await this.sqliteDb.query('SELECT * FROM jobs ORDER BY datetime(createdAt) DESC');
      return result.values ?? [];
    }

    const jobs: JobRecord[] = (await this.storageProxy!.get('db_jobs')) ?? [];
    return jobs.sort((a, b) => {
      const dateA = new Date(a.createdAt ?? 0).getTime();
      const dateB = new Date(b.createdAt ?? 0).getTime();
      return dateB - dateA;
    });
  }

  async addJob(job: JobRecord): Promise<JobRecord> {
    await this.ensureInitialized();
    const createdAt = job.createdAt ?? new Date().toISOString();

    if (this.sqliteDb) {
      const result = await this.sqliteDb.run(
        `INSERT INTO jobs (title, category, description, location, price, startDateTime, endDateTime, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          job.title,
          job.category,
          job.description,
          job.location,
          job.price,
          job.startDateTime,
          job.endDateTime,
          createdAt
        ]
      );

      const newJob = await this.sqliteDb.query('SELECT * FROM jobs WHERE id = ? LIMIT 1', [result.changes?.lastId ?? 0]);
      return newJob.values?.[0] ?? { ...job, createdAt };
    }

    const jobs: JobRecord[] = (await this.storageProxy!.get('db_jobs')) ?? [];
    const nextId = jobs.length > 0 ? Math.max(...jobs.map(j => j.id ?? 0)) + 1 : 1;
    const record = { ...job, id: nextId, createdAt };
    jobs.unshift(record);
    await this.storageProxy!.set('db_jobs', jobs);
    return record;
  }
}