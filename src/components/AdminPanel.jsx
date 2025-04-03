import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/AdminPanel.css";
import ProfileForm from "../components/ProfileForm";

const AdminPanel = () => {
    const [profiles, setProfiles] = useState([]);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [mapVisible, setMapVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [profileToDelete, setProfileToDelete] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchProfiles = async () => {
            setLoading(true);
            try {
                const savedProfiles = JSON.parse(localStorage.getItem("profiles")) || [];
                setProfiles(savedProfiles);
            } catch (error) {
                console.error("Error fetching profiles:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfiles();
    }, []);

    useEffect(() => {
        handleCloseMap();
    }, [location.pathname]);

    const openModal = (profile = null) => {
        setSelectedProfile(profile);
        setIsEditMode(!!profile);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedProfile(null);
        setIsModalOpen(false);
    };

    const addProfile = (newProfile) => {
        const profileWithId = { ...newProfile, id: Date.now() };
        localStorage.setItem("profiles", JSON.stringify([...profiles, profileWithId]));
        setProfiles([...profiles, profileWithId]);
        closeModal();
    };

    const updateProfile = (updatedProfile) => {
        const updatedProfiles = profiles.map((profile) =>
            profile.id === updatedProfile.id ? updatedProfile : profile
        );
        localStorage.setItem("profiles", JSON.stringify([...updatedProfiles]));
        setProfiles(updatedProfiles);
        closeModal();
    };

    const confirmDeleteProfile = (profile) => {
        setProfileToDelete(profile);
        setIsDeleteModalOpen(true);
    };

    const deleteProfile = async () => {
        setLoading(true);
        try {
            const updatedProfiles = profiles.filter((profile) => profile.id !== profileToDelete.id);
            localStorage.setItem("profiles", JSON.stringify(updatedProfiles));
            setProfiles(updatedProfiles);
        } catch (error) {
            console.error("Error deleting profile:", error);
        } finally {
            setLoading(false);
            setIsDeleteModalOpen(false);
        }
    };

    const viewProfileDetails = (profile) => {
        setSelectedProfile(profile);
        setMapVisible(true);
    };

    const handleCloseMap = () => {
        setMapVisible(false);
        setSelectedProfile(null);
    };

    const initializeMap = async () => {
        if (selectedProfile) {
            try {
                const map = L.map("map").setView([51.505, -0.09], 13);
                L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    maxZoom: 19,
                }).addTo(map);

                const geocodeURL = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                    selectedProfile.address
                )}`;

                const response = await axios.get(geocodeURL);
                const data = response.data;
                if (data.length > 0) {
                    const { lat, lon } = data[0];
                    map.setView([lat, lon], 13);
                    L.marker([lat, lon]).addTo(map);
                } else {
                    console.error("Address not found");
                }
            } catch (error) {
                console.error("Error fetching geocode:", error);
            }
        }
    };

    const filteredProfiles = profiles.filter(
        (profile) =>
            profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            profile.address.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        if (mapVisible) {
            initializeMap();
        }
    }, [mapVisible, selectedProfile]);

    return (
        <div className="admin-panel">
            <div className="header">
                <h1 onClick={() => navigate("/")} style={{ cursor: "pointer" }}>Admin Panel</h1>
                <button className="add-btn" onClick={() => openModal()}>Add Profile</button>
            </div>

            <input
                type="text"
                placeholder="Search profiles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-bar"
            />

            {loading ? (
                <div className="loading">Loading...</div>
            ) : (
                <table className="profile-table">
                    <thead>
                        <tr>
                            <th>Sr No.</th>
                            <th>Profile Pic</th>
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
                                <td onClick={() => navigate(`/profile/${profile.id}`)} style={{ cursor: "pointer" }}>
                                    <img src={profile.imageFile} alt="Profile" className="profile-img" />
                                </td>
                                <td>{profile.name}</td>
                                <td>{profile.email}</td>
                                <td>{profile.description}</td>
                                <td>{profile.address}</td>
                                <td>
                                    <button className="edit-btn" onClick={() => openModal(profile)}>Edit</button>
                                    <button className="delete-btn" onClick={() => confirmDeleteProfile(profile)}>Delete</button>
                                    <button className="summary-btn" onClick={() => viewProfileDetails(profile)}>
                                        Locate
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Map Modal */}
            {mapVisible && (
                <div className="map-modal">
                    <div className="map-modal-content">
                        <button className="close-map-btn" onClick={handleCloseMap}>Close</button>
                        <h2>{selectedProfile.name.split(" ")[0]}'s Location</h2>
                        <div id="map" className="map-container"></div>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <ProfileForm
                            onSubmit={isEditMode ? updateProfile : addProfile}
                            profile={selectedProfile}
                            closeModal={closeModal}
                        />
                    </div>
                </div>
            )}

            {isDeleteModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Confirm Deletion</h2>
                        <p>Are you sure you want to delete this profile?</p>
                        <button className="cancel-btn" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
                        <button className="confirm-delete-btn" onClick={deleteProfile}>Delete</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;