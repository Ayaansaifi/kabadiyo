export interface ScrapCategory {
    id: string;
    label: string;
    category: string;
    defaultRate: number; // Estimated market rate
}

export const SCRAP_CATEGORIES: ScrapCategory[] = [
    // METALS
    { id: "iron-heavy", label: "Iron (Heavy)", category: "Metal", defaultRate: 35 },
    { id: "iron-light", label: "Iron (Light/Sheet)", category: "Metal", defaultRate: 28 },
    { id: "steel-304", label: "Stainless Steel (304)", category: "Metal", defaultRate: 110 },
    { id: "steel-202", label: "Stainless Steel (202)", category: "Metal", defaultRate: 70 },
    { id: "copper-wire", label: "Copper Wire (Clean)", category: "Metal", defaultRate: 650 },
    { id: "copper-mixed", label: "Copper Mixed", category: "Metal", defaultRate: 580 },
    { id: "brass-utensils", label: "Brass Utensils", category: "Metal", defaultRate: 420 },
    { id: "brass-honey", label: "Brass Honey", category: "Metal", defaultRate: 380 },
    { id: "aluminium-wire", label: "Aluminium Wire", category: "Metal", defaultRate: 180 },
    { id: "aluminium-utensils", label: "Aluminium Utensils", category: "Metal", defaultRate: 140 },
    { id: "aluminium-cans", label: "Aluminium Cans", category: "Metal", defaultRate: 110 },
    { id: "lead", label: "Lead", category: "Metal", defaultRate: 140 },
    { id: "zinc", label: "Zinc", category: "Metal", defaultRate: 160 },
    { id: "tin", label: "Tin/Canister", category: "Metal", defaultRate: 25 },

    // PAPER
    { id: "news-eng", label: "Newspaper (English)", category: "Paper", defaultRate: 14 },
    { id: "news-hindi", label: "Newspaper (Hindi/Local)", category: "Paper", defaultRate: 12 },
    { id: "copies", label: "School Copies/Books", category: "Paper", defaultRate: 15 },
    { id: "cardboard", label: "Cardboard (Corrugated)", category: "Paper", defaultRate: 8 },
    { id: "office-paper", label: "Office Paper (A4)", category: "Paper", defaultRate: 12 },
    { id: "magazines", label: "Magazines", category: "Paper", defaultRate: 10 },
    { id: "cartons", label: "Carton Boxes", category: "Paper", defaultRate: 7 },
    { id: "shredded-paper", label: "Shredded Paper", category: "Paper", defaultRate: 5 },
    { id: "hardcover-books", label: "Hardcover Books", category: "Paper", defaultRate: 8 },

    // PLASTIC
    { id: "pet-bottles", label: "PET Bottles (Clear)", category: "Plastic", defaultRate: 25 },
    { id: "pet-colored", label: "PET Bottles (Colored)", category: "Plastic", defaultRate: 15 },
    { id: "hdpe-milk", label: "Milk Pouches (Clean)", category: "Plastic", defaultRate: 10 },
    { id: "hdpe-cans", label: "HDPE Cans/Drums", category: "Plastic", defaultRate: 35 },
    { id: "ldpe-soft", label: "Soft Plastic (LDPE)", category: "Plastic", defaultRate: 15 },
    { id: "pp-hard", label: "Hard Plastic (Buckets/Mugs)", category: "Plastic", defaultRate: 12 },
    { id: "pvc-pipes", label: "PVC Pipes", category: "Plastic", defaultRate: 18 },
    { id: "cd-dvd", label: "CDs/DVDs", category: "Plastic", defaultRate: 20 },
    { id: "plastic-chairs", label: "Plastic Chairs/Furniture", category: "Plastic", defaultRate: 15 },
    { id: "oil-tins-plastic", label: "Oil Cans (Plastic)", category: "Plastic", defaultRate: 12 },

    // E-WASTE
    { id: "fridge", label: "Refrigerator (Double Door)", category: "E-Waste", defaultRate: 1000 },
    { id: "fridge-single", label: "Refrigerator (Single Door)", category: "E-Waste", defaultRate: 700 },
    { id: "ac-split-outer", label: "Split AC (Outer Unit)", category: "E-Waste", defaultRate: 2500 },
    { id: "ac-split-inner", label: "Split AC (Inner Unit)", category: "E-Waste", defaultRate: 1500 },
    { id: "ac-window", label: "Window AC 1.5 Ton", category: "E-Waste", defaultRate: 3500 },
    { id: "washing-machine-auto", label: "Washing Machine (Auto)", category: "E-Waste", defaultRate: 800 },
    { id: "washing-machine-semi", label: "Washing Machine (Semi)", category: "E-Waste", defaultRate: 500 },
    { id: "microwave", label: "Microwave Oven", category: "E-Waste", defaultRate: 300 },
    { id: "laptop-working", label: "Laptop (Working - i3/i5)", category: "E-Waste", defaultRate: 5000 },
    { id: "laptop-scrap", label: "Laptop (Scrap)", category: "E-Waste", defaultRate: 300 },
    { id: "monitor-crt", label: "Monitor (CRT)", category: "E-Waste", defaultRate: 150 },
    { id: "monitor-lcd", label: "Monitor (LCD/LED)", category: "E-Waste", defaultRate: 200 },
    { id: "cpu-cabinet", label: "CPU Cabinet", category: "E-Waste", defaultRate: 250 },
    { id: "motherboard", label: "Motherboard", category: "E-Waste", defaultRate: 150 },
    { id: "hard-disk", label: "Hard Disk Drive", category: "E-Waste", defaultRate: 20 },
    { id: "ups", label: "UPS (with Battery)", category: "E-Waste", defaultRate: 180 },
    { id: "ups-no-bat", label: "UPS (without Battery)", category: "E-Waste", defaultRate: 50 },
    { id: "printer", label: "Printer/Scanner", category: "E-Waste", defaultRate: 100 },
    { id: "fan", label: "Ceiling Fan", category: "E-Waste", defaultRate: 50 },
    { id: "cooler-plastic", label: "Air Cooler (Plastic)", category: "E-Waste", defaultRate: 150 },
    { id: "cooler-iron", label: "Air Cooler (Iron)", category: "E-Waste", defaultRate: 300 },
    { id: "tv-led", label: "LED/LCD TV (Broken)", category: "E-Waste", defaultRate: 150 },
    { id: "mobile-scrap", label: "Mobile Phone (Scrap)", category: "E-Waste", defaultRate: 20 },
    { id: "wires-cables", label: "Wires & Cables (Mixed)", category: "E-Waste", defaultRate: 50 },
    { id: "inverter", label: "Inverter", category: "E-Waste", defaultRate: 500 },
    { id: "battery-inverter", label: "Inverter Battery (Lead Acid)", category: "E-Waste", defaultRate: 2500 },
    { id: "car-battery", label: "Car Battery", category: "E-Waste", defaultRate: 800 },

    // VEHICLES
    { id: "bicycle", label: "Bicycle (Scrap)", category: "Vehicle", defaultRate: 300 },
    { id: "bike-scooter", label: "Bike/Scooter (Scrap)", category: "Vehicle", defaultRate: 2500 },
    { id: "car-scrap", label: "Car (Scrap - Small)", category: "Vehicle", defaultRate: 15000 },

    // GLASS
    { id: "glass-bottles", label: "Beer/Glass Bottles", category: "Glass", defaultRate: 2 },
    { id: "window-glass", label: "Window Glass (Mixed)", category: "Glass", defaultRate: 1 },

    // OTHER
    { id: "mattress-single", label: "Mattress (Single)", category: "Other", defaultRate: 50 },
    { id: "mattress-double", label: "Mattress (Double)", category: "Other", defaultRate: 100 },
    { id: "sofa-seat", label: "Sofa Set (Per Seat)", category: "Other", defaultRate: 50 },
    { id: "wood-scrap", label: "Wood Scrap", category: "Other", defaultRate: 2 },
    { id: "tyres-bike", label: "Tyre (Bike)", category: "Other", defaultRate: 10 },
    { id: "tyres-car", label: "Tyre (Car)", category: "Other", defaultRate: 20 },
    { id: "mixed-trash", label: "Mixed Trash (Not Recyclable)", category: "Other", defaultRate: 0 },
];
