import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import Stripe from "stripe";

const stripeKey = process.env.STRIPE_SECRET_KEY || "";
const stripe = stripeKey ? new Stripe(stripeKey) : null;

const PLAN_PRICES: Record<string, { name: string; amount: number; credits: number }> = {
  starter: { name: "ZoneX Starter Plan", amount: 1900, credits: 200 },
  pro: { name: "ZoneX Pro Plan", amount: 4900, credits: 800 },
  business: { name: "ZoneX Business Plan", amount: 14900, credits: 3000 },
  credits_100: { name: "ZoneX 100 Credits Pack", amount: 1000, credits: 100 },
  credits_500: { name: "ZoneX 500 Credits Pack", amount: 3500, credits: 500 },
};

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const planId = body.planId as string;
    const plan = PLAN_PRICES[planId];

    if (!plan) {
      return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (!stripe) {
      return NextResponse.json({
        error: "Stripe is not configured in .env.local",
      }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: plan.name,
              description: `Includes ${plan.credits.toLocaleString()} AI generation credits for ZoneX`,
            },
            unit_amount: plan.amount,
            recurring: planId.startsWith("credits_") ? undefined : { interval: "month" },
          },
          quantity: 1,
        },
      ],
      mode: planId.startsWith("credits_") ? "payment" : "subscription",
      customer_email: user?.emailAddresses?.[0]?.emailAddress || undefined,
      client_reference_id: userId,
      metadata: {
        userId,
        planId,
        credits: plan.credits.toString(),
      },
      success_url: `${appUrl}/dashboard?payment=success&credits=${plan.credits}`,
      cancel_url: `${appUrl}/dashboard/settings?payment=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe Checkout Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
