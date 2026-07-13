"use client";

import React from "react";
import { SaleorClient } from "../../core";

export type SaleorContextType = {
  client: SaleorClient;
};

export const SaleorContext = React.createContext<SaleorClient | null>(null);


if (typeof window !== "undefined") {
  const patchHistoryMethod = (type: "pushState" | "replaceState") => {
    const original = window.history[type];
    return function (this: History, ...args: any[]) {
      const result = (original as any).apply(this, args);
      const event = new Event(type);
      (event as any).arguments = args;
      window.dispatchEvent(event);
      return result;
    };
  };
  window.history.pushState = patchHistoryMethod("pushState") as any;
  window.history.replaceState = patchHistoryMethod("replaceState") as any;
}

export const SaleorProvider: React.FC<{ client: SaleorClient; children?: React.ReactNode }> = ({
  client,
  children,
}) => {
  const [context, setContext] = React.useState<SaleorClient>(client);

  React.useEffect(() => {
    setContext(client);
  }, [client]);

  React.useEffect(() => {
    if (typeof window === "undefined" || !client?.utilityFunctions?.metaSync) {
      return;
    }

    // Call on initial load/mount
    client.utilityFunctions.metaSync().catch((err) => {
      console.error("metaSync error on mount:", err);
    });

    let lastUrl = window.location.href;

    const handleRouteChange = () => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        client.utilityFunctions.metaSync().catch((err) => {
          console.error("metaSync error on route change:", err);
        });
      }
    };

    window.addEventListener("popstate", handleRouteChange);
    window.addEventListener("pushState", handleRouteChange);
    window.addEventListener("replaceState", handleRouteChange);

    return () => {
      window.removeEventListener("popstate", handleRouteChange);
      window.removeEventListener("pushState", handleRouteChange);
      window.removeEventListener("replaceState", handleRouteChange);
    };
  }, [client]);

  if (context) {
    return (
      <SaleorContext.Provider value={context}>
        {children}
      </SaleorContext.Provider>
    );
  }

  return null;
};
