import { DialogHeader } from '@/components/ui/dialog'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import React from 'react'

interface AddSellerDialogProps {
    open: boolean,
    onOpenChange: (open: boolean) => void
}

function AddSellerDialog({ open, onOpenChange }: AddSellerDialogProps) {

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className='font-montserrat'>Add New Seller</DialogTitle>
                    <DialogDescription>
                        Add a new seller to the system
                    </DialogDescription>
                </DialogHeader>
                
            </DialogContent>
        </Dialog>
    )
}

export default AddSellerDialog