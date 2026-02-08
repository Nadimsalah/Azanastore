'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center p-8 bg-background">
            <div className="p-4 bg-yellow-500/10 rounded-full">
                <AlertTriangle className="w-12 h-12 text-yellow-500" />
            </div>
            <h2 className="text-2xl font-bold">Admin System Error</h2>
            <p className="text-muted-foreground max-w-md">
                {error.message || "An unexpected error occurred in the admin dashboard."}
            </p>
            <div className="flex gap-4">
                <Button onClick={() => window.location.reload()} variant="outline">
                    Reload Application
                </Button>
                <Button onClick={() => reset()} variant="default">
                    Try Again
                </Button>
            </div>
        </div>
    )
}
