import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { plannerAgent } from '@/lib/ai/agents'
import { validateRequest, handleError } from '@/lib/utils/validation'

const planMealsSchema = z.object({
  weekStart: z.string().datetime().or(z.date()),
  budget: z.number().positive().optional(),
  timeConstraints: z.object({
    maxPrepTime: z.number().positive().optional(),
    maxCookTime: z.number().positive().optional(),
  }).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const { weekStart, budget, timeConstraints } = await validateRequest(req, planMealsSchema)

    // Convertir la date si nécessaire
    const startDate = typeof weekStart === 'string' ? new Date(weekStart) : weekStart

    // Générer le plan de repas avec l'agent Planificateur
    const mealPlan = await plannerAgent.generateMealPlan(startDate, budget, timeConstraints)

    return NextResponse.json(
      { 
        data: mealPlan,
        message: 'Plan de repas généré avec succès'
      },
      { status: 200 }
    )
  } catch (error) {
    const { error: errorMessage, status } = handleError(error)
    return NextResponse.json({ error: errorMessage }, { status })
  }
} 