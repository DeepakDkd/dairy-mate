"use client"
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import React, { useState } from 'react'
import { AddMilkEntryDialog } from '../../Dialog/Seller/add-milk-entry-dialog'
import AddSellerDialog from '@/components/Dialog/Seller/add-seller'

function Header(userId: any) {
    const [showAddSeller, setShowAddSeller] = useState(false)
    const [showMilkDialog, setShowMilkDialog] = useState(false)
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold font-montserrat text-foreground">Seller Dashboard</h1>
                <p className="text-muted-foreground mt-1">Manage your milk entries and track earnings</p>
            </div>
            <div className='grid gap-5 md:grid-cols-2' >
                <Button onClick={() => setShowAddSeller(true)} className="bg-primary hover:bg-primary/90 cursor-pointer text-white  gap-2">
                    <Plus className="w-4 h-4" />
                    Add Seller
                </Button>
                <Button onClick={() => setShowMilkDialog(true)} className="bg-primary hover:bg-primary/90 cursor-pointer text-white  gap-2">
                    <Plus className="w-4 h-4" />
                    Add Milk Entry
                </Button>

            </div>

            <AddSellerDialog open={showAddSeller} onOpenChange={setShowAddSeller} userId={userId} />
            <AddMilkEntryDialog open={showMilkDialog} onOpenChange={setShowMilkDialog} />
        </div>
    )
}

export default Header