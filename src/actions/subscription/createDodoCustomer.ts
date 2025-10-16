"use server";

import { Customer } from "dodopayments/resources/index.mjs";

import { dodoClient } from "@/src/lib/dodoPayments";
import { ServerActionRes } from "@/src/types/serverAction";

export async function createDodoCustomer(props: {
  email: string;
  name?: string;
}): ServerActionRes<Customer> {
  try {
    const customer = await dodoClient.customers.create({
      email: props.email,
      name: props.name ? props.name : props.email.split("@")[0],
    });

    console.log("Dodo customer created:", customer);

    return { success: true, data: customer };
  } catch (error) {
    return { success: false, error: "Failed to create customer" };
  }
}
