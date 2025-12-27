"use client"

import { useState, useEffect, useRef, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Eye, EyeOff, Check, X, AlertCircle, Lock } from 'lucide-react'
import { checkPasswordStrength, type PasswordStrengthResult } from '@/lib/security'

interface AnimatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string
    error?: string
    success?: boolean
    icon?: React.ReactNode
}

/**
 * Animated Input with floating label
 */
export const AnimatedInput = forwardRef<HTMLInputElement, AnimatedInputProps>(
    ({ className, label, error, success, icon, type, ...props }, ref) => {
        const [isFocused, setIsFocused] = useState(false)
        const [hasValue, setHasValue] = useState(false)
        const [showPassword, setShowPassword] = useState(false)

        const isPassword = type === 'password'
        const inputType = isPassword && showPassword ? 'text' : type

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setHasValue(e.target.value.length > 0)
            props.onChange?.(e)
        }

        return (
            <div className="relative">
                {/* Floating Label */}
                <label
                    className={cn(
                        "absolute left-3 transition-all duration-200 pointer-events-none",
                        "text-muted-foreground",
                        (isFocused || hasValue || props.value) // Ensure value prop also triggers float
                            ? "-top-2 text-xs bg-background px-1 text-primary z-10" // Added z-10 for visibility
                            : "top-3 text-sm",
                        error && "text-red-500",
                        success && "text-green-500"
                    )}
                >
                    {label}
                </label>

                {/* Input Field */}
                <div className="relative">
                    {icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        type={inputType}
                        className={cn(
                            "w-full px-3 py-3 border rounded-lg bg-background",
                            "transition-all duration-200",
                            "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
                            "disabled:bg-muted/50 disabled:text-muted-foreground disabled:cursor-not-allowed",
                            "placeholder:text-transparent",
                            icon && "pl-10",
                            isPassword && "pr-10",
                            error && "border-red-500 focus:ring-red-500/50 focus:border-red-500",
                            success && "border-green-500 focus:ring-green-500/50 focus:border-green-500",
                            className
                        )}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        onChange={handleChange}
                        {...props}
                    />

                    {/* Password Toggle */}
                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    )}

                    {/* Success/Error/Lock Icons */}
                    {!isPassword && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            {props.disabled && <Lock className="h-4 w-4 text-muted-foreground/50" />}
                            {success && <Check className="h-4 w-4 text-green-500" />}
                            {error && <X className="h-4 w-4 text-red-500" />}
                        </div>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {error}
                    </p>
                )}
            </div>
        )
    }
)
AnimatedInput.displayName = "AnimatedInput"

/**
 * Password Strength Meter
 */
interface PasswordStrengthMeterProps {
    password: string
    showFeedback?: boolean
}

export function PasswordStrengthMeter({ password, showFeedback = true }: PasswordStrengthMeterProps) {
    const [strength, setStrength] = useState<PasswordStrengthResult | null>(null)

    useEffect(() => {
        if (password) {
            setStrength(checkPasswordStrength(password))
        } else {
            setStrength(null)
        }
    }, [password])

    if (!strength) return null

    const colors = {
        weak: 'bg-red-500',
        fair: 'bg-orange-500',
        good: 'bg-yellow-500',
        strong: 'bg-green-500',
        excellent: 'bg-emerald-500'
    }

    const labels = {
        weak: { en: 'Weak', hi: 'कमज़ोर' },
        fair: { en: 'Fair', hi: 'ठीक' },
        good: { en: 'Good', hi: 'अच्छा' },
        strong: { en: 'Strong', hi: 'मज़बूत' },
        excellent: { en: 'Excellent', hi: 'बहुत अच्छा' }
    }

    const widthPercent = ((strength.score + 1) / 6) * 100

    return (
        <div className="space-y-2">
            {/* Strength Bar */}
            <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className={cn(
                            "h-full rounded-full transition-all duration-300",
                            colors[strength.level]
                        )}
                        style={{ width: `${widthPercent}%` }}
                    />
                </div>
                <span className={cn(
                    "text-xs font-medium min-w-[60px] text-right",
                    strength.level === 'weak' && "text-red-500",
                    strength.level === 'fair' && "text-orange-500",
                    strength.level === 'good' && "text-yellow-600",
                    strength.level === 'strong' && "text-green-500",
                    strength.level === 'excellent' && "text-emerald-500"
                )}>
                    {labels[strength.level].hi}
                </span>
            </div>

            {/* Feedback */}
            {showFeedback && strength.feedback.length > 0 && (
                <ul className="space-y-1">
                    {strength.feedbackHi.map((tip, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                            <X className="h-3 w-3 text-red-400" />
                            {tip}
                        </li>
                    ))}
                </ul>
            )}

            {/* All requirements met */}
            {showFeedback && strength.isAcceptable && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    पासवर्ड सुरक्षित है
                </p>
            )}
        </div>
    )
}

/**
 * OTP Input - 6 digit boxes
 */
interface OTPInputProps {
    value: string
    onChange: (value: string) => void
    length?: number
    error?: boolean
}

export function OTPInput({ value, onChange, length = 6, error }: OTPInputProps) {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    const handleChange = (index: number, digit: string) => {
        if (!/^\d*$/.test(digit)) return

        const newValue = value.split('')
        newValue[index] = digit.slice(-1)
        const result = newValue.join('')
        onChange(result)

        // Move to next input
        if (digit && index < length - 1) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !value[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
        onChange(pasted)
    }

    return (
        <div className="flex gap-2 justify-center">
            {Array.from({ length }).map((_, i) => (
                <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={value[i] || ''}
                    onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    className={cn(
                        "w-12 h-14 text-center text-2xl font-bold",
                        "border-2 rounded-lg",
                        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
                        "transition-all duration-200",
                        error && "border-red-500 focus:ring-red-500/50 focus:border-red-500",
                        !error && "border-gray-300 dark:border-gray-600"
                    )}
                />
            ))}
        </div>
    )
}

/**
 * Step Progress Indicator
 */
interface StepProgressProps {
    currentStep: number
    totalSteps: number
    labels?: string[]
}

export function StepProgress({ currentStep, totalSteps, labels }: StepProgressProps) {
    return (
        <div className="w-full">
            {/* Progress Bar */}
            <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: totalSteps }).map((_, i) => (
                    <div key={i} className="flex-1 flex items-center">
                        <div
                            className={cn(
                                "flex-1 h-2 rounded-full transition-all duration-300",
                                i < currentStep
                                    ? "bg-primary"
                                    : i === currentStep
                                        ? "bg-primary/50"
                                        : "bg-gray-200 dark:bg-gray-700"
                            )}
                        />
                    </div>
                ))}
            </div>

            {/* Labels */}
            {labels && (
                <div className="flex justify-between text-xs text-muted-foreground">
                    {labels.map((label, i) => (
                        <span
                            key={i}
                            className={cn(
                                "transition-colors",
                                i <= currentStep && "text-primary font-medium"
                            )}
                        >
                            {label}
                        </span>
                    ))}
                </div>
            )}

            {/* Step Counter */}
            <p className="text-center text-sm text-muted-foreground mt-2">
                चरण {currentStep + 1} / {totalSteps}
            </p>
        </div>
    )
}
