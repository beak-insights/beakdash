import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Database Quality Assurance",
  description: "Monitor and maintain the quality of your database with automated checks",
};

export default async function DbQaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/auth?callbackUrl=/db-qa/queries");
  }

  return (
    <>
      <div className="flex-1 flex flex-col w-full">
        {children}
      </div>
    </>
  );
}