
export async function getGeoInfo(ip: string) {
    // Skip for localhost / private IPs
    if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
        return { city: 'Local Dev', country: 'Localhost', isp: 'Internal' }
    }

    try {
        // Using ip-api.com (Free for non-commercial, rate limited)
        // In production, consider Vercel headers (x-vercel-ip-city) or a paid service
        const res = await fetch(`http://ip-api.com/json/${ip}`)
        const data = await res.json()
        if (data.status === 'success') {
            return {
                city: data.city,
                country: data.country,
                isp: data.isp,
                lat: data.lat,
                lon: data.lon
            }
        }
    } catch (error) {
        console.error("GeoIP Fetch Error", error)
    }
    return { city: 'Unknown City', country: 'Unknown Country' }
}
