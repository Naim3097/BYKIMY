"use client";

import { COMPARISON_FEATURES } from "@/lib/constants";

export function ComparisonTable() {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse text-sm min-w-[600px]">
        <thead>
          <tr className="border-b border-byki-medium-gray/50">
            <th className="py-4 px-6 font-bold text-byki-black w-1/2">Feature</th>
            <th className="py-4 px-6 font-bold text-byki-dark-gray text-center w-1/4">
              Generic ELM
              <span className="block text-xs font-normal text-byki-dark-gray/60 mt-0.5">Basic</span>
            </th>
            <th className="py-4 px-6 font-bold text-white bg-byki-dark-green rounded-t-xl text-center w-1/4">
              Pro Adapter
              <span className="block text-xs font-normal text-white/60 mt-0.5">Full Access</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {COMPARISON_FEATURES.map((row, i) => (
            <tr
              key={i}
              className="border-b border-byki-medium-gray/30 hover:bg-byki-light-gray/50 transition-colors"
            >
              <td className="py-4 px-6 font-medium text-byki-black">
                {row.feature}
              </td>

              {/* Generic Column */}
              <td className="py-4 px-6 text-center">
                {row.generic === true ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="inline-block">
                    <path d="M5 10l3.5 3.5L15 7" stroke="#28b55f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : row.generic === "upgrade" ? (
                  <span className="text-xs text-byki-dark-gray border border-byki-medium-gray rounded-full px-2.5 py-0.5">Limited</span>
                ) : (
                  <span className="text-byki-medium-gray">—</span>
                )}
              </td>

              {/* Pro Column */}
              <td className="py-4 px-6 text-center bg-byki-green/5">
                {row.pro === true ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="inline-block">
                    <path d="M5 10l3.5 3.5L15 7" stroke="#28b55f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <span className="text-byki-medium-gray">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
