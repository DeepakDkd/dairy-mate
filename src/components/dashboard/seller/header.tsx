"use client"
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import React, { useState } from 'react'
import { AddMilkEntryDialog } from '../../Dialog/Seller/add-milk-entry-dialog'
import AddSellerDialog from '@/components/Dialog/Seller/add-seller'

function Header({
    userId,
    getEntryHref,
}: {
    userId: any
    getEntryHref?: (dairyId: string) => string
}) {
    // console.log("userId in Header component:", userId);
    const [showAddSeller, setShowAddSeller] = useState(false)
    const [showMilkDialog, setShowMilkDialog] = useState(false)
    return (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
                <h1 className="text-3xl font-bold font-montserrat text-foreground">Seller Dashboard</h1>
                <p className="text-muted-foreground mt-1">Manage your milk entries and track earnings</p>
            </div>
            <div className='grid gap-3 sm:grid-cols-2 lg:gap-5' >
                <Button onClick={() => setShowAddSeller(true)} className="w-full bg-primary hover:bg-primary/90 cursor-pointer text-white  gap-2 sm:w-auto">
                    <Plus className="w-4 h-4" />
                    Add Seller
                </Button>
                <Button onClick={() => setShowMilkDialog(true)} className="w-full bg-primary hover:bg-primary/90 cursor-pointer text-white  gap-2 sm:w-auto">
                    <Plus className="w-4 h-4" />
                    Add Milk Entry
                </Button>

            </div>

            <AddSellerDialog open={showAddSeller} onOpenChange={setShowAddSeller} userId={userId} />
            <AddMilkEntryDialog
                open={showMilkDialog}
                onOpenChange={setShowMilkDialog}
                getEntryHref={getEntryHref}
            />
        </div>
    )
}

export default Header
