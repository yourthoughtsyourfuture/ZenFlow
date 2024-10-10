import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

export function AuthButtons() {
  const { data: session } = useSession()

  if (session) {
    return (
      <Button onClick={() => signOut()}>Sign out</Button>
    )
  }
  return (
    <Button onClick={() => signIn()}>Sign in</Button>
  )
}
