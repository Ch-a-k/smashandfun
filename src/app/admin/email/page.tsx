"use client";
import { withAdminAuth } from "../components/withAdminAuth";
import EmailDashboard from "./EmailDashboard";

function EmailPage() {
  return <EmailDashboard />;
}

export default withAdminAuth(EmailPage);
