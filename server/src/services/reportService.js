const ProgressReport = require('../models/ProgressReport');
const Screening = require('../models/Screening');
const User = require('../models/User');

class ReportService {
  /**
   * Generate comprehensive health report
   */
  async generateReport(userId, reportType = 'comprehensive', dateRange = null) {
    try {
      const user = await User.findById(userId);
      
      // Define date range
      const endDate = dateRange?.endDate || new Date();
      const startDate = dateRange?.startDate || new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000); // Last 3 months

      // Fetch all screenings in range
      const screenings = await Screening.find({
        userId,
        createdAt: { $gte: startDate, $lte: endDate }
      }).sort({ createdAt: 1 });

      // Analyze by type
      const eyeHealthMetrics = this.analyzeEyeHealth(screenings);
      const mentalHealthMetrics = this.analyzeMentalHealth(screenings);
      const cognitiveHealthMetrics = this.analyzeCognitiveHealth(screenings);

      // Generate summary
      const summary = this.generateSummary(screenings, {
        eyeHealthMetrics,
        mentalHealthMetrics,
        cognitiveHealthMetrics
      });

      // Generate recommendations
      const recommendations = this.generateRecommendations({
        eyeHealthMetrics,
        mentalHealthMetrics,
        cognitiveHealthMetrics
      });

      // Create report
      const report = await ProgressReport.create({
        userId,
        reportType,
        period: {
          startDate,
          endDate
        },
        screeningsIncluded: screenings.map(s => s._id),
        summary,
        metrics: {
          eyeHealth: eyeHealthMetrics,
          mentalHealth: mentalHealthMetrics,
          cognitiveHealth: cognitiveHealthMetrics
        },
        recommendations
      });

      return report;
    } catch (error) {
      console.error('Report generation error:', error);
      throw error;
    }
  }

  analyzeEyeHealth(screenings) {
    const eyeScreenings = screenings.filter(s => s.type === 'eye_disease');

    if (eyeScreenings.length === 0) {
      return {
        scansCount: 0,
        latestResult: 'No scans',
        trend: 'N/A',
        riskScore: 0
      };
    }

    const latest = eyeScreenings[eyeScreenings.length - 1];
    const first = eyeScreenings[0];

    // Calculate trend
    let trend = 'stable';
    if (eyeScreenings.length >= 2) {
      if (latest.results.severity > first.results.severity) {
        trend = 'declining';
      } else if (latest.results.severity < first.results.severity) {
        trend = 'improving';
      }
    }

    // Calculate risk score (0-100)
    const severityScore = {
      'none': 0,
      'low': 20,
      'moderate': 50,
      'high': 80,
      'urgent': 100
    };
    const riskScore = severityScore[latest.results.severity] || 0;

    return {
      scansCount: eyeScreenings.length,
      latestResult: latest.results.prediction,
      trend,
      riskScore,
      allResults: eyeScreenings.map(s => ({
        date: s.createdAt,
        result: s.results.prediction,
        confidence: s.results.confidence
      }))
    };
  }

  analyzeMentalHealth(screenings) {
    const mentalScreenings = screenings.filter(s => s.type === 'mental_health');

    if (mentalScreenings.length === 0) {
      return {
        assessmentsCount: 0,
        trend: 'N/A',
        averageScore: 0
      };
    }

    const phq9Scores = mentalScreenings
      .filter(s => s.results.detailedAnalysis?.score !== undefined)
      .map(s => s.results.detailedAnalysis.score);

    const latest = mentalScreenings[mentalScreenings.length - 1];
    const first = mentalScreenings[0];

    // Calculate trend
    let trend = 'stable';
    if (phq9Scores.length >= 2) {
      const latestScore = phq9Scores[phq9Scores.length - 1];
      const firstScore = phq9Scores[0];
      
      if (latestScore < firstScore) {
        trend = 'improving';
      } else if (latestScore > firstScore) {
        trend = 'declining';
      }
    }

    const averageScore = phq9Scores.length > 0 
      ? phq9Scores.reduce((a, b) => a + b, 0) / phq9Scores.length 
      : 0;

    return {
      assessmentsCount: mentalScreenings.length,
      phq9Scores,
      gad7Scores: [], // If implemented
      trend,
      averageScore: Math.round(averageScore * 10) / 10,
      allAssessments: mentalScreenings.map(s => ({
        date: s.createdAt,
        severity: s.results.severity,
        score: s.results.detailedAnalysis?.score
      }))
    };
  }

  analyzeCognitiveHealth(screenings) {
    const cognitiveScreenings = screenings.filter(s => s.type === 'cognitive_health');

    if (cognitiveScreenings.length === 0) {
      return {
        assessmentsCount: 0,
        overallScore: 0,
        trend: 'N/A',
        areasOfConcern: []
      };
    }

    const latest = cognitiveScreenings[cognitiveScreenings.length - 1];

    // Calculate overall score (simplified)
    const overallScore = 100 - (latest.results.confidence * 100);

    return {
      assessmentsCount: cognitiveScreenings.length,
      overallScore: Math.round(overallScore),
      trend: 'stable', // Would need more complex logic
      areasOfConcern: latest.results.detailedAnalysis?.areas_of_concern || []
    };
  }

  generateSummary(screenings, metrics) {
    const improvements = [];
    const concerns = [];

    // Eye health
    if (metrics.eyeHealthMetrics.trend === 'improving') {
      improvements.push('Eye health showing improvement');
    } else if (metrics.eyeHealthMetrics.trend === 'declining') {
      concerns.push('Eye health requires attention');
    }

    // Mental health
    if (metrics.mentalHealthMetrics.trend === 'improving') {
      improvements.push('Mental health improving consistently');
    } else if (metrics.mentalHealthMetrics.trend === 'declining') {
      concerns.push('Mental health showing decline');
    }

    const overallHealth = concerns.length === 0 ? 'Good' : 
                         concerns.length <= 2 ? 'Fair' : 'Needs Attention';

    return {
      overallHealth,
      improvements,
      concerns,
      trends: {
        eyeHealth: metrics.eyeHealthMetrics.trend,
        mentalHealth: metrics.mentalHealthMetrics.trend,
        cognitiveHealth: metrics.cognitiveHealthMetrics.trend
      }
    };
  }

  generateRecommendations(metrics) {
    const recommendations = {
      lifestyle: [],
      followUps: [],
      specialists: []
    };

    // Eye health recommendations
    if (metrics.eyeHealthMetrics.riskScore > 50) {
      recommendations.followUps.push('Schedule eye examination within 2 weeks');
      recommendations.specialists.push('Ophthalmologist');
    }
    recommendations.lifestyle.push('Regular eye rest (20-20-20 rule)');
    recommendations.lifestyle.push('Wear UV-blocking sunglasses');

    // Mental health recommendations
    if (metrics.mentalHealthMetrics.averageScore > 10) {
      recommendations.followUps.push('Consider counseling session');
      recommendations.specialists.push('Clinical Psychologist');
    }
    recommendations.lifestyle.push('Practice mindfulness meditation');
    recommendations.lifestyle.push('Maintain regular sleep schedule');

    // Cognitive health recommendations
    if (metrics.cognitiveHealthMetrics.areasOfConcern.length > 0) {
      recommendations.followUps.push('Cognitive assessment recommended');
      recommendations.specialists.push('Neurologist');
    }
    recommendations.lifestyle.push('Engage in brain-stimulating activities');
    recommendations.lifestyle.push('Regular physical exercise');

    return recommendations;
  }

  /**
   * Get existing report
   */
  async getReport(reportId) {
    try {
      const report = await ProgressReport.findById(reportId)
        .populate('screeningsIncluded');
      return report;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all reports for user
   */
  async getUserReports(userId, limit = 10) {
    try {
      const reports = await ProgressReport.find({ userId })
        .sort({ generatedAt: -1 })
        .limit(limit);
      return reports;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ReportService();
