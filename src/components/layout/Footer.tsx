"use client"

import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin, Heart, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
    return (
        <footer className="bg-slate-950 text-slate-200 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="h-10 w-10 bg-green-500 rounded-xl flex items-center justify-center">
                                <span className="text-2xl font-black text-white">K</span>
                            </div>
                            <span className="text-2xl font-bold text-white tracking-tight">Kabadiyo</span>
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Transforming waste management in India. Sell scrap, save environment, and feed the needy through our food rescue initiative.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="p-2 bg-slate-900 rounded-full hover:bg-green-500 hover:text-white transition-colors">
                                <Facebook className="h-4 w-4" />
                            </a>
                            <a href="#" className="p-2 bg-slate-900 rounded-full hover:bg-green-500 hover:text-white transition-colors">
                                <Twitter className="h-4 w-4" />
                            </a>
                            <a href="#" className="p-2 bg-slate-900 rounded-full hover:bg-green-500 hover:text-white transition-colors">
                                <Instagram className="h-4 w-4" />
                            </a>
                            <a href="#" className="p-2 bg-slate-900 rounded-full hover:bg-green-500 hover:text-white transition-colors">
                                <Linkedin className="h-4 w-4" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-6">Quick Links</h3>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li><Link href="/" className="hover:text-green-400 transition-colors">Home</Link></li>
                            <li><Link href="/market" className="hover:text-green-400 transition-colors">Sell Scrap</Link></li>
                            <li><Link href="/rate-list" className="hover:text-green-400 transition-colors">Rate List</Link></li>
                            <li><Link href="/food-rescue" className="hover:text-green-400 transition-colors flex items-center gap-2">
                                Food Rescue <Heart className="h-3 w-3 text-red-500 animate-pulse" />
                            </Link></li>
                            <li><Link href="/dashboard" className="hover:text-green-400 transition-colors">Dashboard</Link></li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="text-white font-semibold mb-6">Services</h3>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li><Link href="/services/furniture" className="hover:text-green-400 transition-colors">Scrap Pickup</Link></li>
                            <li><Link href="/services/cleaning" className="hover:text-green-400 transition-colors">Site Cleaning</Link></li>
                            <li><Link href="/services/welding" className="hover:text-green-400 transition-colors">Dismantling</Link></li>
                            <li><Link href="/business" className="hover:text-green-400 transition-colors">Corporate Tie-ups</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-white font-semibold mb-6">Contact Us</h3>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-green-500 mt-0.5" />
                                <span>123, Green Park Extension,<br />New Delhi, India 110016</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-green-500" />
                                <a href="tel:+918586040076" className="hover:text-white transition-colors">+91 85860 40076</a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-green-500" />
                                <a href="mailto:support@kabadiyo.com" className="hover:text-white transition-colors">support@kabadiyo.com</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="h-px w-full bg-slate-800 mb-8" />

                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
                    <p>&copy; {new Date().getFullYear()} Kabadiyo. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
