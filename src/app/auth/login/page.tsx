import AuthTemplate from "@/src/components/auth/auth-template";
import { LoginForm } from "@/src/components/auth/login-form";

export default function Page() {
  return (
    <AuthTemplate>
      <LoginForm />
    </AuthTemplate>
  );
}
