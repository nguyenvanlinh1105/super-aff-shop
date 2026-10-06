export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initReconciliationReminderScheduler } = await import(
      "@/lib/reconciliationReminderScheduler"
    );
    initReconciliationReminderScheduler();
  }
}
