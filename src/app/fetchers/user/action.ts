import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export const getServerActionUser = async () => {
    try {
        const session = await getServerSession(authOptions);
        console.log("Fetched session in action:", session);
        return session?.user || null;
    } catch (error) {
        console.error("Error fetching session:", error);
        return null;
    }
}