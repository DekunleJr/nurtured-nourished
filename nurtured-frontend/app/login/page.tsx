import LoginForm from "@/components/auth/LoginForm";

export const metadata = {
  title: "Sign in",
  description:
    "Sign in to your Nurtured & Nourished account to manage your programme, payments and cohort place.",
};

/**
 * The site's single sign-in page, used by customers and admins alike.
 *
 * The backend decides the role from the credentials and the form redirects to
 * the page the person was interrupted on (`?next=`), or to their role's home.
 */
export default function LoginPage() {
  return <LoginForm />;
}
