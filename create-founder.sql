-- Create founder user and generate invite code
DO $$
DECLARE
    founder_id TEXT;
    founder_code TEXT;
BEGIN
    -- Generate founder ID
    founder_id := 'founder_' || floor(random() * 1000000)::text;
    
    -- Create founder account
    INSERT INTO users (
        id, 
        email, 
        username, 
        "passwordHash",
        "isFounder",
        "subscriptionTier",
        credits,
        "bonusCredits",
        "createdAt"
    ) VALUES (
        founder_id,
        'founder@profithackai.com',
        'ProfitHackFounder',
        '$2b$10$dummyhash', -- Placeholder, user will set password
        true,
        'innovator',
        999999,
        0,
        NOW()
    ) ON CONFLICT (email) DO UPDATE 
    SET "isFounder" = true, "subscriptionTier" = 'innovator', credits = 999999;
    
    -- Get actual founder ID
    SELECT id INTO founder_id FROM users WHERE email = 'founder@profithackai.com';
    
    -- Generate secure 10-character founder code
    founder_code := upper(substring(md5(random()::text || now()::text) from 1 for 10));
    
    -- Create invite code for founder
    INSERT INTO invite_codes (
        code,
        "creatorId",
        "isUsed",
        "createdAt"
    ) VALUES (
        founder_code,
        founder_id,
        false,
        NOW()
    ) ON CONFLICT (code) DO NOTHING;
    
    -- Display the code
    RAISE NOTICE 'FOUNDER CODE: %', founder_code;
    RAISE NOTICE 'Founder ID: %', founder_id;
END $$;

-- Show all founder codes
SELECT code, "creatorId", "isUsed" 
FROM invite_codes 
WHERE "creatorId" IN (SELECT id FROM users WHERE "isFounder" = true)
ORDER BY "createdAt" DESC;
