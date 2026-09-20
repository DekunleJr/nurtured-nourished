import { redirect } from "next/navigation";

export const metadata = {
  title: "Book your place",
  description:
    "Secure your place on the Favour Oloye Birth Confidence Programme™ — or book a complimentary discovery call if you are not sure yet.",
};

type Props = { searchParams: Promise<{ package?: string }> };

// The old pay-first booking flow was replaced by the account-based checkout
// (pick a cohort that finishes before your due date, then a payment plan).
// Anyone arriving from an old link is sent to the new flow, carrying the
// package slug so the correct programme stays pre-selected.
export default async function BookingPage({ searchParams }: Props) {
  const params = await searchParams;
  const target = params.package
    ? `/checkout?package=${encodeURIComponent(params.package)}`
    : "/checkout";
  redirect(target);
}
