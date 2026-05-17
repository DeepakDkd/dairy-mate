import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";

export const getServerActionUser = async () => {
    const session = await getServerSession(authOptions);
    return session?.user || null;
}

export const getSellerByDairyId= async (dairyId:number)=>{
    try {

        const sellers = await prisma.user.findMany({
            where:{
                dairyId:dairyId,

            }
        })
        
    } catch (error) {
        console.log("Failed to fetch sellers",error);
        return null;
        
    }
}
