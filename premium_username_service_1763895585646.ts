// premium_username_service.ts - Conceptual Code for Premium Username Reservation

// ====================================================================
// 1. Database Schema (PostgreSQL/Drizzle ORM Conceptual)
// ====================================================================

// Define the new table for reserved usernames
// This table should be checked BEFORE the main 'users' table during registration.

/*
CREATE TYPE username_status AS ENUM ('RESERVED', 'CLAIMED', 'BLACKLISTED');

CREATE TABLE reserved_usernames (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    status username_status NOT NULL DEFAULT 'RESERVED',
    reserved_for VARCHAR(255),
    claimed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    price_usd DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create an index for fast lookups during registration
CREATE UNIQUE INDEX idx_reserved_username ON reserved_usernames (username);
*/

// ====================================================================
// 2. Username Validation Service (server/services/username.service.ts)
// ====================================================================

import { db } from '../db'; // Assuming your database connection
import { reservedUsernames } from '../db/schema'; // Assuming your Drizzle schema import
import { eq } from 'drizzle-orm';

/**
 * Checks if a username is reserved or already taken.
 * This function should be called during user registration and username change requests.
 * @param username The username to check.
 * @returns A promise that resolves to true if the username is available, false otherwise.
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
    const normalizedUsername = username.toLowerCase();

    // 1. Check the Reserved List first
    const reservedEntry = await db.select()
        .from(reservedUsernames)
        .where(eq(reservedUsernames.username, normalizedUsername))
        .limit(1);

    if (reservedEntry.length > 0) {
        const status = reservedEntry[0].status;
        
        // If the status is RESERVED or BLACKLISTED, it is NOT available for public registration.
        if (status === 'RESERVED' || status === 'BLACKLISTED') {
            console.log(`Username ${username} is reserved with status: ${status}`);
            return false; 
        }
        
        // If status is CLAIMED, it will be caught by the next check (users table).
    }

    // 2. Check the main Users table (standard check)
    const userExists = await db.select()
        .from(users) // Assuming your main users table
        .where(eq(users.username, normalizedUsername))
        .limit(1);

    if (userExists.length > 0) {
        return false;
    }

    return true; // Available
}

// ====================================================================
// 3. Admin/Brand Claim Service (server/services/admin.service.ts)
// ====================================================================

/**
 * Marks a reserved username as claimed by a specific user (the brand).
 * This function is called after the brand has paid for the premium name.
 * @param username The reserved username to claim.
 * @param userId The ID of the user (brand representative) claiming the name.
 */
export async function claimReservedUsername(username: string, userId: string): Promise<void> {
    const normalizedUsername = username.toLowerCase();

    await db.update(reservedUsernames)
        .set({
            status: 'CLAIMED',
            claimed_by_user_id: userId,
            // Optionally, set a claim date
        })
        .where(eq(reservedUsernames.username, normalizedUsername));
    
    // CRITICAL: Update the user's actual username in the main users table
    await db.update(users)
        .set({ username: normalizedUsername })
        .where(eq(users.id, userId));
}

// ====================================================================
// 4. Usage in Registration Route (server/routes.ts)
// ====================================================================

/*
// Conceptual snippet in your user registration route
router.post('/register', async (req, res) => {
    const { username, password, inviteCode } = req.body;

    // 1. Check availability using the new service
    const isAvailable = await isUsernameAvailable(username);
    if (!isAvailable) {
        return res.status(400).json({ error: "Username is reserved or already taken." });
    }

    // 2. Proceed with standard registration logic...
    // ...
});
*/
