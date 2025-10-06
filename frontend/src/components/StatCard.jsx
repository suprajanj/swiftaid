import React from "react";

const StatCard = ({ 
  icon: Icon, 
  title, 
  value, 
  iconColor = "text-blue-600",
  iconBgColor = "bg-blue-100",
  trend,
  trendUp = true 
}) => {
  return (
    <div className="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300">
      <div className="p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${iconBgColor} p-3 rounded-lg`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                {trend && (
                  <div
                    className={`ml-2 flex items-baseline text-sm font-semibold ${
                      trendUp ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {trendUp ? "↑" : "↓"} {trend}
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
