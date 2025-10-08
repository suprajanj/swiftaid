// frontend/src/components/AssignViaMapModal.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

// Distance calculation function (same as backend)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Format distance for display
const formatDistance = (distance) => {
  if (distance < 1) {
    return `${(distance * 1000).toFixed(0)} meters`;
  }
  return `${distance.toFixed(1)} km`;
};

export default function AssignViaMapModal({ isOpen, onClose, sos, onAssigned, isLoaded }) {
  const [responders, setResponders] = useState([]);
  const [selectedResponder, setSelectedResponder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [distances, setDistances] = useState({});
  const mapRef = useRef(null);

  useEffect(() => {
    if (isOpen && sos?.emergency) {
      fetchRespondersByType(sos.emergency);
    }
  }, [isOpen, sos]);

  // Calculate distances when responders or SOS location changes
  useEffect(() => {
    if (responders.length > 0 && sos?.location) {
      const newDistances = {};
      responders.forEach(responder => {
        if (responder.lastLocation?.latitude && responder.lastLocation?.longitude) {
          const distance = calculateDistance(
            parseFloat(sos.location.latitude),
            parseFloat(sos.location.longitude),
            parseFloat(responder.lastLocation.latitude),
            parseFloat(responder.lastLocation.longitude)
          );
          newDistances[responder._id] = distance;
        }
      });
      setDistances(newDistances);
    }
  }, [responders, sos]);

  const fetchRespondersByType = async (type) => {
    try {
      setIsLoading(true);
      const res = await axios.get(
        `http://localhost:4000/api/responders/by-type?type=${type}`
      );
      const validResponders = res.data.filter(
        (r) => r.lastLocation?.latitude && r.lastLocation?.longitude
      );
      
      // Sort responders by distance (closest first)
      const sortedResponders = validResponders.sort((a, b) => {
        const distA = calculateDistance(
          parseFloat(sos.location.latitude),
          parseFloat(sos.location.longitude),
          parseFloat(a.lastLocation.latitude),
          parseFloat(a.lastLocation.longitude)
        );
        const distB = calculateDistance(
          parseFloat(sos.location.latitude),
          parseFloat(sos.location.longitude),
          parseFloat(b.lastLocation.latitude),
          parseFloat(b.lastLocation.longitude)
        );
        return distA - distB;
      });
      
      setResponders(sortedResponders);
    } catch (err) {
      console.error("Error fetching responders:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async (responderId) => {
    try {
      setIsLoading(true);
      await axios.patch("http://localhost:4000/api/sos/assign", {
        sosId: sos._id,
        responderId,
      });
      onAssigned();
      onClose();
    } catch (err) {
      console.error("Error assigning responder:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Get distance for a specific responder
  const getResponderDistance = useCallback((responderId) => {
    return distances[responderId] !== undefined ? formatDistance(distances[responderId]) : "Calculating...";
  }, [distances]);

  // Get closest responder
  const getClosestResponder = useCallback(() => {
    if (Object.keys(distances).length === 0) return null;
    
    let closestId = null;
    let minDistance = Infinity;
    
    Object.entries(distances).forEach(([responderId, distance]) => {
      if (distance < minDistance) {
        minDistance = distance;
        closestId = responderId;
      }
    });
    
    return responders.find(r => r._id === closestId);
  }, [distances, responders]);

  if (!isOpen || !sos || !sos.location) return null;

  const toNumber = (value) => Number(value);
  const closestResponder = getClosestResponder();

  const getEmergencyIcon = (emergencyType) => {
    const icons = {
      Medical: "🏥",
      Fire: "🔥", 
      Police: "🚔",
      road: "🛣️"
    };
    return icons[emergencyType] || "🚨";
  };

  const getStatusColor = (status) => {
    return status === "available" ? "text-green-600" : "text-yellow-600";
  };

  const getDistanceColor = (distance) => {
    if (distance < 2) return "text-green-600";
    if (distance < 5) return "text-yellow-600";
    return "text-orange-600";
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-xl">
              <span className="text-xl">🗺️</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Assign Responder
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                {getEmergencyIcon(sos.emergency)} {sos.emergency} Emergency • {sos.name}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors group"
          >
            <span className="text-xl text-slate-500 group-hover:text-slate-700 transition-colors">✕</span>
          </button>
        </div>

        {/* Fixed Stats Bar */}
        <div className="flex-shrink-0 px-6 py-3 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-slate-700 font-medium">SOS Location</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-slate-700 font-medium">Available Responders</span>
            </div>
          
            <div className="text-slate-600">
              {responders.length} responders found
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                <span className="ml-3 text-slate-600">Loading responders...</span>
              </div>
            )}

            {isLoaded ? (
              <div className="rounded-xl overflow-hidden border border-slate-300 shadow-sm">
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={{ lat: 7.8731, lng: 80.7718 }}
                  zoom={7}
                  onLoad={(map) => {
                    mapRef.current = map;

                    if (responders.length > 0 || sos.location) {
                      const bounds = new window.google.maps.LatLngBounds();

                      // Include SOS location
                      bounds.extend({
                        lat: toNumber(sos.location.latitude),
                        lng: toNumber(sos.location.longitude),
                      });

                      // Include all responder locations
                      responders.forEach((r) => {
                        bounds.extend({
                          lat: toNumber(r.lastLocation.latitude),
                          lng: toNumber(r.lastLocation.longitude),
                        });
                      });

                      map.fitBounds(bounds, 50);

                      // Prevent over-zooming
                      const listener = window.google.maps.event.addListener(map, "idle", function () {
                        if (map.getZoom() > 8) map.setZoom(8);
                        window.google.maps.event.removeListener(listener);
                      });
                    }
                  }}
                  options={{
                    styles: [
                      {
                        featureType: "poi",
                        elementType: "labels",
                        stylers: [{ visibility: "off" }]
                      }
                    ]
                  }}
                >
                  {/* SOS Marker */}
                  <Marker
                    position={{
                      lat: toNumber(sos.location.latitude),
                      lng: toNumber(sos.location.longitude),
                    }}
                    icon={{
                      url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                      scaledSize: new window.google.maps.Size(50, 50),
                    }}
                    title={`${sos.name} — ${sos.emergency}`}
                  />

                  {/* Responder Markers */}
                  {responders.map((responder) => (
                    <Marker
                      key={responder._id}
                      position={{
                        lat: toNumber(responder.lastLocation.latitude),
                        lng: toNumber(responder.lastLocation.longitude),
                      }}
                      icon={{
                        url:
                          responder.status === "available"
                            ? "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                            : "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
                        scaledSize: new window.google.maps.Size(40, 40),
                      }}
                      onClick={() => setSelectedResponder(responder)}
                      title={`${responder.name} — ${getResponderDistance(responder._id)} away`}
                    />
                  ))}

                  {/* Enhanced InfoWindow for selected responder */}
                  {selectedResponder && selectedResponder.lastLocation && (
                    <InfoWindow
                      position={{
                        lat: toNumber(selectedResponder.lastLocation.latitude),
                        lng: toNumber(selectedResponder.lastLocation.longitude),
                      }}
                      onCloseClick={() => setSelectedResponder(null)}
                    >
                      <div className="p-3 min-w-[200px]">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="font-semibold text-blue-700">
                              {selectedResponder.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800">{selectedResponder.name}</h3>
                            <p className="text-sm text-slate-600">{selectedResponder.responderType}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">Status:</span>
                            <span className={`text-sm font-semibold ${getStatusColor(selectedResponder.status)}`}>
                              {selectedResponder.status}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">Distance:</span>
                            <span className={`text-sm font-medium ${getDistanceColor(distances[selectedResponder._id] || 0)}`}>
                              {getResponderDistance(selectedResponder._id)}
                            </span>
                          </div>
                          {selectedResponder._id === closestResponder?._id && (
                            <div className="flex justify-center">
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                                🏆 Closest Responder
                              </span>
                            </div>
                          )}
                        </div>

                        {selectedResponder.status === "available" && (
                          <button
                            onClick={() => handleAssign(selectedResponder._id)}
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-2 px-4 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isLoading ? (
                              <span className="flex items-center justify-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Assigning...
                              </span>
                            ) : (
                              "📞 Assign Responder"
                            )}
                          </button>
                        )}
                      </div>
                    </InfoWindow>
                  )}
                </GoogleMap>
              </div>
            ) : (
              <div className="flex items-center justify-center py-16 bg-slate-100 rounded-xl">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                  <p className="text-slate-600 font-medium">Loading map...</p>
                </div>
              </div>
            )}

            {/* Responders List */}
            {responders.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <span>👨‍🚒</span>
                  Available Responders ({responders.filter(r => r.status === 'available').length})
                  {closestResponder && (
                    <span className="text-sm text-green-600 font-normal ml-2">
                      • Closest: {closestResponder.name} ({getResponderDistance(closestResponder._id)})
                    </span>
                  )}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-40 overflow-y-auto">
                  {responders.map((responder) => (
                    <div
                      key={responder._id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedResponder?._id === responder._id
                          ? 'border-blue-500 bg-blue-50'
                          : responder._id === closestResponder?._id
                          ? 'border-green-500 bg-green-50'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                      onClick={() => setSelectedResponder(responder)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-slate-800">{responder.name}</p>
                            {responder._id === closestResponder?._id && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">
                                🏆 Closest
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mb-1">{responder.responderType}</p>
                          <p className={`text-xs font-medium ${getDistanceColor(distances[responder._id] || 0)}`}>
                            📍 {getResponderDistance(responder._id)} away
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            responder.status === 'available' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {responder.status}
                          </span>
                          {responder.status === "available" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAssign(responder._id);
                              }}
                              disabled={isLoading}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                            >
                              Assign
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {responders.length === 0 && !isLoading && (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">😕</div>
                <h3 className="font-semibold text-slate-700 mb-2">No Responders Found</h3>
                <p className="text-slate-600">No available responders for this emergency type in your area.</p>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 flex justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => fetchRespondersByType(sos.emergency)}
            disabled={isLoading}
            className="px-6 py-2 bg-slate-600 text-white rounded-xl hover:bg-slate-700 font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <span>🔄</span>
            Refresh Responders
          </button>
        </div>
      </div>
    </div>
  );
}