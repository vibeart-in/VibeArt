import AuthTemplate from "@/src/components/auth/auth-template";
import { SignUpForm } from "@/src/components/auth/sign-up-form";

export default function Page() {
  return (
    <AuthTemplate modalHeight={500}>
      <SignUpForm />
    </AuthTemplate>
  );
}
