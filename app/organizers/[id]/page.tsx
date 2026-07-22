import { OrganizerProfile } from "@/components/organizer-profile";

export default async function OrganizerPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <OrganizerProfile id={id} />; }
