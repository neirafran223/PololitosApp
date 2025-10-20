import { Injectable } from '@angular/core';
import { DatabaseService, JobRecord } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class JobService {

  constructor(private database: DatabaseService) { }

  async getJobs(): Promise<JobRecord[]> {
    return this.database.getJobs();
  }

  async createJob(newJob: JobRecord): Promise<JobRecord> {
    return this.database.addJob(newJob);
  }
}
