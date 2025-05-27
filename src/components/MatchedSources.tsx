import React from "react";
import { Pie } from "react-chartjs-2";

interface MatchedSource {
  url: string;
  title: string;
  snippet: string;
  exactMatchPercent: number;
  partialMatchPercent: number;
}

interface MatchedSourcesProps {
  matchedSources: MatchedSource[];
  elapsedTime?: number;
}

const MatchedSources: React.FC<MatchedSourcesProps> = ({
  matchedSources,
  elapsedTime,
}) => {
  return (
    <div className="flex-1">
      <h3 className="font-semibold text-lg mb-4">
        Matched Sources ({matchedSources.length})
      </h3>
      <div className="grid gap-4 max-h-[400px] overflow-y-auto pr-2">
        {matchedSources.map((source, i) => {
          const data = {
            labels: ["Exact Match", "Partial Match"],
            datasets: [
              {
                data: [source.exactMatchPercent, source.partialMatchPercent],
                backgroundColor: ["#4CAF50", "#FFC107"],
                hoverOffset: 4,
              },
            ],
          };

          return (
            <div
              key={i}
              className="border border-gray-300 rounded-lg p-4 bg-white shadow hover:shadow-md transition-shadow duration-200 flex items-center gap-4"
            >
              <div style={{ flex: "1 1 auto" }}>
                <h4 className="font-semibold text-blue-600 truncate mb-1">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline"
                  >
                    {source.title || source.url}
                  </a>
                </h4>
                <p className="text-sm text-gray-700 line-clamp-3">
                  {source.snippet}
                </p>
              </div>
              <div style={{ width: 80, height: 80, flexShrink: 0 }}>
                <Pie
                  data={data}
                  options={{
                    plugins: { legend: { display: false } },
                  }}
                />
                <div className="text-center text-xs mt-1">
                  <div>
                    <span className="text-green-600 font-semibold">
                      {source.exactMatchPercent}%
                    </span>{" "}
                    Exact
                  </div>
                  <div>
                    <span className="text-yellow-600 font-semibold">
                      {source.partialMatchPercent}%
                    </span>{" "}
                    Partial
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {elapsedTime !== undefined && (
        <p className="text-sm text-gray-600 mt-2">
          <strong>Time Taken to Scan:</strong> {elapsedTime} seconds
        </p>
      )}
    </div>
  );
};

export default MatchedSources;
