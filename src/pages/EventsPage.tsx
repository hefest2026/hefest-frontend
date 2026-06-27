import { useState } from "react";
import { useAuth } from "@/auth/auth-context";
import { AccountTab } from "@/components/common/account-tab";
import { EventsLayout } from "@/components/common/events-layout";
import { EventManager } from "@/components/organizer part/event-manager";
import { StudentEventsList } from "@/components/student part/student-events";

/** Student view: tab chrome + list or account tab. */
function StudentPage() {
  const [activeTab, setActiveTab] = useState<"all-events" | "account">(
    "all-events",
  );

  return (
    <EventsLayout
      activeTab={activeTab}
      onTabChange={(id) => setActiveTab(id as "all-events" | "account")}
      tabs={[{ id: "all-events", label: "Всички събития" }]}
    >
      {activeTab === "account" ? <AccountTab /> : <StudentEventsList />}
    </EventsLayout>
  );
}

/** Role-based entry point. Organizers land on the organizer panel; students see the events list. */
export default function EventsPage() {
  const { role } = useAuth();

  if (role === "organizer") return <EventManager />;
  return <StudentPage />;
}
