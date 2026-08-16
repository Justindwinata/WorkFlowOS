import { Injectable, OnModuleInit } from '@nestjs/common';
import { Logger } from '@nestjs/common';

interface Metric {
  name: string;
  count: number;
}

@Injectable()
export class MetricsService implements OnModuleInit {
  private readonly logger = new Logger(MetricsService.name);
  private readonly counters = new Map<string, number>();
  private readonly labels = new Map<string, Map<string, number>>();

  onModuleInit() {
    this.logger.log('Metrics Service initialized');
  }

  incrementCounter(name: string, value = 1) {
    const current = this.counters.get(name) || 0;
    this.counters.set(name, current + value);
  }

  incrementLabeled(name: string, label: string, value = 1) {
    if (!this.labels.has(name)) {
      this.labels.set(name, new Map());
    }
    const labelMap = this.labels.get(name)!;
    labelMap.set(label, (labelMap.get(label) || 0) + value);
  }

  recordLatency(name: string, durationMs: number) {
    // Track in bucket: 0-100, 100-200, 200-500, 500-1000, >1s
    let label = '>1000';
    if (durationMs < 100) label = '0-100';
    else if (durationMs < 200) label = '100-200';
    else if (durationMs < 500) label = '200-500';
    else if (durationMs < 1000) label = '500-1000';
    this.incrementLabeled(`latency_ms_${name}`, label);
  }

  getCounter(name: string): number {
    return this.counters.get(name) || 0;
  }

  snapshot() {
    const counters: Record<string, number> = {};
    for (const [k, v] of this.counters) {
      counters[k] = v;
    }

    const labeled: Record<string, Record<string, number>> = {};
    for (const [name, labelMap] of this.labels) {
      labeled[name] = {};
      for (const [label, count] of labelMap) {
        labeled[name][label] = count;
      }
    }

    return { counters, labeled, timestamp: new Date().toISOString() };
  }
}