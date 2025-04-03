import React, { useState, useEffect } from "react";
import "../styles/ProfileForm.css";

const ProfileForm = ({ onSubmit, profile, closeModal }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    email: "",
    phone: "",
    interests: "",
    imageFile: "",
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (profile) {
      setFormData(profile);
      setImagePreview(profile.imageFile ? profile.imageFile : null);
    } else {
      setFormData({
        name: "",
        description: "",
        address: "",
        email: "",
        phone: "",
        interests: "",
        imageFile: "",
      });
      setImagePreview(null);
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "imageFile") {
      const file = files[0];

      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result;
          setFormData({ ...formData, imageFile: base64String });
          setImagePreview(base64String);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="profile-form-container">
      <h2 className="form-title">
        {profile ? "Update Profile" : "Add Profile"}
      </h2>
      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>About yourself!</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>City</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input
            type="number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>
      
        <div className="form-group">
          <label>Upload Image</label>
          <input
            type="file"
            name="imageFile"
            onChange={handleChange}
            accept="image/*"
          />
        </div>
        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="Profile Preview" />
            <p>Uploaded image</p>
          </div>
        )}
        <div className="form-actions">
          <button type="button" className="close-btn" onClick={closeModal}>
            Close
          </button>
          <button type="submit" className="submit-btn">
            {profile ? "Update Profile" : "Add Profile"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;