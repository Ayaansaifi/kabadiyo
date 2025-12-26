"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    HelpCircle, MessageCircle, Phone, Mail,
    ChevronDown, ChevronUp, Send, ExternalLink,
    Search, Recycle, Package, CreditCard, Star
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

const faqs = [
    {
        category: "Getting Started",
        icon: <Recycle className="h-5 w-5" />,
        questions: [
            {
                q: "How do I sell my scrap?",
                a: "Simply browse nearby Kabadiwalas on our Market page, select one based on ratings and rates, and book a pickup. The Kabadiwala will come to your doorstep at the scheduled time."
            },
            {
                q: "Is registration required?",
                a: "No! You can call our helpline directly at 8586040076 to book a pickup without registration. However, registered users get access to rewards, order history, and exclusive features."
            },
            {
                q: "What types of scrap can I sell?",
                a: "We accept newspapers, cardboard, plastic bottles, metal cans, e-waste, old appliances, glass, and more. Check the Kabadiwala's accepted materials before booking."
            }
        ]
    },
    {
        category: "Orders & Pickup",
        icon: <Package className="h-5 w-5" />,
        questions: [
            {
                q: "How do I track my pickup?",
                a: "Go to Dashboard > Orders to view all your pickups. You'll receive real-time notifications when the Kabadiwala accepts, is on the way, and completes pickup."
            },
            {
                q: "Can I cancel a pickup?",
                a: "Yes, you can cancel before the Kabadiwala confirms. Once confirmed, please contact them via chat to reschedule."
            },
            {
                q: "What if the Kabadiwala doesn't arrive?",
                a: "Contact our support or the Kabadiwala directly via chat. If unresolved, you can file a complaint and we'll take action."
            }
        ]
    },
    {
        category: "Payments & Rates",
        icon: <CreditCard className="h-5 w-5" />,
        questions: [
            {
                q: "How do I get paid?",
                a: "Payment is made in cash at the time of pickup. The Kabadiwala weighs your scrap and pays you based on the current market rates."
            },
            {
                q: "Are the rates fixed?",
                a: "Rates vary by Kabadiwala and market conditions. Check our Daily Rates ticker on the homepage for current market prices."
            },
            {
                q: "Can I negotiate prices?",
                a: "Yes! Use our chat feature to discuss rates with the Kabadiwala before the pickup."
            }
        ]
    },
    {
        category: "Reviews & Ratings",
        icon: <Star className="h-5 w-5" />,
        questions: [
            {
                q: "How do ratings work?",
                a: "After each completed pickup, you can rate the Kabadiwala from 1-5 stars and leave a review. This helps other users make informed decisions."
            },
            {
                q: "Can I change my review?",
                a: "Reviews cannot be edited once submitted, but you can contact support if you made an error."
            }
        ]
    }
]

export default function HelpPage() {
    const [openFaq, setOpenFaq] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [message, setMessage] = useState("")
    const [sending, setSending] = useState(false)

    const toggleFaq = (id: string) => {
        setOpenFaq(openFaq === id ? null : id)
    }

    const filteredFaqs = faqs.map(category => ({
        ...category,
        questions: category.questions.filter(
            q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
                q.a.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(category => category.questions.length > 0)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSending(true)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        toast.success("Message sent! We'll get back to you within 24 hours.")
        setName("")
        setEmail("")
        setMessage("")
        setSending(false)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50/50 to-blue-50/30 dark:from-background dark:to-background pb-24">
            <div className="container max-w-5xl mx-auto p-4 space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center pt-8"
                >
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
                        <HelpCircle className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                        Help & Support
                    </h1>
                    <p className="text-muted-foreground">
                        Find answers or get in touch with our team
                    </p>
                </motion.div>

                {/* Quick Contact Cards */}
                <div className="grid md:grid-cols-3 gap-4">
                    <Card className="border-green-200 hover:shadow-lg transition-shadow">
                        <CardContent className="p-6 flex flex-col items-center text-center">
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                                <Phone className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="font-semibold mb-1">Call Us</h3>
                            <a href="tel:8586040076" className="text-green-600 font-bold text-lg hover:underline">
                                8586040076
                            </a>
                            <p className="text-xs text-muted-foreground mt-1">9 AM - 8 PM, Mon-Sat</p>
                        </CardContent>
                    </Card>

                    <Card className="border-blue-200 hover:shadow-lg transition-shadow">
                        <CardContent className="p-6 flex flex-col items-center text-center">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                                <Mail className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold mb-1">Email Us</h3>
                            <a href="mailto:support@kabadiwala.app" className="text-blue-600 font-bold hover:underline">
                                support@kabadiwala.app
                            </a>
                            <p className="text-xs text-muted-foreground mt-1">Response within 24 hours</p>
                        </CardContent>
                    </Card>

                    <Card className="border-purple-200 hover:shadow-lg transition-shadow">
                        <CardContent className="p-6 flex flex-col items-center text-center">
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
                                <MessageCircle className="h-6 w-6 text-purple-600" />
                            </div>
                            <h3 className="font-semibold mb-1">WhatsApp</h3>
                            <a
                                href="https://wa.me/918586040076"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-600 font-bold hover:underline flex items-center gap-1"
                            >
                                Chat with us <ExternalLink className="h-3 w-3" />
                            </a>
                            <p className="text-xs text-muted-foreground mt-1">Fastest response</p>
                        </CardContent>
                    </Card>
                </div>

                {/* FAQ Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HelpCircle className="h-5 w-5 text-primary" />
                            Frequently Asked Questions
                        </CardTitle>
                        <CardDescription>Quick answers to common questions</CardDescription>

                        {/* Search */}
                        <div className="relative mt-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search FAQs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {filteredFaqs.map((category) => (
                            <div key={category.category} className="space-y-3">
                                <h3 className="font-semibold flex items-center gap-2 text-muted-foreground">
                                    {category.icon}
                                    {category.category}
                                </h3>
                                <div className="space-y-2">
                                    {category.questions.map((faq, idx) => {
                                        const faqId = `${category.category}-${idx}`
                                        const isOpen = openFaq === faqId
                                        return (
                                            <div
                                                key={faqId}
                                                className="border rounded-lg overflow-hidden"
                                            >
                                                <button
                                                    onClick={() => toggleFaq(faqId)}
                                                    className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                                                >
                                                    <span className="font-medium">{faq.q}</span>
                                                    {isOpen ? (
                                                        <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                                    ) : (
                                                        <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                                    )}
                                                </button>
                                                {isOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        className="px-4 pb-4 text-muted-foreground"
                                                    >
                                                        {faq.a}
                                                    </motion.div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}

                        {filteredFaqs.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-30" />
                                <p>No FAQs found for &quot;{searchQuery}&quot;</p>
                                <p className="text-sm">Try a different search or contact us below</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Contact Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Send className="h-5 w-5 text-primary" />
                            Send us a Message
                        </CardTitle>
                        <CardDescription>
                            Can't find what you're looking for? Drop us a message
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Name</label>
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Your name"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email</label>
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Message</label>
                                <Textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="How can we help you?"
                                    rows={4}
                                    required
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
                                disabled={sending}
                            >
                                {sending ? "Sending..." : "Send Message"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Back to Home */}
                <div className="text-center">
                    <Link href="/">
                        <Button variant="ghost" className="text-muted-foreground">
                            ← Back to Home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
