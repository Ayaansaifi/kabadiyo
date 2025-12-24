
async function checkUrl(url) {
    try {
        console.log(`Fetching ${url}...`)
        const res = await fetch(url)
        console.log(`Status: ${res.status}`)
        console.log(`Content-Type: ${res.headers.get('content-type')}`)
        const text = await res.text()
        console.log(`Body Start: ${text.substring(0, 100)}`)
    } catch (e) {
        console.error("Fetch Error:", e)
    }
}

async function main() {
    console.log("--- TEST SESSION ---")
    await checkUrl('http://localhost:3000/api/auth/session')
    console.log("--- TEST CSRF ---")
    await checkUrl('http://localhost:3000/api/auth/csrf')
    console.log("--- TEST ORDERS ---")
    await checkUrl('http://localhost:3000/api/orders')
}

main()
