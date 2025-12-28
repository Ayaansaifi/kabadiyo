import { LucideIcon, Armchair, Hammer, Sparkles, HelpingHand, Zap, DoorOpen, Cog, Wrench, Laptop, Factory } from "lucide-react"

export interface ServiceData {
    id: string
    title: string
    description: string
    iconName: string // Changed from component to string to avoid serialization issues
    features: string[]
    image: string
    type: 'service' | 'buyer'
    ctaText: string
}

export const servicesData: Record<string, ServiceData> = {
    // SERVICES
    "furniture": {
        id: "furniture",
        title: "Furniture Repair & Making",
        description: "Expert carpentry services for all your furniture needs. From repairing old chairs to creating custom sofas, our verified carpenters deliver quality craftsmanship at your doorstep.",
        iconName: "Armchair",
        features: [
            "Sofa & Chair Repair",
            "Custom Furniture Design",
            "Polishing & Varnishing",
            "Door & Window Repair",
            "Termite Treatment"
        ],
        image: "/images/services/furniture_bg.jpg",
        type: "service",
        ctaText: "Book Carpenter"
    },
    "welding": {
        id: "welding",
        title: "Professional Welding",
        description: "High-quality welding services for gates, grills, and structural repairs. We ensure strong, durable joints and precise fabrication work.",
        iconName: "Sparkles",
        features: [
            "Gate & Grill Repair",
            "Structural Fabrication",
            "Iron Shed Installation",
            "Broken Metal Fixes",
            "On-site Welding Support"
        ],
        image: "/images/services/welding_bg.jpg",
        type: "service",
        ctaText: "Book Welder"
    },
    "cleaning": {
        id: "cleaning",
        title: "Deep Cleaning Services",
        description: "Sparkling clean homes and offices. Our professional cleaners use eco-friendly products to deep clean your space, removing dust, stains, and allergens.",
        iconName: "Sparkles",
        features: [
            "Full Home Deep Cleaning",
            "Sofa & Carpet Shampooing",
            "Kitchen & Bathroom Cleaning",
            "Water Tank Cleaning",
            "Post-Construction Cleanup"
        ],
        image: "/images/services/cleaning_bg.jpg",
        type: "service",
        ctaText: "Book Cleaner"
    },
    "helper": {
        id: "helper",
        title: "General Helper / Labor",
        description: "Need an extra pair of hands? Hire verified helpers for shifting, loading-unloading, gardening, or any general labor tasks.",
        iconName: "HelpingHand",
        features: [
            "Shifting Assistance",
            "Loading & Unloading",
            "Garden Maintenance",
            "Event Setup Help",
            "General Utility Work"
        ],
        image: "/images/services/helper_bg.jpg",
        type: "service",
        ctaText: "Hire Helper"
    },
    "electrician": {
        id: "electrician",
        title: "Expert Electrician",
        description: "Safety-first electrical services. From fixing fans and lights to complete house wiring, our certified electricians handle it all.",
        iconName: "Zap",
        features: [
            "Wiring & Switchboard Fixes",
            "Fan & Light Installation",
            "Inverter & Battery Setup",
            "MCB & Fuse Repair",
            "Appliance Installation"
        ],
        image: "/images/services/electrician_bg.jpg",
        type: "service",
        ctaText: "Book Electrician"
    },
    "fabrication": {
        id: "fabrication",
        title: "Steel Gate & Fabrication",
        description: "Custom steel fabrication for modern homes. We design and install steel gates, railings, and safety doors with premium finish.",
        iconName: "DoorOpen",
        features: [
            "SS Railing Installation",
            "Steel Gate Manufacturing",
            "Safety Door Grills",
            "Custom Metal Works",
            "Durability Guarantee"
        ],
        image: "/images/services/fabrication_bg.jpg",
        type: "service",
        ctaText: "Get Quote"
    },
    "hydraulic": {
        id: "hydraulic",
        title: "Hydraulic Machine Service",
        description: "Specialized maintenance for hydraulic baling machines and industrial compactors used in scrap processing.",
        iconName: "Cog",
        features: [
            "Pump & Valve Repair",
            "Cylinder Leakage Fix",
            "Oil Change & Service",
            "Pressure Testing",
            "Annual Maintenance"
        ],
        image: "/images/services/hydraulic_bg.jpg",
        type: "service",
        ctaText: "Request Service"
    },
    "plumber": {
        id: "plumber",
        title: "Plumbing Services",
        description: "Leak-free living. Certified plumbers for tap repairs, pipe fittings, leakage detection, and bathroom fittings installation.",
        iconName: "Wrench",
        features: [
            "Tap & Shower Repair",
            "Pipe Leakage Fix",
            "Water Tank Installation",
            "Sink & Basin Fitting",
            "Drainage Cleaning"
        ],
        image: "/images/services/plumber_bg.jpg",
        type: "service",
        ctaText: "Book Plumber"
    },

    // BUYERS
    "laptops": {
        id: "laptops",
        title: "Bulk Laptop Buyer",
        description: "We buy old, non-working, or scrap laptops in bulk. Best prices for corporate lots, e-waste recyclers, and institutions.",
        iconName: "Laptop",
        features: [
            "Corporate Buyback Plans",
            "Data Destruction Certificate",
            "Instant Quote for Lots",
            "Free Doorstep Pickup",
            "GST Invoice Support"
        ],
        image: "/images/services/laptop_bg.jpg",
        type: "buyer",
        ctaText: "Sell Laptops"
    },
    "office-scrap": {
        id: "office-scrap",
        title: "Office Scrap Buyer",
        description: "Dismantling and buying office assets including furniture, partitions, AC plants, and IT infrastructure. Complete clearance services.",
        iconName: "Factory",
        features: [
            "Office Dismantling",
            "Furniture & AC Scrap",
            "IT Asset Disposal",
            "Cable & Wiring Scrap",
            "Same Day Clearance"
        ],
        image: "/images/services/office_bg.jpg",
        type: "buyer",
        ctaText: "Sell Office Scrap"
    }
}
