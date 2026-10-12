declare module "generated" {
  export const CarryLedger: {
    HedgeOpened: { handler: (fn: (args: { event: any; context: any }) => Promise<void>) => void };
    HedgeRebalanced: { handler: (fn: (args: { event: any; context: any }) => Promise<void>) => void };
    HedgeClosed: { handler: (fn: (args: { event: any; context: any }) => Promise<void>) => void };
    GuardTriggered: { handler: (fn: (args: { event: any; context: any }) => Promise<void>) => void };
    EmergencyUnwind: { handler: (fn: (args: { event: any; context: any }) => Promise<void>) => void };
    PolicySet: { handler: (fn: (args: { event: any; context: any }) => Promise<void>) => void };
  };

  export const KuruOrderBook: {
    Trade: { handler: (fn: (args: { event: any; context: any }) => Promise<void>) => void };
  };
}
