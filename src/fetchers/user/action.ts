import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export const getServerActionUser = async () => {
    try {
        const session = await getServerSession(authOptions);
        return session?.user || null;
    } catch (error) {
        console.error("Error fetching session:", error);
        return null;
    }
}
