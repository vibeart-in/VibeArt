"use client";

import { Provider } from "jotai";

export const JotaiProviders = ({ children }: { children: React.ReactNode }) => {
  return <Provider>{children}</Provider>;
};
