const SUPABASE_URL = "https://jqupfkcsuvhqaorfkbuu.supabase.co";

// Paste your Supabase publishable key here.
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_gMTFEVXEQ57R3bXkzRFKgg_qI9hjaid";
const POLL_INTERVAL_MS = 5000;
const STALE_AFTER_MS = 15000;

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

const $ = (id) => document.getElementById(id);
let lastSuccessAt = null;
let isLoading = false;
let hasLoadError = false;
let latestDataDetail = "Connecting to station data";

function setConnectionState(online, detail) {
    const status = $("connectionStatus");
    status.textContent = online ? "Connected" : "Offline";
    status.className = online ? "pill" : "pill offline";
    $("updateCard").classList.toggle("offline", !online);
    $("connectionDetail").textContent = detail;
}

async function loadStationStatus() {
    if (isLoading) return;
    isLoading = true;
    $("refreshButton").disabled = true;

    try {
        const { data, error } = await supabaseClient
            .from("station_status")
            .select("*")
            .order("id", { ascending: false })
            .limit(1)
            .single();

        if (error) throw error;

        $("waitingGallons").textContent = data.waiting_gallons ?? "--";
        $("estimatedTime").textContent = data.estimated_time ?? "--";
        $("serviceStatus").textContent = data.service_status ?? "Unknown";

        const dataUpdatedAt = data.updated_at == null
            ? null
            : new Date(data.updated_at);
        latestDataDetail = dataUpdatedAt === null || Number.isNaN(dataUpdatedAt.getTime())
            ? "Station data is current"
            : "Station data: " + dataUpdatedAt.toLocaleString();

        lastSuccessAt = Date.now();
        hasLoadError = false;
        setConnectionState(true, latestDataDetail);
        updateRefreshStatus();
    } catch (error) {
        console.error("Database error:", error);
        hasLoadError = true;
        setConnectionState(false, "Could not load station data. Try refreshing.");
        updateRefreshStatus();
    } finally {
        isLoading = false;
        $("refreshButton").disabled = false;
    }
}

function updateRefreshStatus() {
    if (lastSuccessAt === null) {
        $("updatedAt").textContent = hasLoadError
            ? "Waiting for a successful update"
            : "Waiting for first update";
        $("refreshProgress").style.width = "0%";
        return;
    }

    const elapsed = Date.now() - lastSuccessAt;
    const seconds = Math.floor(elapsed / 1000);
    const stale = elapsed > STALE_AFTER_MS;
    $("updatedAt").textContent = stale
        ? "Connection lost, last update " + seconds + " s ago"
        : "Updated " + (seconds < 1 ? "just now" : seconds + " s ago");
    $("refreshProgress").style.width =
        Math.min(elapsed / POLL_INTERVAL_MS, 1) * 100 + "%";

    if (stale && !hasLoadError) {
        setConnectionState(false, "Check your connection and refresh.");
    } else if (!stale && !hasLoadError) {
        setConnectionState(true, latestDataDetail);
    }
}

$("refreshButton").addEventListener("click", loadStationStatus);
setInterval(loadStationStatus, POLL_INTERVAL_MS);
setInterval(updateRefreshStatus, 250);
loadStationStatus();
