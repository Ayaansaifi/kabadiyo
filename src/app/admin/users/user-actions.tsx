"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, MoreHorizontal, Trash, Shield, ShieldAlert, User as UserIcon } from "lucide-react"
import { UserDetailSheet } from "./user-detail-sheet"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface UserActionsProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user: any
}

export function UserActions({ user }: UserActionsProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [showDetailSheet, setShowDetailSheet] = useState(false)

    async function deleteUser() {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/users/${user.id}`, {
                method: "DELETE",
                credentials: "include"
            })

            if (!res.ok) throw new Error("Failed to delete")

            toast.success("User deleted successfully")
            setShowDeleteDialog(false)
            router.refresh()
        } catch {
            toast.error("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    async function updateUserRole(role: string) {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/users/${user.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role }),
                credentials: "include"
            })

            if (!res.ok) throw new Error("Failed to update role")

            toast.success(`User role updated to ${role}`)
            router.refresh()
        } catch {
            toast.error("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <UserDetailSheet
                user={user}
                open={showDetailSheet}
                onOpenChange={setShowDetailSheet}
            />

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                {/* ... (Existing Alert Dialog Content same as before) ... */}
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user
                            account and remove their data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={deleteUser} className="bg-red-600 hover:bg-red-700">
                            Delete Account
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0" disabled={loading}>
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setShowDetailSheet(true)}>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
                        Copy User ID
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => updateUserRole("USER")}>
                        <UserIcon className="mr-2 h-4 w-4" /> Make User
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateUserRole("KABADIWALA")}>
                        <Shield className="mr-2 h-4 w-4" /> Make Kabadiwala
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateUserRole("ADMIN")} className="text-red-600">
                        <ShieldAlert className="mr-2 h-4 w-4" /> Make Admin
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-red-600 focus:text-red-600"
                    >
                        <Trash className="mr-2 h-4 w-4" /> Delete User
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
