import { useState } from "react";
import { generateTrip } from "../services/ai-service";

export default function Test() {
    const [results, setResults] = useState([]);
    const [running, setRunning] = useState(false);

    const scenarios = [
        { name: "Low Budget (₹5000, 2 days)", params: ["Delhi", "Agra", 2, 5000, "solo", "budget"] },
        { name: "Mid Budget (₹20000, 4 days)", params: ["Mumbai", "Goa", 4, 20000, "couple", "normal"] },
        { name: "High Budget (₹100000, 5 days)", params: ["Bangalore", "Kerala", 5, 100000, "family", "luxury"] },
        { name: "Impossible Budget (₹500, 3 days)", params: ["Delhi", "Manali", 3, 500, "solo", "budget"] }
    ];

    const runTests = async () => {
        setRunning(true);
        setResults([]);
        const newResults = [];

        for (const scenario of scenarios) {
            const [from, to, days, budget, type, style] = scenario.params;
            const start = performance.now();

            try {
                const trip = await generateTrip(from, to, days, budget, type, style);
                const end = performance.now();
                const duration = ((end - start) / 1000).toFixed(2);

                // Validation Logic Check (Recalculating here for independence)
                let transportCost = 0;
                if (trip.transport?.length > 0) {
                    transportCost = Math.min(...trip.transport.map(t => Number(t.price) || 0));
                }

                let hotelCost = 0;
                if (trip.hotels?.length > 0) {
                    hotelCost = Math.min(...trip.hotels.map(h => Number(h.price_per_night) || 0)) * days;
                }

                const minTotalCost = transportCost + hotelCost;
                const isBudgetRespected = minTotalCost <= budget;

                // Impossible budget should fail or return error
                const isSuccess = scenario.name.includes("Impossible") ? !isBudgetRespected : isBudgetRespected;

                newResults.push({
                    scenario: scenario.name,
                    status: isBudgetRespected ? "PASS" : "FAIL",
                    details: `Min Cost: ₹${minTotalCost} (Limit: ₹${budget})`,
                    duration: `${duration}s`,
                    source: trip.source
                });

            } catch (err) {
                newResults.push({
                    scenario: scenario.name,
                    status: "ERROR",
                    details: err.message,
                    duration: "0s",
                    source: "N/A"
                });
            }
            setResults([...newResults]);
        }
        setRunning(false);
    };

    return (
        <div className="min-h-screen p-12 bg-gray-50 text-black font-sans">
            <h1 className="text-4xl font-black mb-8">System Diagnostics</h1>

            <button
                onClick={runTests}
                disabled={running}
                className="px-8 py-4 bg-black text-white font-bold rounded-lg disabled:opacity-50"
            >
                {running ? "Running Tests..." : "Run Accuracy Tests"}
            </button>

            <div className="mt-12 overflow-x-auto">
                <table className="w-full text-left bg-white shadow-lg rounded-xl overflow-hidden">
                    <thead className="bg-black text-white">
                        <tr>
                            <th className="p-4">Scenario</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Budget Check</th>
                            <th className="p-4">Latency</th>
                            <th className="p-4">Source</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((res, i) => (
                            <tr key={i} className="border-b">
                                <td className="p-4 font-bold">{res.scenario}</td>
                                <td className={`p-4 font-black ${res.status === "PASS" ? "text-green-600" : "text-red-600"}`}>
                                    {res.status}
                                </td>
                                <td className="p-4 font-mono text-sm">{res.details}</td>
                                <td className="p-4 text-gray-500">{res.duration}</td>
                                <td className="p-4 text-xs text-gray-400">{res.source}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
