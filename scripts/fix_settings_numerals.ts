
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
    console.log("Fetching current settings...")

    // Get current settings
    const { data: currentSettings, error } = await supabase
        .from('admin_settings')
        .select('*')

    if (error) {
        console.error("Error fetching settings:", error)
        return
    }

    console.log(`Found ${currentSettings.length} settings rows`)

    // Fix Announcement Bar Arabic
    const arSetting = currentSettings.find(s => s.key === 'announcement_bar_ar')
    if (arSetting) {
        console.log("Current announcement_bar_ar:", arSetting.value)
        // Simple replace 
        let newValue = arSetting.value
            .replace(/٥٠٠/g, '500')
            .replace(/٢٠٪/g, '20%')
            .replace(/٢٠%/g, '20%') // Case where % is Western but 20 is Eastern

        if (newValue !== arSetting.value) {
            console.log("Updating to:", newValue)
            const { error: updateError } = await supabase
                .from('admin_settings')
                .update({ value: newValue })
                .eq('key', 'announcement_bar_ar')

            if (updateError) console.error("Update failed:", updateError)
            else console.log("Update SUCCESS")
        } else {
            console.log("No changes needed for announcement_bar_ar")
        }
    } else {
        console.log("announcement_bar_ar key not found in settings table")
    }
}

main().catch(console.error)
