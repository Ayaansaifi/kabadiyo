"use client"

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
    errorInfo: ErrorInfo | null
}

/**
 * Global Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false, error: null, errorInfo: null }
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        this.setState({ errorInfo })

        // Log error to console and potentially to monitoring service
        console.error('[ErrorBoundary] Caught error:', error)
        console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack)

        // TODO: Send to error monitoring service in production
        // logErrorToService(error, errorInfo)
    }

    handleRetry = (): void => {
        this.setState({ hasError: false, error: null, errorInfo: null })
    }

    handleGoHome = (): void => {
        window.location.href = '/'
    }

    handleReload = (): void => {
        window.location.reload()
    }

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-4">
                    <Card className="w-full max-w-lg shadow-xl border-red-200 dark:border-red-800">
                        <CardHeader className="text-center">
                            <div
                                className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4 cursor-help"
                                onClick={() => {
                                    // Hidden debug: clicking icon 5 times shows error in production
                                    const now = Date.now();
                                    // @ts-ignore
                                    this._clickCount = (this._clickCount || 0) + 1;
                                    // @ts-ignore
                                    if (this._clickCount >= 3) {
                                        this.setState({ errorInfo: {} as any }); // Force update to show error
                                        // @ts-ignore
                                        this._showDebug = true;
                                        this.forceUpdate();
                                    }
                                }}
                            >
                                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                            </div>
                            <CardTitle className="text-2xl text-red-600 dark:text-red-400">
                                कुछ गलत हो गया
                            </CardTitle>
                            <CardDescription className="text-lg">
                                Something went wrong
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <p className="text-center text-muted-foreground">
                                हमें खेद है, एक अप्रत्याशित त्रुटि हुई है। कृपया पुनः प्रयास करें।
                            </p>
                            <p className="text-center text-sm text-muted-foreground">
                                We apologize, an unexpected error occurred. Please try again.
                            </p>

                            {(process.env.NODE_ENV === 'development' || (this as any)._showDebug) && this.state.error && (
                                <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-auto max-h-60 border border-red-500/30">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Bug className="h-4 w-4 text-red-500" />
                                        <span className="text-sm font-mono font-semibold text-red-500">
                                            {this.state.error.name}
                                        </span>
                                    </div>
                                    <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap font-mono">
                                        {this.state.error.message}
                                    </pre>
                                    {this.state.errorInfo && (
                                        <pre className="text-[10px] text-gray-400 mt-2 border-t pt-2 overflow-x-auto">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    )}
                                </div>
                            )}
                        </CardContent>

                        <CardFooter className="flex flex-col gap-3">
                            <Button
                                onClick={this.handleRetry}
                                className="w-full gap-2"
                                variant="default"
                            >
                                <RefreshCw className="h-4 w-4" />
                                पुनः प्रयास करें / Try Again
                            </Button>
                            <div className="flex gap-2 w-full">
                                <Button
                                    onClick={this.handleReload}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Reload Page
                                </Button>
                                <Button
                                    onClick={this.handleGoHome}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    <Home className="h-4 w-4 mr-2" />
                                    Go Home
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            )
        }

        return this.props.children
    }
}

/**
 * Simple error display component for inline use
 */
export function ErrorDisplay({
    message = "Something went wrong",
    messageHi = "कुछ गलत हो गया",
    onRetry
}: {
    message?: string
    messageHi?: string
    onRetry?: () => void
}) {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-red-600 mb-1">{messageHi}</h3>
            <p className="text-muted-foreground mb-4">{message}</p>
            {onRetry && (
                <Button onClick={onRetry} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                </Button>
            )}
        </div>
    )
}

/**
 * Loading error state
 */
export function LoadingError({ onRetry }: { onRetry?: () => void }) {
    return (
        <ErrorDisplay
            message="Failed to load data"
            messageHi="डेटा लोड करने में विफल"
            onRetry={onRetry}
        />
    )
}

export default ErrorBoundary
