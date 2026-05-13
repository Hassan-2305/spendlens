import { describe, it, expect } from 'vitest'
import { runAudit, buildFallbackSummary } from '../../src/utils/auditEngine.js'

describe('Audit Engine — Plan fit logic', () => {
  it('flags Teams plan for single-user Cursor as overspending', () => {
    const entries = [{ toolId: 'cursor', planId: 'teams', seats: 1, monthlySpend: 40, enabled: true }]
    const result = runAudit(entries, 1, 'coding')
    const tool = result.results[0]
    expect(tool.status).toBe('overspending')
    expect(tool.savings).toBeGreaterThan(0)
  })

  it('flags Teams plan for 2-seat Cursor as overspending vs individual Pro', () => {
    const entries = [{ toolId: 'cursor', planId: 'teams', seats: 2, monthlySpend: 80, enabled: true }]
    const result = runAudit(entries, 2, 'coding')
    const tool = result.results[0]
    expect(tool.savings).toBeGreaterThanOrEqual(40)
    expect(tool.findings.length).toBeGreaterThan(0)
  })

  it('marks optimal Cursor Pro for single developer as no findings', () => {
    const entries = [{ toolId: 'cursor', planId: 'pro', seats: 1, monthlySpend: 20, enabled: true }]
    const result = runAudit(entries, 1, 'coding')
    const tool = result.results[0]
    expect(tool.findings.length).toBe(0)
    expect(tool.status).toBe('optimal')
  })

  it('flags Copilot Enterprise under 50 seats as overspending vs Business', () => {
    const entries = [{ toolId: 'copilot', planId: 'enterprise', seats: 10, monthlySpend: 390, enabled: true }]
    const result = runAudit(entries, 10, 'coding')
    const tool = result.results[0]
    expect(tool.savings).toBe(200)
    expect(tool.status).toBe('overspending')
  })

  it('flags Claude Team Premium for non-coding use case', () => {
    const entries = [{ toolId: 'claude', planId: 'team-prem', seats: 5, monthlySpend: 625, enabled: true }]
    const result = runAudit(entries, 5, 'writing')
    const tool = result.results[0]
    expect(tool.savings).toBeGreaterThan(0)
    expect(tool.findings.some(f => f.type === 'downgrade')).toBe(true)
  })

  it('correctly totals monthly and annual savings across multiple tools', () => {
    const entries = [
      { toolId: 'cursor', planId: 'teams', seats: 2, monthlySpend: 80, enabled: true },
      { toolId: 'copilot', planId: 'enterprise', seats: 2, monthlySpend: 78, enabled: true },
    ]
    const result = runAudit(entries, 2, 'coding')
    expect(result.totalMonthlySavings).toBeGreaterThan(0)
    expect(result.totalAnnualSavings).toBe(result.totalMonthlySavings * 12)
  })

  it('returns zero savings for already-optimal small stack', () => {
    const entries = [
      { toolId: 'copilot', planId: 'pro', seats: 1, monthlySpend: 10, enabled: true },
    ]
    const result = runAudit(entries, 1, 'coding')
    expect(result.totalMonthlySavings).toBe(0)
  })

  it('fallback summary includes savings amount when nonzero', () => {
    const mockAudit = { totalMonthlySavings: 200, totalAnnualSavings: 2400, results: [] }
    const summary = buildFallbackSummary(mockAudit, 5, 'coding')
    expect(summary).toContain('200')
    expect(summary).toContain('2400')
  })

  it('fallback summary says well-optimized when savings is zero', () => {
    const mockAudit = { totalMonthlySavings: 0, totalAnnualSavings: 0, results: [] }
    const summary = buildFallbackSummary(mockAudit, 5, 'coding')
    expect(summary.toLowerCase()).toContain('optimized')
  })

  it('API spend under $50 gets subscription recommendation', () => {
    const entries = [{ toolId: 'anthropic_api', planId: 'payg', seats: 1, monthlySpend: 30, enabled: true }]
    const result = runAudit(entries, 1, 'writing')
    const tool = result.results[0]
    expect(tool.findings.some(f => f.type === 'alternative')).toBe(true)
  })
})
