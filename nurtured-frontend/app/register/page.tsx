import RegisterForm from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Create your account",
  description:
    "Create a Nurtured & Nourished account to book your place on the Favour Oloye Birth Confidence Programme™.",
};

/** Customer sign-up — the entry point for anyone without login details yet. */
export default function RegisterPage() {
  return <RegisterForm />;
}
