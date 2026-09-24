import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata = {
  title: "Choose a new password",
  description: "Choose a new password for your Nurtured & Nourished account.",
};

export default function ResetPasswordPage() {
  return (
    <>
      <ResetPasswordForm />
      <div className="-mt-10 text-center text-sm text-charcoal/70">
        <Link href="/login" className="font-semibold text-primary underline underline-offset-4">
          Back to sign in
        </Link>
      </div>
    </>
  );
}
