import { useState } from "react";
import { SimbriefResponse } from "./types.ts";
import OFPDisplay from "./components/OFPDisplay.tsx";

function App() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ofpData, setOfpData] = useState<SimbriefResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setError("Please enter a SimBrief username");
      return;
    }

    setLoading(true);
    setError(null);
    setOfpData(null);

    try {
      // SimBrief API supports CORS, so we can call it directly
      const apiUrl = `https://www.simbrief.com/api/xml.fetcher.php?username=${encodeURIComponent(trimmedUsername)}&json=1`;

      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(
          `API Error: ${response.status} - ${response.statusText}`,
        );
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error(
          "Received invalid response from API (not JSON). Check console for details.",
        );
      }

      const data: SimbriefResponse = await response.json();

      if (!data || !data.general) {
        console.error("Invalid OFP data structure:", data);
        throw new Error("No valid OFP data received from SimBrief");
      }

      setOfpData(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to fetch OFP data");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container">
      <header>
        <h1>SimBrief OFP Printer</h1>
      </header>

      <form className="input-section" onSubmit={handleSubmit}>
        <label htmlFor="username">SimBrief Username:</label>
        <input
          type="text"
          id="username"
          placeholder="Enter your SimBrief username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Fetching..." : "Fetch OFP"}
        </button>
      </form>

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Fetching OFP data...</p>
        </div>
      )}

      {error && <div className="error">{error}</div>}

      {ofpData && (
        <div className="preview">
          <div className="preview-header">
            <h2>OFP Preview</h2>
            <button onClick={handlePrint} className="print-btn">
              Print
            </button>
          </div>

          <div className="ofp-content">
            <OFPDisplay data={ofpData} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
