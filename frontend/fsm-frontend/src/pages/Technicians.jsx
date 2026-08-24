import { useEffect, useState } from "react";
import {
    createTechnician,
    getTechnicians
} from "../services/api";
import "./Technicians.css";

function Technicians() {

    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        userId: 3,
        employeeCode: "",
        fullName: "",
        email: "",
        phone: "",
        specialization: "",
        status: "AVAILABLE",
        rating: 0
    });

    const loadTechnicians = async () => {
        try {
            const data = await getTechnicians();

            setTechnicians(
                Array.isArray(data) ? data : []
            );

        } catch (error) {
            console.error(
                "Failed to load technicians:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTechnicians();
    }, []);

    const handleChange = (event) => {

        const { name, value } = event.target;

        setForm({
            ...form,
            [name]: value
        });
    };

    const handleSubmit = async (event) => {

        event.preventDefault();

        setSaving(true);

        try {

            await createTechnician({
                ...form,
                userId: Number(form.userId),
                rating: Number(form.rating)
            });

            setForm({
                userId: 3,
                employeeCode: "",
                fullName: "",
                email: "",
                phone: "",
                specialization: "",
                status: "AVAILABLE",
                rating: 0
            });

            await loadTechnicians();

            alert("Technician created successfully!");

        } catch (error) {

            console.error(
                "Failed to create technician:",
                error
            );

            alert(
                "Failed to create technician. Check backend console."
            );

        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="technician-page">

            <div className="technician-header">

                <div>
                    <h1>Technician Management</h1>

                    <p>
                        Manage technicians and their
                        professional information
                    </p>
                </div>

                <div className="technician-count">
                    {technicians.length} Technicians
                </div>

            </div>


            <div className="technician-card">

                <div className="card-title">

                    <h2>Add New Technician</h2>

                    <p>
                        Enter the technician details below
                    </p>

                </div>


                <form onSubmit={handleSubmit}>

                    <div className="form-grid">

                        <div className="form-group">

                            <label>
                                Employee Code
                            </label>

                            <input
                                name="employeeCode"
                                placeholder="Example: TECH001"
                                value={form.employeeCode}
                                onChange={handleChange}
                                required
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Full Name
                            </label>

                            <input
                                name="fullName"
                                placeholder="Enter technician name"
                                value={form.fullName}
                                onChange={handleChange}
                                required
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Email
                            </label>

                            <input
                                type="email"
                                name="email"
                                placeholder="Enter email"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Phone
                            </label>

                            <input
                                name="phone"
                                placeholder="Enter phone number"
                                value={form.phone}
                                onChange={handleChange}
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Specialization
                            </label>

                            <input
                                name="specialization"
                                placeholder="Example: Electrical"
                                value={form.specialization}
                                onChange={handleChange}
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Status
                            </label>

                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                            >

                                <option value="AVAILABLE">
                                    Available
                                </option>

                                <option value="BUSY">
                                    Busy
                                </option>

                                <option value="OFFLINE">
                                    Offline
                                </option>

                            </select>

                        </div>


                        <div className="form-group">

                            <label>
                                Rating
                            </label>

                            <input
                                type="number"
                                name="rating"
                                min="0"
                                max="5"
                                step="0.1"
                                value={form.rating}
                                onChange={handleChange}
                            />

                        </div>

                    </div>


                    <div className="form-actions">

                        <button
                            type="submit"
                            className="add-technician-btn"
                            disabled={saving}
                        >

                            {saving
                                ? "Creating..."
                                : "+ Add Technician"}

                        </button>

                    </div>

                </form>

            </div>


            <div className="technician-list-section">

                <div className="list-header">

                    <div>

                        <h2>Technicians</h2>

                        <p>
                            View all registered technicians
                        </p>

                    </div>

                </div>


                {loading ? (

                    <div className="loading">
                        Loading technicians...
                    </div>

                ) : technicians.length === 0 ? (

                    <div className="empty-state">

                        <h3>
                            No Technicians Found
                        </h3>

                        <p>
                            Add your first technician
                            using the form above.
                        </p>

                    </div>

                ) : (

                    <div className="technician-grid">

                        {technicians.map((technician) => (

                            <div
                                className="technician-item"
                                key={technician.id}
                            >

                                <div className="technician-icon">

                                    {(
                                        technician.fullName ||
                                        technician.name ||
                                        "T"
                                    )
                                        .charAt(0)
                                        .toUpperCase()}

                                </div>


                                <div className="technician-info">

                                    <div className="technician-top">

                                        <div>

                                            <span className="employee-code">

                                                {technician.employeeCode ||
                                                    "N/A"}

                                            </span>

                                            <h3>

                                                {technician.fullName ||
                                                    technician.name ||
                                                    "Unnamed Technician"}

                                            </h3>

                                        </div>


                                        <span
                                            className={
                                                `status-badge status-${(
                                                    technician.status ||
                                                    "AVAILABLE"
                                                ).toLowerCase()}`
                                            }
                                        >

                                            {technician.status ||
                                                "AVAILABLE"}

                                        </span>

                                    </div>


                                    <p>
                                        <strong>Email:</strong>{" "}
                                        {technician.email || "N/A"}
                                    </p>


                                    <p>
                                        <strong>Phone:</strong>{" "}
                                        {technician.phone || "N/A"}
                                    </p>


                                    <p>
                                        <strong>
                                            Specialization:
                                        </strong>{" "}
                                        {technician.specialization ||
                                            "N/A"}
                                    </p>


                                    <p>
                                        <strong>
                                            Rating:
                                        </strong>{" "}
                                        ⭐{" "}
                                        {technician.rating ??
                                            "0.00"}
                                    </p>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>

        </div>
    );
}

export default Technicians;