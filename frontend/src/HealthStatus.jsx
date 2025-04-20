import React, { useState } from "react";

const HealthStatus = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/health");
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error("Error fetching health status:", err);
      setStatus({ error: "Failed to fetch health status" + "Backend Down" });
    } finally {
      setLoading(false);
    }
  };

  const getStyle = (value) => {
    const normalized = value.toLowerCase();
    if (normalized.includes("up")) return { color: "text-green-600", icon: "🟢" };
    if (normalized.includes("down")) return { color: "text-red-600", icon: "🔴" };
    return { color: "text-yellow-600", icon: "🟡" };
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl max-w-3xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">🔍 Service Health Check</h2>

      <div className="flex justify-center mb-6">
        <button
          onClick={checkHealth}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {loading ? "Checking..." : "Check Health"}
        </button>
      </div>

      {status?.error && (
        <p className="text-red-600 text-center">{status.error}</p>
      )}

      {status && !status.error && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl shadow-inner p-4">
          <table className="min-w-full text-left mx-auto">
            <thead className="bg-gray-100 rounded-t-md">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase border-b">Service</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase border-b">Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(status).map(([service, state]) => {
                const { color, icon } = getStyle(state);
                return (
                  <tr key={service} className="border-b border-gray-200">
                    <td className="px-6 py-4 capitalize text-gray-700 font-medium">{service}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-2 ${color} font-semibold`}>
                        {icon}
                        <span className="uppercase text-sm">{state.replace(":", "")}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HealthStatus;
