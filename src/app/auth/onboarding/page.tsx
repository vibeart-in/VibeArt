import { redirect } from "next/navigation";

import { getUser } from "@/src/actions/getUser";
import { ensureDodoCustomer } from "@/src/actions/subscription/createUser";
import OnboardingClient from "@/src/components/onboarding/onboardingClient";

export default async function OnboardingPage() {
  const customerResult = await ensureDodoCustomer();

  if (!customerResult.success) {
    const userResult = await getUser();

    if (!userResult.success) {
      redirect("/auth/signup");
    }

    return <OnboardingClient user={userResult.data} />;
  }

  if (customerResult.alreadyExists) {
    redirect("/generate/image");
  }

  const userResult = await getUser();
  const user = userResult.success ? userResult.data : null;

  return (
    <div>
      <OnboardingClient user={user} />
    </div>
  );
}
