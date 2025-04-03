import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../styles/ProfileDetails.css";

const ProfileDetails = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedProfiles = JSON.parse(localStorage.getItem("profiles"));
    if (storedProfiles) {
      const foundProfile = storedProfiles.find(
        (profile) => profile.id === parseInt(id)
      );

      if (foundProfile) {
        setProfile(foundProfile);
        setLoading(false);
      } else {
        setError("Profile not found");
        setLoading(false);
      }
    } else {
      setError("No profiles found in storage");
      setLoading(false);
    }
  }, [id]);

  if (loading) return <div className="loading">Loading profile details...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="profile-details-container">
      <div className="profile-card">
        {profile.imageFile && (
          <img
            src={profile.imageFile}
            alt={`${profile.name}'s Profile`}
            className="profile-picture"
          />
        )}

        <h2 className="profile-name">{profile.name}</h2>
        <h2 className="profile-email">{profile.email}</h2>
        <p className="profile-info">
          <strong>Interests:</strong> {profile.interests}
        </p>
        <p className="profile-info">
          <strong>Address:</strong> {profile.address}
        </p>
        <p className="profile-info">
          <strong>Description:</strong> {profile.description}
        </p>
        <p className="contact-button">Contact No.: {profile.phone}</p>
      </div>
    </div>
  );
};

export default ProfileDetails;
