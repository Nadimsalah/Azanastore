'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function GlobalError({
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
        <html>
            <body>
                <div className="flex flex-col items-center justify-center min-h-screen space-y-4 text-center p-8 bg-background text-foreground">
                    <h2 className="text-2xl font-bold">Something went wrong!</h2>
                    <p className="text-muted-foreground max-w-md">
                        {error.message || "A critical system error occurred."}
                    </p>
                    <Button onClick={() => reset()} variant="default">
                        Try Again
                    </Button>
                </div>
            </body>
        </html>
    )
}
