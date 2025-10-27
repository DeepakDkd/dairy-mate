import { prisma } from "@/app/lib/prisma";
import { NextApiResponse, NextApiRequest } from "next";
import bcrypt from "bcrypt";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { mobile, password, name, role, address, customerType } = req.body;

    // Basic validation
    if (!mobile || !password || !name || !address) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { mobile },
    });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name,
        mobile,
        password: hashedPassword,
        role: role || "CUSTOMER", // default role
        address,
        customerType: customerType || "BUYER", // default
      },
    });

    return res
      .status(201)
      .json({ message: "User registered successfully", userId: newUser.id });

  } catch (error: any) {
    console.error("Register Error:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}
