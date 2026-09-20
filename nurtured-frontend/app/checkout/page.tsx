import CheckoutFlow from "@/components/checkout/CheckoutFlow";

export const metadata = {
  title: "Secure your place",
  description:
    "Choose your cohort and payment plan for the Favour Oloye Birth Confidence Programme™.",
};

/**
 * The purchase flow. `?package=<slug>` decides which programme is being bought;
 * the component itself handles the sign-in gate, cohort choice and plan choice.
 */
export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ package?: string }>;
}) {
  const { package: packageSlug } = await searchParams;
  return <CheckoutFlow packageSlug={packageSlug ?? ""} />;
}
