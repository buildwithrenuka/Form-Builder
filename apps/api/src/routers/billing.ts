import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { router, authProc } from '../trpc';
import { users } from '../db/schema';
import { CreateCreatorPlanOrderInput, VerifyCreatorPlanPaymentInput } from '../schemas';
import { createRazorpayOrder, verifyRazorpayPayment } from '../razorpay';
import { sendCreatorPlanConfirmation } from '../email';

const CREATOR_PLANS = {
  adventurer: {
    id: 'adventurer',
    name: 'Adventurer',
    amount: 1200,
    currency: 'INR',
    description: 'FormVerse Adventurer creator plan',
  },
  legend: {
    id: 'legend',
    name: 'Legend',
    amount: 4900,
    currency: 'INR',
    description: 'FormVerse Legend creator plan',
  },
} as const;

function getCreatorPlan(planId: keyof typeof CREATOR_PLANS) {
  return CREATOR_PLANS[planId];
}

function getCreatorPlanRank(planId: keyof typeof CREATOR_PLANS | null | undefined): number {
  if (!planId) return -1;
  return planId === 'legend' ? 1 : 0;
}

function getExistingPlanConflictMessage(currentPlanId: keyof typeof CREATOR_PLANS, requestedPlanId: keyof typeof CREATOR_PLANS): string {
  if (currentPlanId === requestedPlanId) {
    return `You already have the ${CREATOR_PLANS[currentPlanId].name} plan active.`;
  }

  return `You already have the higher ${CREATOR_PLANS[currentPlanId].name} plan active.`;
}

export const billingRouter = router({
  createCreatorPlanOrder: authProc
    .input(CreateCreatorPlanOrderInput)
    .mutation(async ({ input, ctx }) => {
      const creator = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.userId),
        columns: { id: true, name: true, email: true, creatorPlanId: true },
      });

      if (!creator) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Your session is no longer valid.' });
      }

      const plan = getCreatorPlan(input.planId);
      if (creator.creatorPlanId && getCreatorPlanRank(creator.creatorPlanId) >= getCreatorPlanRank(plan.id)) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: getExistingPlanConflictMessage(creator.creatorPlanId, plan.id),
        });
      }

      const order = await createRazorpayOrder(ctx.env, {
        amount: plan.amount,
        currency: plan.currency,
        receipt: `creator_${creator.id.slice(0, 12)}_${Date.now()}`,
        notes: {
          billingType: 'creator_plan',
          creatorId: creator.id,
          creatorEmail: creator.email,
          planId: plan.id,
        },
      });

      return {
        keyId: ctx.env.RAZORPAY_KEY_ID,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        planId: plan.id,
        planName: plan.name,
        description: plan.description,
        prefill: {
          name: creator.name,
          email: creator.email,
        },
      };
    }),

  verifyCreatorPlanPayment: authProc
    .input(VerifyCreatorPlanPaymentInput)
    .mutation(async ({ input, ctx }) => {
      const creator = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.userId),
        columns: { id: true, name: true, email: true, creatorPlanId: true },
      });

      if (!creator) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Your session is no longer valid.' });
      }

      const plan = getCreatorPlan(input.planId);
      if (creator.creatorPlanId && getCreatorPlanRank(creator.creatorPlanId) >= getCreatorPlanRank(plan.id)) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: getExistingPlanConflictMessage(creator.creatorPlanId, plan.id),
        });
      }

      const details = await verifyRazorpayPayment(ctx.env, input.payment, {
        amount: plan.amount,
        currency: plan.currency,
      });

      await ctx.db
        .update(users)
        .set({
          creatorPlanId: plan.id,
          creatorPlanActivatedAt: new Date(),
          creatorPlanPaymentId: details.id,
          creatorPlanOrderId: details.order_id,
        })
        .where(eq(users.id, creator.id));

      await sendCreatorPlanConfirmation(ctx.env, {
        creatorEmail: creator.email,
        creatorName: creator.name,
        planName: plan.name,
        amount: details.amount,
        currency: details.currency,
        paymentId: details.id,
        orderId: details.order_id,
      });

      return {
        verified: true,
        planId: plan.id,
        planName: plan.name,
        previousPlanId: creator.creatorPlanId,
        paymentId: details.id,
        orderId: details.order_id,
        amount: details.amount,
        currency: details.currency,
        status: details.status,
      };
    }),
});