import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata = {
  title: "Reset your password",
  description: "Request a secure password reset link for your Nurtured & Nourished account.",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <ForgotPasswordForm />
      <div className="-mt-10 text-center text-sm text-charcoal/70">
        <Link href="/login" className="font-semibold text-primary underline underline-offset-4">
          Back to sign in
        </Link>
      </div>
    </>
  );
}
