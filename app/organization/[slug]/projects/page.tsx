import { createClient } from "@/app/utils/supabase";
import { cookies } from "next/headers";
import { ProjectList } from "@/app/components/ProjectList";
import { auth } from "@clerk/nextjs/server";

export default async function ProjectsPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params;
  const { orgId } = await auth();
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("client_projects")
    .select("*")
    .eq("clerk_organization_id", orgId)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <ProjectList projects={projects || []} organizationId={slug} />
    </div>
  );
}
