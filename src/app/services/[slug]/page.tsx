import { notFound } from "next/navigation"
import { servicesData } from "@/lib/services-data"
import ServiceDetailPage from "@/components/services/ServiceDetailPage"

// Correctly typing params as a Promise for Next.js 15
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params
    const slug = resolvedParams.slug
    const data = servicesData[slug]

    if (!data || data.type !== 'service') {
        notFound()
    }

    return <ServiceDetailPage data={data} />
}
