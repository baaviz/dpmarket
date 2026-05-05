import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase Service Role credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
    const email = 'admin@dohaplus.com';
    const password = 'AdminPassword123!';
    const fullName = 'Super Admin';

    console.log(`Starting force admin creation for ${email}...`);

    // 1. Get user list to find existing user or confirm absence
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
        console.error('Error listing users:', listError.message);
        return;
    }

    let existingUser = users.find(u => u.email === email);
    let userId: string;

    if (existingUser) {
        console.log('User exists in Auth. Updating password to ensure access...');
        const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            { password, email_confirm: true }
        );
        if (updateError) {
            console.error('Error updating auth user:', updateError.message);
            return;
        }
        userId = updateData.user.id;
    } else {
        console.log('Creating new Auth user...');
        const { data: createData, error: createError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName }
        });
        if (createError) {
            console.error('Error creating auth user:', createError.message);
            return;
        }
        userId = createData.user.id;
    }

    console.log(`Upserting admin profile for ${userId}...`);

    const { error: profileError } = await supabase.from('admin_profiles').upsert({
        id: userId,
        full_name: fullName,
        role: 'owner',
        is_active: true
    }, { onConflict: 'id' });

    if (profileError) {
        console.error('Error in admin_profiles upsert:', profileError.message);
        console.log('Ensure you have applied the 001_schema.sql migration.');
    } else {
        console.log('\nSUCCESS: Admin account ready!');
        console.log('---------------------------');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log('---------------------------\n');
    }
}

createAdmin().catch(err => {
    console.error('Script failed:', err);
});
