
const SUPABASE_URL = "https://jqupfkcsuvhqaorfkbuu.supabase.co";

// Paste your Supabase publishable key here.
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_gMTFEVXEQ57R3bXkzRFKgg_qI9hjaid";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

// Get the latest station status
async function loadStationStatus() {
    const { data, error } = await supabaseClient
        .from("station_status")
        .select("*")
        .order("id", { ascending: false })
        .limit(1)
        .single();

    if (error) {
        console.error("Database error:", error);

        document.getElementById("connectionStatus").textContent =
            "Database connection failed.";

        return;
    }

    // Display database information
    document.getElementById("waitingGallons").textContent =
        data.waiting_gallons;

    document.getElementById("estimatedTime").textContent =
        data.estimated_time;

    document.getElementById("serviceStatus").textContent =
        data.service_status;

    document.getElementById("updatedAt").textContent =
        new Date(data.updated_at).toLocaleString();

    document.getElementById("connectionStatus").textContent =
        "Connected to Supabase";
}

// Load data when the page opens
loadStationStatus();

// Refresh data every 5 seconds
setInterval(loadStationStatus, 1000);