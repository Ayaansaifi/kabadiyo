"use client"

import { motion } from "framer-motion"
import { Plus, X } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

interface FabAction {
    icon: React.ReactNode
    label: string
    href?: string
    onClick?: () => void
    color?: string
}

interface FloatingActionButtonProps {
    actions: FabAction[]
    mainIcon?: React.ReactNode
}

export function FloatingActionButton({ actions, mainIcon }: FloatingActionButtonProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="fixed bottom-24 right-4 z-40 md:bottom-8 flex flex-col-reverse items-end gap-3">
            {/* Action Buttons */}
            {actions.map((action, index) => (
                <motion.div
                    key={action.label}
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={isOpen ? {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        transition: { delay: index * 0.05 }
                    } : {
                        opacity: 0,
                        y: 20,
                        scale: 0.8
                    }}
                    className="flex items-center gap-3"
                >
                    {/* Label */}
                    <motion.span
                        initial={{ opacity: 0, x: 10 }}
                        animate={isOpen ? { opacity: 1, x: 0 } : { opacity: 0, x: 10 }}
                        className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-medium px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap"
                    >
                        {action.label}
                    </motion.span>

                    {/* Button */}
                    {action.href ? (
                        <Link href={action.href}>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center ${action.color || "bg-primary text-white"
                                    }`}
                                onClick={() => setIsOpen(false)}
                            >
                                {action.icon}
                            </motion.button>
                        </Link>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center ${action.color || "bg-primary text-white"
                                }`}
                            onClick={() => {
                                action.onClick?.()
                                setIsOpen(false)
                            }}
                        >
                            {action.icon}
                        </motion.button>
                    )}
                </motion.div>
            ))}

            {/* Main FAB Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-gradient-to-br from-primary to-green-600 text-white rounded-full shadow-2xl shadow-primary/30 flex items-center justify-center"
            >
                <motion.div
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    {mainIcon || <Plus className="h-7 w-7" />}
                </motion.div>
            </motion.button>
        </div>
    )
}
