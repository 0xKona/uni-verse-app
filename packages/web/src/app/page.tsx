import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
            <div className="flex flex-col items-center gap-6 text-center">
                <h1 className="text-4xl font-bold tracking-tight">
                    Welcome to Uni-Verse
                </h1>
                <div className="flex gap-3">
                    <Button>
                        <Link href="/login">Sign In</Link>
                    </Button>
                    <Button variant="outline">
                        <Link href="/signup">Create Account</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
