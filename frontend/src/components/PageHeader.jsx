import React from "react";

const PageHeader = ({ 
  title, 
  description, 
  icon: Icon,
  actions 
}) => {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 gap-4">
          <div className="flex items-start">
            {Icon && (
              <div className="flex-shrink-0 mr-4">
                <Icon className="h-10 w-10 text-blue-600" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              {description && (
                <p className="text-gray-600 mt-1">{description}</p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex flex-wrap gap-3">{actions}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
