
import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export function MawaForm({ user, dairy, dairyId }: any) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Mawa Based Entry</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Litres */}
                <div>
                    <Label>Litres</Label>
                    <Input type="number" placeholder="Enter litres" />
                </div>

                {/* Mawa per Litre */}
                <div>
                    <Label>Mawa (grams per litre)</Label>
                    <Input type="number" placeholder="e.g. 180" />
                </div>

                {/* Auto Calculation Box */}
                <Card className="p-3 bg-muted">
                    <p className="text-sm">Total Grams: -- g</p>
                    <p className="text-sm">Total Amount: ₹ -- </p>
                    <p className="text-sm">Rate: ₹ -- / litre</p>
                </Card>

                {/* Submit */}
                <Button className="w-full">Submit Entry</Button>
            </CardContent>
        </Card>
    );
}
