/**
 * Script to create an admin account.
 * Usage:  npx tsx scripts/create-admin.ts <email> <password> [firstName] [lastName]
 * Example: npx tsx scripts/create-admin.ts admin@thaqib.com admin123 Admin User
 */
import "dotenv/config";
import bcrypt from "bcrypt";
import { db } from "../server/db";
import { users } from "../shared/models/auth";
import { eq } from "drizzle-orm";

async function main() {
    const [, , email, password, firstName = "Admin", lastName = ""] = process.argv;

    if (!email || !password) {
        console.error("Usage: npx tsx scripts/create-admin.ts <email> <password> [firstName] [lastName]");
        process.exit(1);
    }

    // Check if user already exists
    const [existing] = await db.select().from(users).where(eq(users.email, email));
    if (existing) {
        if (existing.role === "admin") {
            console.log(`✅ User ${email} is already an admin.`);
        } else {
            // Promote to admin
            await db.update(users).set({ role: "admin" }).where(eq(users.id, existing.id));
            console.log(`✅ User ${email} has been promoted to admin.`);
        }
        process.exit(0);
    }

    // Create new admin
    const hashedPassword = await bcrypt.hash(password, 10);
    const [newUser] = await db
        .insert(users)
        .values({
            email,
            password: hashedPassword,
            firstName,
            lastName: lastName || null,
            role: "admin",
        })
        .returning();

    console.log(`✅ Admin account created successfully!`);
    console.log(`   Email:  ${newUser.email}`);
    console.log(`   Name:   ${newUser.firstName} ${newUser.lastName || ""}`);
    console.log(`   Role:   ${newUser.role}`);
    console.log(`   ID:     ${newUser.id}`);

    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Failed to create admin:", err.message);
    process.exit(1);
});
