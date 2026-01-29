import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-background">
            {/* Background Gradients */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] opacity-50 animate-pulse delay-75" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-30" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-30" />

            {/* Content Card */}
            <div className="glass-strong relative z-10 p-12 rounded-[2.5rem] text-center max-w-lg w-full mx-4 border border-white/10 shadow-2xl shadow-black/20 backdrop-blur-xl">

                {/* Logo */}
                <div className="mb-8 flex justify-center">
                    <div className="relative w-32 h-12 transition-transform hover:scale-105 duration-500">
                        <Image
                            src="/logo.png"
                            alt="Azana Logo"
                            fill
                            className="object-contain drop-shadow-md"
                            priority
                        />
                    </div>
                </div>

                {/* 404 Header */}
                <div className="space-y-2 mb-8 relative">
                    <h1 className="text-8xl font-bold bg-gradient-to-br from-primary via-primary/80 to-secondary bg-clip-text text-transparent select-none">
                        404
                    </h1>
                    <div className="absolute -top-6 -right-6 text-9xl font-bold text-primary/5 select-none -z-10 blur-sm">
                        ?
                    </div>
                </div>

                {/* Message */}
                <div className="space-y-4 mb-10">
                    <h2 className="text-2xl font-semibold text-foreground">
                        Page Not Found
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                        The page you are looking for doesn't exist or has been moved.
                        Let's get you back to something beautiful.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button
                        asChild
                        variant="default"
                        size="lg"
                        className="rounded-full px-8 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
                    >
                        <Link href="/">
                            <Home className="w-4 h-4 mr-2" />
                            Return Home
                        </Link>
                    </Button>

                    <Button
                        asChild
                        variant="ghost"
                        size="lg"
                        className="rounded-full px-8 hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
                    >
                        <Link href="javascript:history.back()">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Go Back
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Footer Text */}
            <div className="absolute bottom-8 left-0 right-0 text-center text-xs text-muted-foreground/30">
                Azana • Pure • Natural • Timeless
            </div>
        </div>
    )
}
