import React, { useState, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/ProfileList.css";

const ProfileList = () => {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [mapVisible, setMapVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const savedProfiles = JSON.parse(localStorage.getItem("profiles")) || [];
    setProfiles(savedProfiles);
  }, []);

  useEffect(() => {
    handleCloseMap();
  }, [location.pathname]);

  const viewProfileDetails = (profile) => {
    setSelectedProfile(profile);
    setMapVisible(true);
  };

  const handleCloseMap = () => {
    setMapVisible(false);
    setSelectedProfile(null);
  };

  const initializeMap = () => {
    if (selectedProfile) {
      const map = L.map("map").setView([51.505, -0.09], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      const geocodeURL = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        selectedProfile.address
      )}`;

      fetch(geocodeURL)
        .then((response) => response.json())
        .then((data) => {
          if (data.length > 0) {
            const { lat, lon } = data[0];
            map.setView([lat, lon], 13);
            L.marker([lat, lon]).addTo(map);
          } else {
            console.error("Address not found");
          }
        })
        .catch((error) => console.error("Error fetching geocode:", error));
    }
  };

  useEffect(() => {
    if (mapVisible) {
      initializeMap();
    }
  }, [mapVisible, selectedProfile]);

  const filteredProfiles = profiles.filter(
    (profile) =>
      profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="profile-container">
      <h1 className="profile-heading">Profile List</h1>

      <input
        type="text"
        placeholder="Search profiles..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
      />

      <button onClick={() => navigate("/admin")} className="admin-button">
        Admin Panel
      </button>

      {filteredProfiles.length === 0 ? (
        <div className="no-profiles">
          No profiles to show.
          <p>You can create one by navigating to Admin Panel:</p>
          <button onClick={() => navigate("/admin")} className="admin-button">
            Go To Admin Panel
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="profile-table">
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>Profile Image</th>
                <th>Name</th>
                <th>Email</th>
                <th>Description</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfiles.map((profile, index) => (
                <tr key={profile.id}>
                  <td>{index + 1}</td>
                  <td>
                    <img src={profile.imageFile} className="profile-image" alt="Profile" />
                  </td>
                  <td>{profile.name}</td>
                  <td>{profile.email}</td>
                  <td>{profile.description}</td>
                  <td>{profile.address}</td>
                  <td>
                    <button className="summary-button" onClick={() => viewProfileDetails(profile)}>
                      Summary
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {mapVisible && (
        <div className="map-overlay">
          <div className="map-container">
            <button className="close-map" onClick={handleCloseMap}>Close Map</button>
            <h2>{selectedProfile.name.split(" ")[0]}'s Location</h2>
            <div id="map" className="map"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileList;