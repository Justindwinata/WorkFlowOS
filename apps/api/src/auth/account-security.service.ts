import { Injectable } from '@nestjs/common';

interface FailedAttempt {
  count: number;
  lockedUntil: number;
}

@Injectable()
export class AccountSecurityService {
  private readonly attempts = new Map<string, FailedAttempt>();
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCK_DURATION_MS = 15 * 60 * 1000;

  recordFailure(key: string) {
    const current = this.attempts.get(key) || { count: 0, lockedUntil: 0 };
    current.count += 1;

    if (current.count >= this.MAX_ATTEMPTS) {
      current.lockedUntil = Date.now() + this.LOCK_DURATION_MS;
      current.count = 0;
    }

    this.attempts.set(key, current);
  }

  clearFailures(key: string) {
    this.attempts.delete(key);
  }

  isLocked(key: string): boolean {
    const current = this.attempts.get(key);
    if (!current) return false;

    if (current.lockedUntil > 0 && current.lockedUntil > Date.now()) {
      return true;
    }

    if (current.lockedUntil > 0 && current.lockedUntil <= Date.now()) {
      this.attempts.delete(key);
      return false;
    }

    return false;
  }

  getRemainingAttempts(key: string): number {
    const current = this.attempts.get(key);
    if (!current) return this.MAX_ATTEMPTS;
    return this.MAX_ATTEMPTS - current.count;
  }
}