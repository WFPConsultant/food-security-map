export class PrevalenceMetric {
    constructor(metric) {
      this.metric = metric;
    }
  
    getPrevalence() {
      return this.metric.prevalence || 'No data available';
    }
  }