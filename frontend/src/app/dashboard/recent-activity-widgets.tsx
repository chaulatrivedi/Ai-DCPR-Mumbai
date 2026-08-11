import { Card } from "@/components/ui/card";

// Genuinely empty until their real data sources exist — no mock/fake
// data (explicit instruction). Recent Chats lights up once Milestone 5
// (AI Search) exists; Recent Calculations once Milestone 6 (Calculator
// Engine) does.
export function RecentChatsWidget() {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-card-title font-medium text-ink">Recent Chats</h2>
      <Card>
        <p className="text-muted-body text-muted-foreground">
          Coming soon — AI Search (Milestone 5).
        </p>
      </Card>
    </section>
  );
}

export function RecentCalculationsWidget() {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-card-title font-medium text-ink">Recent Calculations</h2>
      <Card>
        <p className="text-muted-body text-muted-foreground">
          Coming soon — Calculator Engine (Milestone 6).
        </p>
      </Card>
    </section>
  );
}
